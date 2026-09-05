"""CAPACITY CONNECT — main FastAPI server."""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from io import BytesIO

from auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    set_auth_cookies,
    clear_auth_cookies,
    get_current_user,
    exchange_emergent_session,
    new_user_id,
)
from models import (
    RegisterInput,
    LoginInput,
    SessionInput,
    CourseCreateInput,
    QuizSubmission,
    SkillAssessmentInput,
    now_iso,
    new_id,
)
from certificate_gen import generate_certificate_pdf
from ai_service import generate_skill_gap_narrative
from seed_data import seed_all


mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="CAPACITY CONNECT API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("capacity_connect")


# --------- helpers ---------
async def current_user_dep(request: Request):
    return await get_current_user(request, db)


def require_roles(user: dict, *roles: str):
    if user.get("role") not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")


# --------- Auth: JWT ---------
@api.post("/auth/register")
async def register(payload: RegisterInput, response: Response):
    email = payload.email.lower()
    if payload.role == "admin":
        raise HTTPException(status_code=400, detail="Admin registration is not allowed")
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    uid = new_user_id()
    doc = {
        "user_id": uid,
        "email": email,
        "name": payload.name,
        "role": payload.role,
        "picture": None,
        "title": None,
        "department": None,
        "password_hash": hash_password(payload.password),
        "created_at": now_iso(),
    }
    await db.users.insert_one(doc)
    access = create_access_token(uid, email, payload.role)
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    doc.pop("password_hash", None)
    doc.pop("_id", None)
    return {"user": doc, "access_token": access}


@api.post("/auth/login")
async def login(payload: LoginInput, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access = create_access_token(user["user_id"], email, user["role"])
    refresh = create_refresh_token(user["user_id"])
    set_auth_cookies(response, access, refresh)
    user.pop("password_hash", None)
    user.pop("_id", None)
    return {"user": user, "access_token": access}


@api.post("/auth/logout")
async def logout(response: Response, request: Request):
    st = request.cookies.get("session_token")
    if st:
        await db.user_sessions.delete_one({"session_token": st})
    clear_auth_cookies(response)
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(current_user_dep)):
    return user


# --------- Auth: Emergent Google ---------
@api.post("/auth/google/session")
async def google_session(payload: SessionInput, response: Response):
    data = await exchange_emergent_session(payload.session_id)
    email = data["email"].lower()
    picture = data.get("picture")
    name = data.get("name") or email.split("@")[0]
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        uid = new_user_id()
        user = {
            "user_id": uid,
            "email": email,
            "name": name,
            "role": "learner",  # default role for Google sign-ins
            "picture": picture,
            "title": None,
            "department": None,
            "created_at": now_iso(),
        }
        await db.users.insert_one(user)
    else:
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"picture": picture, "name": name}})
        user["picture"] = picture
        user["name"] = name

    session_token = data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.update_one(
        {"session_token": session_token},
        {"$set": {"session_token": session_token, "user_id": user["user_id"], "expires_at": expires_at.isoformat()}},
        upsert=True,
    )
    response.set_cookie(
        key="session_token", value=session_token, httponly=True, secure=True,
        samesite="none", max_age=7 * 24 * 3600, path="/",
    )
    user.pop("password_hash", None)
    return {"user": user}


# --------- Skills ---------
@api.get("/skills")
async def list_skills():
    docs = await db.skills.find({}, {"_id": 0}).to_list(500)
    return docs


@api.get("/skills/me")
async def my_skills(user: dict = Depends(current_user_dep)):
    doc = await db.user_skills.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not doc:
        return {"user_id": user["user_id"], "skills": []}
    return doc


@api.put("/skills/me")
async def update_my_skills(payload: SkillAssessmentInput, user: dict = Depends(current_user_dep)):
    skills = [s.model_dump() for s in payload.skills]
    await db.user_skills.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"user_id": user["user_id"], "skills": skills, "updated_at": now_iso()}},
        upsert=True,
    )
    return {"ok": True, "skills": skills}


