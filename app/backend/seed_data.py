"""Seed demo data for CAPACITY CONNECT."""
import os
from datetime import datetime, timezone, timedelta
from auth_utils import hash_password, new_user_id
from models import now_iso


SKILLS = [
    {"skill_id": "skill_lead01", "name": "Strategic Leadership", "category": "Leadership", "description": "Vision-setting, decision making, executive presence"},
    {"skill_id": "skill_lead02", "name": "People Management", "category": "Leadership", "description": "1:1s, coaching, performance conversations"},
    {"skill_id": "skill_comm01", "name": "Executive Communication", "category": "Communication", "description": "Board-level presenting, written narratives"},
    {"skill_id": "skill_comm02", "name": "Stakeholder Alignment", "category": "Communication", "description": "Cross-functional influence and negotiation"},
    {"skill_id": "skill_data01", "name": "Data Storytelling", "category": "Data & Analytics", "description": "Turning insights into decisions"},
    {"skill_id": "skill_data02", "name": "SQL & Analytics", "category": "Data & Analytics", "description": "Querying, dashboards, metric design"},
    {"skill_id": "skill_tech01", "name": "Cloud Architecture", "category": "Technology", "description": "Distributed systems, AWS, GCP"},
    {"skill_id": "skill_tech02", "name": "AI & Automation", "category": "Technology", "description": "LLMs, agent workflows, automation design"},
    {"skill_id": "skill_prod01", "name": "Product Discovery", "category": "Product", "description": "User research, opportunity framing"},
    {"skill_id": "skill_prod02", "name": "Roadmap Planning", "category": "Product", "description": "Prioritization frameworks, quarterly planning"},
    {"skill_id": "skill_ops01", "name": "Operational Excellence", "category": "Operations", "description": "Process design, continuous improvement"},
    {"skill_id": "skill_ops02", "name": "Change Management", "category": "Operations", "description": "Leading transformation, adoption playbooks"},
]


def _lesson(order: int, title: str, minutes: int, content: str) -> dict:
    return {
        "lesson_id": f"lesson_{order:03d}_{title[:6].replace(' ', '').lower()}",
        "title": title,
        "content": content,
        "duration_min": minutes,
        "order": order,
    }


def _q(qid: str, prompt: str, options: list[tuple[str, str]], correct: str) -> dict:
    return {
        "question_id": qid,
        "prompt": prompt,
        "options": [{"option_id": oid, "text": t} for oid, t in options],
        "correct_option_id": correct,
    }


