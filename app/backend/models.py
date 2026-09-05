"""Pydantic models for CAPACITY CONNECT."""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime, timezone
import uuid


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


Role = Literal["learner", "trainer", "admin"]


# ---------- Auth ----------
class RegisterInput(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: Literal["learner", "trainer"] = "learner"


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class SessionInput(BaseModel):
    session_id: str


class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    role: Role
    picture: Optional[str] = None
    department: Optional[str] = None
    title: Optional[str] = None
    created_at: str


# ---------- Skills ----------
class Skill(BaseModel):
    skill_id: str = Field(default_factory=lambda: new_id("skill"))
    name: str
    category: str
    description: str


class UserSkill(BaseModel):
    """Current vs desired proficiency (0-100)."""
    skill_id: str
    name: str
    category: str
    current_level: int  # 0-100
    desired_level: int  # 0-100

    @property
    def gap(self) -> int:
        return max(0, self.desired_level - self.current_level)


# ---------- Courses ----------
class Lesson(BaseModel):
    lesson_id: str = Field(default_factory=lambda: new_id("lesson"))
    title: str
    content: str  # markdown-ish
    duration_min: int
    order: int


class QuestionOption(BaseModel):
    option_id: str
    text: str


class Question(BaseModel):
    question_id: str = Field(default_factory=lambda: new_id("q"))
    prompt: str
    options: List[QuestionOption]
    correct_option_id: str


class Quiz(BaseModel):
    quiz_id: str = Field(default_factory=lambda: new_id("quiz"))
    title: str
    questions: List[Question]
    pass_score: int = 70


class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")
    course_id: str = Field(default_factory=lambda: new_id("course"))
    title: str
    subtitle: str
    description: str
    category: str
    level: Literal["Beginner", "Intermediate", "Advanced"]
    duration_hours: int
    thumbnail: str
    skills: List[str]  # skill_ids covered
    trainer_id: str
    trainer_name: str
    lessons: List[Lesson]
    quiz: Optional[Quiz] = None
    rating: float = 4.7
    enrolled_count: int = 0
    published: bool = True
    created_at: str = Field(default_factory=now_iso)


class CourseCreateInput(BaseModel):
    title: str
    subtitle: str
    description: str
    category: str
    level: Literal["Beginner", "Intermediate", "Advanced"]
    duration_hours: int
    thumbnail: Optional[str] = None
    skills: List[str] = []
    lessons: List[dict] = []


# ---------- Enrollment ----------
class Enrollment(BaseModel):
    enrollment_id: str = Field(default_factory=lambda: new_id("enr"))
    user_id: str
    course_id: str
    progress: float = 0.0  # 0-100
    completed_lessons: List[str] = []
    quiz_score: Optional[int] = None
    quiz_passed: bool = False
    completed: bool = False
    started_at: str = Field(default_factory=now_iso)
    completed_at: Optional[str] = None


# ---------- Certificate ----------
class Certificate(BaseModel):
    certificate_id: str = Field(default_factory=lambda: new_id("cert"))
    user_id: str
    user_name: str
    course_id: str
    course_title: str
    issued_at: str = Field(default_factory=now_iso)
    quiz_score: int


# ---------- Quiz submission ----------
class QuizAnswer(BaseModel):
    question_id: str
    option_id: str


class QuizSubmission(BaseModel):
    answers: List[QuizAnswer]


# ---------- Skill assessment update ----------
class SkillAssessmentInput(BaseModel):
    skills: List[UserSkill]