@api.get("/skills/gap-analysis")
async def skill_gap_analysis(user: dict = Depends(current_user_dep)):
    doc = await db.user_skills.find_one({"user_id": user["user_id"]}, {"_id": 0}) or {"skills": []}
    skills = doc.get("skills", [])
    for s in skills:
        s["gap"] = max(0, s["desired_level"] - s["current_level"])
    gaps = sorted([s for s in skills if s["gap"] > 0], key=lambda x: -x["gap"])
    top_gaps = gaps[:5]

    narrative = await generate_skill_gap_narrative(user["name"], skills, top_gaps)

    # rule-based recommendations: match courses covering top-gap skill_ids
    all_courses = await db.courses.find({"published": True}, {"_id": 0}).to_list(200)
    top_skill_ids = [g["skill_id"] for g in top_gaps]
    recs = []
    for c in all_courses:
        overlap = [sid for sid in c["skills"] if sid in top_skill_ids]
        if overlap:
            gap_sum = sum(
                next((g["gap"] for g in top_gaps if g["skill_id"] == sid), 0) for sid in overlap
            )
            recs.append({**c, "match_score": gap_sum, "matched_skills": overlap})
    recs.sort(key=lambda x: -x["match_score"])

    return {
        "skills": skills,
        "top_gaps": top_gaps,
        "narrative": narrative,
        "recommendations": recs[:6],
    }


# --------- Courses ---------
@api.get("/courses")
async def list_courses(category: str | None = None, level: str | None = None, q: str | None = None):
    query = {"published": True}
    if category and category != "All":
        query["category"] = category
    if level and level != "All":
        query["level"] = level
    docs = await db.courses.find(query, {"_id": 0}).to_list(500)
    if q:
        ql = q.lower()
        docs = [d for d in docs if ql in d["title"].lower() or ql in d["description"].lower()]
    return docs


@api.get("/courses/categories")
async def list_categories():
    cats = await db.courses.distinct("category")
    return sorted(cats)