COURSES = [
    {
        "course_id": "course_lead_foundations",
        "title": "Leading With Clarity",
        "subtitle": "Executive leadership foundations for senior operators",
        "description": "A high-signal program covering vision-setting, decision architecture, and running high-performing teams. Built around real case studies from operators at global technology companies.",
        "category": "Leadership",
        "level": "Intermediate",
        "duration_hours": 6,
        "thumbnail": "https://images.unsplash.com/photo-1758691736490-03d39c292d7a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjBidXNpbmVzcyUyMHRlY2hub2xvZ3klMjBwcmVzZW50YXRpb258ZW58MHx8fHwxNzg4NTkxNjE2fDA&ixlib=rb-4.1.0&q=85",
        "skills": ["skill_lead01", "skill_lead02", "skill_comm02"],
        "trainer_id": "TRAINER_DEMO",
        "trainer_name": "Maya Vance",
        "lessons": [
            _lesson(1, "The Operating System of Modern Leaders", 22, "Frameworks that separate effective leaders from managers. We examine the five inputs a leader controls and how to compound them."),
            _lesson(2, "Decision Architecture", 28, "Reversible vs one-way-door decisions, expected value, and how to lead groups through ambiguity."),
            _lesson(3, "Running the Weekly Cadence", 18, "The precise cadence high-performing teams use: 1:1s, staff meetings, reviews, and retros."),
            _lesson(4, "Coaching for Growth", 24, "The GROW model, feedback loops, and how to develop future leaders on your team."),
        ],
        "quiz": {
            "quiz_id": "quiz_lead_foundations",
            "title": "Leading With Clarity — Final Assessment",
            "pass_score": 70,
            "questions": [
                _q("q1", "Which decision type warrants slower, more deliberate analysis?", [("a", "Two-way door (reversible)"), ("b", "One-way door (irreversible)"), ("c", "Delegated"), ("d", "Automated")], "b"),
                _q("q2", "The GROW coaching model stands for:", [("a", "Goal, Reality, Options, Way forward"), ("b", "Guide, Review, Own, Win"), ("c", "Grow, Retain, Optimize, Widen"), ("d", "Goal, Result, Outcome, Win")], "a"),
                _q("q3", "The single highest-leverage recurring meeting for a manager is:", [("a", "All-hands"), ("b", "1:1s"), ("c", "Retros"), ("d", "Standups")], "b"),
                _q("q4", "Vision statements are most effective when:", [("a", "Long and detailed"), ("b", "Concrete, memorable, time-bound"), ("c", "Focused on process"), ("d", "Kept confidential")], "b"),
                _q("q5", "Feedback in high-trust teams is best when it is:", [("a", "Anonymous"), ("b", "Timely and specific"), ("c", "Delivered quarterly"), ("d", "Written only")], "b"),
            ],
        },
    },
    {
        "course_id": "course_data_storytelling",
        "title": "Data Storytelling for Executives",
        "subtitle": "Turn dashboards into decisions",
        "description": "Move beyond charts. Learn narrative structure, executive framing, and how to communicate quantitative insight so it changes behavior.",
        "category": "Data & Analytics",
        "level": "Intermediate",
        "duration_hours": 4,
        "thumbnail": "https://images.unsplash.com/photo-1758691736545-5c33b6255dca?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBidXNpbmVzcyUyMHRlY2hub2xvZ3klMjBwcmVzZW50YXRpb258ZW58MHx8fHwxNzg4NTkxNjE2fDA&ixlib=rb-4.1.0&q=85",
        "skills": ["skill_data01", "skill_comm01"],
        "trainer_id": "TRAINER_DEMO",
        "trainer_name": "Maya Vance",
        "lessons": [
            _lesson(1, "The Insight Sandwich", 16, "Frame every data narrative with context → insight → recommendation."),
            _lesson(2, "Choosing the Right Chart", 20, "Match the message to the visual: comparison, distribution, composition, trend."),
            _lesson(3, "Executive Framing", 18, "The BLUF principle. Leading with the answer, not the analysis."),
        ],
        "quiz": {
            "quiz_id": "quiz_data_story",
            "title": "Data Storytelling — Final Assessment",
            "pass_score": 70,
            "questions": [
                _q("q1", "BLUF stands for:", [("a", "Bottom Line Up Front"), ("b", "Big Lasting Useful Framework"), ("c", "Best Level User Framing"), ("d", "Balanced Line Under Facts")], "a"),
                _q("q2", "For comparing categories, the best default chart is:", [("a", "Pie chart"), ("b", "Bar chart"), ("c", "Line chart"), ("d", "Scatter plot")], "b"),
                _q("q3", "A trend over time is most clearly shown by:", [("a", "Bar chart"), ("b", "Line chart"), ("c", "Heatmap"), ("d", "Pie chart")], "b"),
                _q("q4", "Executive slides should generally:", [("a", "Start with the recommendation"), ("b", "Start with methodology"), ("c", "Save the answer for the end"), ("d", "Only show raw data")], "a"),
            ],
        },
    },
    {
        "course_id": "course_ai_automation",
        "title": "Applied AI & Automation at Work",
        "subtitle": "Ship AI-augmented workflows this quarter",
        "description": "A pragmatic tour of LLMs, agents, and automation patterns. Build automation blueprints you can apply to your own workflows.",
        "category": "Technology",
        "level": "Advanced",
        "duration_hours": 8,
        "thumbnail": "https://images.unsplash.com/photo-1644088379091-d574269d422f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhcmslMjBkYXRhJTIwdmlzdWFsaXphdGlvbiUyMG5lb24lMjBub2Rlc3xlbnwwfHx8fDE3ODg1OTE2MTV8MA&ixlib=rb-4.1.0&q=85",
        "skills": ["skill_tech02", "skill_ops01"],
        "trainer_id": "TRAINER_DEMO",
        "trainer_name": "Maya Vance",
        "lessons": [
            _lesson(1, "Mental Models for LLMs", 22, "How large language models actually work — enough to reason about their strengths and failure modes."),
            _lesson(2, "Prompt Engineering, Beyond Hacks", 20, "Structured prompts, few-shot patterns, and evaluation-driven iteration."),
            _lesson(3, "Agent Workflows", 26, "Tool use, planning, retrieval, and when NOT to use agents."),
            _lesson(4, "Automation ROI Modeling", 18, "Quantifying time saved, quality lift, and risk-adjusted value."),
        ],
        "quiz": {
            "quiz_id": "quiz_ai_auto",
            "title": "Applied AI — Final Assessment",
            "pass_score": 70,
            "questions": [
                _q("q1", "The most reliable way to improve LLM output on a task is:", [("a", "Longer prompts"), ("b", "Structured evaluation and iteration"), ("c", "Random sampling"), ("d", "Warmer temperature")], "b"),
                _q("q2", "A good default when an agent has more than ~7 tools is to:", [("a", "Add all tools to every step"), ("b", "Retrieve or filter tools by task"), ("c", "Increase temperature"), ("d", "Remove system prompt")], "b"),
                _q("q3", "Retrieval-augmented generation (RAG) primarily addresses:", [("a", "Latency"), ("b", "Grounding on private/fresh data"), ("c", "Cost"), ("d", "Rate limiting")], "b"),
                _q("q4", "The best automation candidates share which trait?", [("a", "Highly ambiguous"), ("b", "Repeatable with clear success criteria"), ("c", "Rare, high-stakes"), ("d", "Fully manual")], "b"),
            ],
        },
    },
    {
        "course_id": "course_product_discovery",
        "title": "Continuous Product Discovery",
        "subtitle": "Talk to users, find opportunities, ship what matters",
        "description": "Master interviewing, opportunity trees, and evidence-based roadmapping. Reduce risk and increase impact in every quarter.",
        "category": "Product",
        "level": "Intermediate",
        "duration_hours": 5,
        "thumbnail": "https://images.unsplash.com/photo-1750969185331-e03829f72c7d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHw0fHxhYnN0cmFjdCUyMGRhcmslMjBkYXRhJTIwdmlzdWFsaXphdGlvbiUyMG5lb24lMjBub2Rlc3xlbnwwfHx8fDE3ODg1OTE2MTV8MA&ixlib=rb-4.1.0&q=85",
        "skills": ["skill_prod01", "skill_prod02"],
        "trainer_id": "TRAINER_DEMO",
        "trainer_name": "Maya Vance",
        "lessons": [
            _lesson(1, "The Continuous Discovery Habit", 18, "Weekly touchpoints with users instead of quarterly research sprints."),
            _lesson(2, "Opportunity Solution Trees", 22, "Structuring your thinking from outcome → opportunity → solution → assumption."),
            _lesson(3, "Interviewing for Insight", 20, "Behavioral questions, avoiding leading, and detecting narrative fabrication."),
        ],
        "quiz": {
            "quiz_id": "quiz_product_disc",
            "title": "Product Discovery — Final Assessment",
            "pass_score": 70,
            "questions": [
                _q("q1", "The best interview questions ask about:", [("a", "Hypothetical futures"), ("b", "Past specific behavior"), ("c", "Feature preferences"), ("d", "Price willingness")], "b"),
                _q("q2", "An opportunity tree connects outcomes to:", [("a", "Solutions"), ("b", "Opportunities → solutions → assumptions"), ("c", "OKRs only"), ("d", "Deadlines")], "b"),
                _q("q3", "Continuous discovery cadence is typically:", [("a", "Once per year"), ("b", "Weekly"), ("c", "Once per quarter"), ("d", "Every release")], "b"),
            ],
        },
    },
    {
        "course_id": "course_change_mgmt",
        "title": "Change Management at Scale",
        "subtitle": "Lead adoption, reduce friction",
        "description": "Frameworks for driving transformation programs across large organizations, with playbooks for adoption, communication, and resistance.",
        "category": "Operations",
        "level": "Advanced",
        "duration_hours": 5,
        "thumbnail": "https://images.unsplash.com/photo-1758691736490-03d39c292d7a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjBidXNpbmVzcyUyMHRlY2hub2xvZ3klMjBwcmVzZW50YXRpb258ZW58MHx8fHwxNzg4NTkxNjE2fDA&ixlib=rb-4.1.0&q=85",
        "skills": ["skill_ops02", "skill_comm02"],
        "trainer_id": "TRAINER_DEMO",
        "trainer_name": "Maya Vance",
        "lessons": [
            _lesson(1, "The Adoption Curve", 20, "Where friction happens and how to design programs around it."),
            _lesson(2, "Communication Cascades", 18, "Multi-tier messaging that actually reaches the front line."),
            _lesson(3, "Handling Resistance", 22, "Reframing resistance as signal, not obstacle."),
        ],
        "quiz": {
            "quiz_id": "quiz_change_mgmt",
            "title": "Change Management — Final Assessment",
            "pass_score": 70,
            "questions": [
                _q("q1", "Resistance to change is best treated as:", [("a", "An obstacle to remove"), ("b", "Signal to be understood"), ("c", "A morale issue"), ("d", "A leadership failure")], "b"),
                _q("q2", "Multi-tier messaging exists because:", [("a", "It saves cost"), ("b", "Messages fade across organizational layers"), ("c", "Legal requires it"), ("d", "It's tradition")], "b"),
                _q("q3", "Adoption is typically slowest for:", [("a", "Innovators"), ("b", "Laggards"), ("c", "Early majority"), ("d", "Early adopters")], "b"),
            ],
        },
    },
    {
        "course_id": "course_cloud_arch",
        "title": "Cloud Architecture Essentials",
        "subtitle": "Design resilient systems on AWS & GCP",
        "description": "Distributed systems fundamentals with practical AWS and GCP patterns. Covers reliability, cost, and scaling.",
        "category": "Technology",
        "level": "Intermediate",
        "duration_hours": 7,
        "thumbnail": "https://images.unsplash.com/photo-1644088379091-d574269d422f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhcmslMjBkYXRhJTIwdmlzdWFsaXphdGlvbiUyMG5lb24lMjBub2Rlc3xlbnwwfHx8fDE3ODg1OTE2MTV8MA&ixlib=rb-4.1.0&q=85",
        "skills": ["skill_tech01"],
        "trainer_id": "TRAINER_DEMO",
        "trainer_name": "Maya Vance",
        "lessons": [
            _lesson(1, "The CAP Theorem, Practically", 20, "What you actually give up when you scale horizontally."),
            _lesson(2, "Reliability Patterns", 22, "Retries, circuit breakers, bulkheads, and idempotency."),
            _lesson(3, "Cost-Aware Design", 18, "Right-sizing, spot capacity, and the total-cost mindset."),
        ],
        "quiz": {
            "quiz_id": "quiz_cloud_arch",
            "title": "Cloud Architecture — Final Assessment",
            "pass_score": 70,
            "questions": [
                _q("q1", "CAP theorem trades off:", [("a", "Cost, Accuracy, Performance"), ("b", "Consistency, Availability, Partition tolerance"), ("c", "Concurrency, API, Persistence"), ("d", "Cache, Auth, Payload")], "b"),
                _q("q2", "A circuit breaker helps by:", [("a", "Reducing cost"), ("b", "Stopping repeated failing calls"), ("c", "Improving accuracy"), ("d", "Load balancing")], "b"),
                _q("q3", "Idempotent operations are safe to:", [("a", "Skip"), ("b", "Retry"), ("c", "Cache indefinitely"), ("d", "Log only")], "b"),
            ],
        },
    },
]


async def seed_all(db):
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    trainer_email = os.environ["TRAINER_EMAIL"].lower()
    learner_email = os.environ["LEARNER_EMAIL"].lower()

    admin_pw = os.environ["ADMIN_PASSWORD"]
    trainer_pw = os.environ["TRAINER_PASSWORD"]
    learner_pw = os.environ["LEARNER_PASSWORD"]

    # Users
    seeded_users = [
        {"email": admin_email, "name": "Alex Administrator", "role": "admin", "password": admin_pw, "title": "Head of L&D", "department": "People Operations"},
        {"email": trainer_email, "name": "Maya Vance", "role": "trainer", "password": trainer_pw, "title": "Principal Instructor", "department": "Capacity Studios"},
        {"email": learner_email, "name": "Jordan Reyes", "role": "learner", "password": learner_pw, "title": "Senior Program Manager", "department": "Global Operations"},
    ]

    role_to_uid = {}
    for u in seeded_users:
        existing = await db.users.find_one({"email": u["email"]}, {"_id": 0})
        if existing:
            role_to_uid[u["role"]] = existing["user_id"]
            # keep password fresh
            await db.users.update_one(
                {"email": u["email"]},
                {"$set": {"password_hash": hash_password(u["password"]), "role": u["role"], "name": u["name"], "title": u.get("title"), "department": u.get("department")}},
            )
            continue
        uid = new_user_id()
        role_to_uid[u["role"]] = uid
        await db.users.insert_one(
            {
                "user_id": uid,
                "email": u["email"],
                "name": u["name"],
                "role": u["role"],
                "title": u.get("title"),
                "department": u.get("department"),
                "picture": None,
                "password_hash": hash_password(u["password"]),
                "created_at": now_iso(),
            }
        )

    # Add a few extra demo learners to make admin analytics populated
    extra_learners = [
        ("priya.sharma@capacityconnect.com", "Priya Sharma", "Product Manager", "Product"),
        ("liam.oconnor@capacityconnect.com", "Liam O'Connor", "Data Analyst", "Analytics"),
        ("chen.wei@capacityconnect.com", "Chen Wei", "Engineering Lead", "Engineering"),
        ("ana.moreau@capacityconnect.com", "Ana Moreau", "Operations Specialist", "Operations"),
    ]
    extra_ids = []
    for email, name, title, dept in extra_learners:
        existing = await db.users.find_one({"email": email}, {"_id": 0})
        if existing:
            extra_ids.append(existing["user_id"])
            continue
        uid = new_user_id()
        extra_ids.append(uid)
        await db.users.insert_one(
            {
                "user_id": uid,
                "email": email,
                "name": name,
                "role": "learner",
                "title": title,
                "department": dept,
                "picture": None,
                "password_hash": hash_password("Learner@2026"),
                "created_at": now_iso(),
            }
        )

    # Skills catalog
    for s in SKILLS:
        await db.skills.update_one({"skill_id": s["skill_id"]}, {"$set": s}, upsert=True)

    # Courses (trainer_id -> real trainer uid)
    trainer_uid = role_to_uid["trainer"]
    trainer_name = "Maya Vance"
    for c in COURSES:
        c2 = {**c, "trainer_id": trainer_uid, "trainer_name": trainer_name, "created_at": now_iso(), "published": True, "rating": 4.7, "enrolled_count": 0}
        await db.courses.update_one({"course_id": c2["course_id"]}, {"$set": c2}, upsert=True)

    # Learner skill profile (for the main demo learner)
    learner_uid = role_to_uid["learner"]
    learner_skills = [
        {"skill_id": "skill_lead01", "name": "Strategic Leadership", "category": "Leadership", "current_level": 55, "desired_level": 85},
        {"skill_id": "skill_lead02", "name": "People Management", "category": "Leadership", "current_level": 60, "desired_level": 80},
        {"skill_id": "skill_comm01", "name": "Executive Communication", "category": "Communication", "current_level": 45, "desired_level": 85},
        {"skill_id": "skill_comm02", "name": "Stakeholder Alignment", "category": "Communication", "current_level": 65, "desired_level": 80},
        {"skill_id": "skill_data01", "name": "Data Storytelling", "category": "Data & Analytics", "current_level": 40, "desired_level": 80},
        {"skill_id": "skill_data02", "name": "SQL & Analytics", "category": "Data & Analytics", "current_level": 50, "desired_level": 70},
        {"skill_id": "skill_tech02", "name": "AI & Automation", "category": "Technology", "current_level": 35, "desired_level": 80},
        {"skill_id": "skill_prod01", "name": "Product Discovery", "category": "Product", "current_level": 55, "desired_level": 75},
        {"skill_id": "skill_ops02", "name": "Change Management", "category": "Operations", "current_level": 50, "desired_level": 80},
    ]
    await db.user_skills.update_one({"user_id": learner_uid}, {"$set": {"user_id": learner_uid, "skills": learner_skills, "updated_at": now_iso()}}, upsert=True)

    # Enrollments — learner is in-progress in 2, completed 1
    enrollments = [
        {
            "enrollment_id": "enr_demo_1", "user_id": learner_uid, "course_id": "course_lead_foundations",
            "progress": 50.0, "completed_lessons": ["lesson_001_theope", "lesson_002_decisi"],
            "quiz_score": None, "quiz_passed": False, "completed": False,
            "started_at": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(),
            "completed_at": None,
        },
        {
            "enrollment_id": "enr_demo_2", "user_id": learner_uid, "course_id": "course_ai_automation",
            "progress": 25.0, "completed_lessons": ["lesson_001_mental"],
            "quiz_score": None, "quiz_passed": False, "completed": False,
            "started_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
            "completed_at": None,
        },
        {
            "enrollment_id": "enr_demo_3", "user_id": learner_uid, "course_id": "course_data_storytelling",
            "progress": 100.0, "completed_lessons": ["lesson_001_theins", "lesson_002_choosi", "lesson_003_execut"],
            "quiz_score": 85, "quiz_passed": True, "completed": True,
            "started_at": (datetime.now(timezone.utc) - timedelta(days=20)).isoformat(),
            "completed_at": (datetime.now(timezone.utc) - timedelta(days=12)).isoformat(),
        },
    ]
    for enr in enrollments:
        await db.enrollments.update_one({"enrollment_id": enr["enrollment_id"]}, {"$set": enr}, upsert=True)

    # Extra learners enrolled in various courses (for admin analytics)
    import random
    random.seed(7)
    all_course_ids = [c["course_id"] for c in COURSES]
    for i, uid in enumerate(extra_ids):
        for cid in random.sample(all_course_ids, k=3):
            eid = f"enr_extra_{i}_{cid[:12]}"
            progress = random.choice([25.0, 50.0, 75.0, 100.0])
            completed = progress == 100.0
            await db.enrollments.update_one(
                {"enrollment_id": eid},
                {"$set": {
                    "enrollment_id": eid, "user_id": uid, "course_id": cid,
                    "progress": progress, "completed_lessons": [],
                    "quiz_score": random.randint(70, 95) if completed else None,
                    "quiz_passed": completed, "completed": completed,
                    "started_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 40))).isoformat(),
                    "completed_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 20))).isoformat() if completed else None,
                }},
                upsert=True,
            )

    # Certificate for completed course
    cert = {
        "certificate_id": "cert_demo_1",
        "user_id": learner_uid,
        "user_name": "Jordan Reyes",
        "course_id": "course_data_storytelling",
        "course_title": "Data Storytelling for Executives",
        "quiz_score": 85,
        "issued_at": (datetime.now(timezone.utc) - timedelta(days=12)).isoformat(),
    }
    await db.certificates.update_one({"certificate_id": cert["certificate_id"]}, {"$set": cert}, upsert=True)

    # Update enrolled_count on each course
    for cid in all_course_ids:
        count = await db.enrollments.count_documents({"course_id": cid})
        await db.courses.update_one({"course_id": cid}, {"$set": {"enrolled_count": count}})

    return {"admin": role_to_uid["admin"], "trainer": role_to_uid["trainer"], "learner": role_to_uid["learner"]}