@api.get("/courses/{course_id}")
async def get_course(course_id: str):
    doc = await db.courses.find_one({"course_id": course_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Course not found")
    return doc


@api.post("/courses")
async def create_course(payload: CourseCreateInput, user: dict = Depends(current_user_dep)):
    require_roles(user, "trainer", "admin")
    doc = {
        "course_id": new_id("course"),
        "title": payload.title,
        "subtitle": payload.subtitle,
        "description": payload.description,
        "category": payload.category,
        "level": payload.level,
        "duration_hours": payload.duration_hours,
        "thumbnail": payload.thumbnail or "https://images.unsplash.com/photo-1758691736490-03d39c292d7a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjBidXNpbmVzcyUyMHRlY2hub2xvZ3klMjBwcmVzZW50YXRpb258ZW58MHx8fHwxNzg4NTkxNjE2fDA&ixlib=rb-4.1.0&q=85",
        "skills": payload.skills,
        "trainer_id": user["user_id"],
        "trainer_name": user["name"],
        "lessons": [
            {
                "lesson_id": new_id("lesson"),
                "title": l.get("title", "Untitled"),
                "content": l.get("content", ""),
                "duration_min": int(l.get("duration_min", 15)),
                "order": int(l.get("order", i + 1)),
            }
            for i, l in enumerate(payload.lessons)
        ],
        "quiz": None,
        "rating": 4.6,
        "enrolled_count": 0,
        "published": True,
        "created_at": now_iso(),
    }
    await db.courses.insert_one(doc)
    doc.pop("_id", None)
    return doc


# --------- Enrollments ---------
@api.post("/enrollments/{course_id}")
async def enroll(course_id: str, user: dict = Depends(current_user_dep)):
    course = await db.courses.find_one({"course_id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    existing = await db.enrollments.find_one({"user_id": user["user_id"], "course_id": course_id}, {"_id": 0})
    if existing:
        return existing
    enr = {
        "enrollment_id": new_id("enr"),
        "user_id": user["user_id"],
        "course_id": course_id,
        "progress": 0.0,
        "completed_lessons": [],
        "quiz_score": None,
        "quiz_passed": False,
        "completed": False,
        "started_at": now_iso(),
        "completed_at": None,
    }
    await db.enrollments.insert_one(enr)
    await db.courses.update_one({"course_id": course_id}, {"$inc": {"enrolled_count": 1}})
    enr.pop("_id", None)
    return enr


@api.get("/enrollments/me")
async def my_enrollments(user: dict = Depends(current_user_dep)):
    enrs = await db.enrollments.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(200)
    # join course meta
    course_ids = [e["course_id"] for e in enrs]
    courses = await db.courses.find({"course_id": {"$in": course_ids}}, {"_id": 0}).to_list(200)
    cmap = {c["course_id"]: c for c in courses}
    for e in enrs:
        c = cmap.get(e["course_id"])
        if c:
            e["course_title"] = c["title"]
            e["course_subtitle"] = c["subtitle"]
            e["course_thumbnail"] = c["thumbnail"]
            e["course_category"] = c["category"]
            e["course_duration_hours"] = c["duration_hours"]
            e["total_lessons"] = len(c.get("lessons", []))
    return enrs


@api.post("/enrollments/{course_id}/lessons/{lesson_id}/complete")
async def complete_lesson(course_id: str, lesson_id: str, user: dict = Depends(current_user_dep)):
    course = await db.courses.find_one({"course_id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    enr = await db.enrollments.find_one({"user_id": user["user_id"], "course_id": course_id}, {"_id": 0})
    if not enr:
        raise HTTPException(status_code=404, detail="Not enrolled")
    completed = set(enr.get("completed_lessons", []))
    completed.add(lesson_id)
    total = len(course.get("lessons", []))
    progress = round(100.0 * len(completed) / max(1, total), 1)
    await db.enrollments.update_one(
        {"enrollment_id": enr["enrollment_id"]},
        {"$set": {"completed_lessons": list(completed), "progress": progress}},
    )
    return {"progress": progress, "completed_lessons": list(completed)}


@api.post("/enrollments/{course_id}/quiz/submit")
async def submit_quiz(course_id: str, submission: QuizSubmission, user: dict = Depends(current_user_dep)):
    course = await db.courses.find_one({"course_id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    quiz = course.get("quiz")
    if not quiz:
        raise HTTPException(status_code=400, detail="No quiz for this course")
    correct = 0
    total = len(quiz["questions"])
    ans_map = {a.question_id: a.option_id for a in submission.answers}
    for q in quiz["questions"]:
        if ans_map.get(q["question_id"]) == q["correct_option_id"]:
            correct += 1
    score = round(100 * correct / max(1, total))
    passed = score >= quiz["pass_score"]

    enr = await db.enrollments.find_one({"user_id": user["user_id"], "course_id": course_id}, {"_id": 0})
    if not enr:
        raise HTTPException(status_code=404, detail="Not enrolled")

    update = {"quiz_score": score, "quiz_passed": passed}
    cert_id = None
    if passed:
        update["completed"] = True
        update["completed_at"] = now_iso()
        update["progress"] = 100.0
        update["completed_lessons"] = [l["lesson_id"] for l in course["lessons"]]
        # issue certificate (idempotent)
        existing_cert = await db.certificates.find_one(
            {"user_id": user["user_id"], "course_id": course_id}, {"_id": 0}
        )
        if existing_cert:
            cert_id = existing_cert["certificate_id"]
        else:
            cert = {
                "certificate_id": new_id("cert"),
                "user_id": user["user_id"],
                "user_name": user["name"],
                "course_id": course_id,
                "course_title": course["title"],
                "quiz_score": score,
                "issued_at": now_iso(),
            }
            await db.certificates.insert_one(cert)
            cert_id = cert["certificate_id"]

    await db.enrollments.update_one({"enrollment_id": enr["enrollment_id"]}, {"$set": update})
    return {"score": score, "passed": passed, "certificate_id": cert_id, "correct": correct, "total": total}


# --------- Certificates ---------
@api.get("/certificates/me")
async def my_certificates(user: dict = Depends(current_user_dep)):
    docs = await db.certificates.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(200)
    return docs


@api.get("/certificates/{certificate_id}")
async def get_cert(certificate_id: str):
    doc = await db.certificates.find_one({"certificate_id": certificate_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return doc


@api.get("/certificates/{certificate_id}/pdf")
async def get_cert_pdf(certificate_id: str):
    doc = await db.certificates.find_one({"certificate_id": certificate_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Certificate not found")
    pdf_bytes = generate_certificate_pdf(
        user_name=doc["user_name"],
        course_title=doc["course_title"],
        certificate_id=doc["certificate_id"],
        issued_at=doc["issued_at"],
        quiz_score=doc["quiz_score"],
    )
    filename = f"CapacityConnect-Certificate-{certificate_id}.pdf"
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# --------- Trainer ---------
@api.get("/trainer/my-courses")
async def trainer_courses(user: dict = Depends(current_user_dep)):
    require_roles(user, "trainer", "admin")
    courses = await db.courses.find({"trainer_id": user["user_id"]} if user["role"] == "trainer" else {}, {"_id": 0}).to_list(200)
    return courses


@api.get("/trainer/analytics")
async def trainer_analytics(user: dict = Depends(current_user_dep)):
    require_roles(user, "trainer", "admin")
    q = {"trainer_id": user["user_id"]} if user["role"] == "trainer" else {}
    courses = await db.courses.find(q, {"_id": 0}).to_list(200)
    course_ids = [c["course_id"] for c in courses]
    enrollments = await db.enrollments.find({"course_id": {"$in": course_ids}}, {"_id": 0}).to_list(1000)
    per_course = []
    for c in courses:
        cenrs = [e for e in enrollments if e["course_id"] == c["course_id"]]
        completed = len([e for e in cenrs if e["completed"]])
        avg = round(sum(e["progress"] for e in cenrs) / max(1, len(cenrs)), 1) if cenrs else 0
        per_course.append({
            "course_id": c["course_id"],
            "title": c["title"],
            "enrolled": len(cenrs),
            "completed": completed,
            "avg_progress": avg,
            "completion_rate": round(100 * completed / max(1, len(cenrs)), 1) if cenrs else 0,
        })
    return {
        "total_courses": len(courses),
        "total_enrolled": len(enrollments),
        "total_completed": len([e for e in enrollments if e["completed"]]),
        "per_course": per_course,
    }


@api.get("/trainer/learners")
async def trainer_learners(user: dict = Depends(current_user_dep)):
    require_roles(user, "trainer", "admin")
    q = {"trainer_id": user["user_id"]} if user["role"] == "trainer" else {}
    courses = await db.courses.find(q, {"_id": 0}).to_list(200)
    course_ids = [c["course_id"] for c in courses]
    enrollments = await db.enrollments.find({"course_id": {"$in": course_ids}}, {"_id": 0}).to_list(1000)
    user_ids = list({e["user_id"] for e in enrollments})
    users = await db.users.find({"user_id": {"$in": user_ids}}, {"_id": 0, "password_hash": 0}).to_list(500)
    umap = {u["user_id"]: u for u in users}
    cmap = {c["course_id"]: c["title"] for c in courses}
    rows = []
    for e in enrollments:
        u = umap.get(e["user_id"])
        if not u:
            continue
        rows.append({
            "user_id": u["user_id"],
            "name": u["name"],
            "email": u["email"],
            "department": u.get("department"),
            "course_id": e["course_id"],
            "course_title": cmap.get(e["course_id"], ""),
            "progress": e["progress"],
            "completed": e["completed"],
        })
    return rows


# --------- Admin ---------
@api.get("/admin/analytics")
async def admin_analytics(user: dict = Depends(current_user_dep)):
    require_roles(user, "admin")
    total_users = await db.users.count_documents({})
    total_learners = await db.users.count_documents({"role": "learner"})
    total_trainers = await db.users.count_documents({"role": "trainer"})
    total_courses = await db.courses.count_documents({})
    total_enrollments = await db.enrollments.count_documents({})
    total_completed = await db.enrollments.count_documents({"completed": True})
    total_certs = await db.certificates.count_documents({})

    # top courses
    pipeline = [
        {"$group": {"_id": "$course_id", "enrolled": {"$sum": 1}, "completed": {"$sum": {"$cond": ["$completed", 1, 0]}}}},
        {"$sort": {"enrolled": -1}},
        {"$limit": 5},
    ]
    top_docs = await db.enrollments.aggregate(pipeline).to_list(5)
    course_ids = [d["_id"] for d in top_docs]
    courses = await db.courses.find({"course_id": {"$in": course_ids}}, {"_id": 0}).to_list(50)
    cmap = {c["course_id"]: c for c in courses}
    top_courses = []
    for d in top_docs:
        c = cmap.get(d["_id"])
        if not c:
            continue
        top_courses.append({
            "course_id": c["course_id"],
            "title": c["title"],
            "category": c["category"],
            "enrolled": d["enrolled"],
            "completed": d["completed"],
        })

    # category distribution
    cat_pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    cat_docs = await db.courses.aggregate(cat_pipeline).to_list(20)
    categories = [{"category": d["_id"], "count": d["count"]} for d in cat_docs]

    return {
        "total_users": total_users,
        "total_learners": total_learners,
        "total_trainers": total_trainers,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "total_completed": total_completed,
        "total_certificates": total_certs,
        "completion_rate": round(100 * total_completed / max(1, total_enrollments), 1),
        "top_courses": top_courses,
        "categories": categories,
    }


@api.get("/admin/users")
async def admin_users(user: dict = Depends(current_user_dep)):
    require_roles(user, "admin")
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    return users


# --------- Learner Dashboard ---------
@api.get("/learner/dashboard")
async def learner_dashboard(user: dict = Depends(current_user_dep)):
    enrs = await db.enrollments.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(200)
    active = [e for e in enrs if not e["completed"]]
    completed = [e for e in enrs if e["completed"]]
    certs = await db.certificates.count_documents({"user_id": user["user_id"]})
    return {
        "active_courses_count": len(active),
        "completed_courses_count": len(completed),
        "certificates_count": certs,
        "avg_progress": round(sum(e["progress"] for e in enrs) / max(1, len(enrs)), 1),
    }


# --------- Health ---------
@api.get("/")
async def root():
    return {"service": "capacity-connect", "status": "ok"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.courses.create_index("course_id", unique=True)
    await db.enrollments.create_index([("user_id", 1), ("course_id", 1)], unique=True)
    await db.certificates.create_index("certificate_id", unique=True)
    ids = await seed_all(db)
    logger.info(f"Seed complete: {ids}")

    # persist test credentials
    memory_dir = Path("/app/memory")
    memory_dir.mkdir(parents=True, exist_ok=True)
    (memory_dir / "test_credentials.md").write_text(
        f"""# CAPACITY CONNECT — Test Credentials

## Admin
- Email: {os.environ['ADMIN_EMAIL']}
- Password: {os.environ['ADMIN_PASSWORD']}
- Role: admin

## Trainer
- Email: {os.environ['TRAINER_EMAIL']}
- Password: {os.environ['TRAINER_PASSWORD']}
- Role: trainer

## Learner
- Email: {os.environ['LEARNER_EMAIL']}
- Password: {os.environ['LEARNER_PASSWORD']}
- Role: learner

## Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET  /api/auth/me
- POST /api/auth/google/session
"""
    )


@app.on_event("shutdown")
async def shutdown():
    client.close()
