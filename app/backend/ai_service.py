"""AI narrative generation for skill gap analysis using Emergent LLM Key + Claude Sonnet 5."""
import os
import uuid
from emergentintegrations.llm.chat import LlmChat, UserMessage


async def generate_skill_gap_narrative(user_name: str, skills: list[dict], top_gaps: list[dict]) -> str:
    """Generate a professional personalized skill gap narrative.

    skills: list of {name, category, current_level, desired_level, gap}
    top_gaps: top gaps to focus on
    """
    key = os.environ.get("EMERGENT_LLM_KEY", "")
    if not key:
        return _fallback_narrative(user_name, top_gaps)

    try:
        chat = (
            LlmChat(
                api_key=key,
                session_id=f"skillgap_{uuid.uuid4().hex[:8]}",
                system_message=(
                    "You are Capacity Connect's Skill Intelligence advisor. "
                    "Write an executive-quality, 3-paragraph analysis of a professional's "
                    "skill development priorities. Be concise, insightful, motivating, and specific. "
                    "Reference specific skills and levels. Do NOT use markdown, headings, or bullet lists. "
                    "Just crisp paragraphs of prose (~120-160 words total)."
                ),
            )
            .with_model("anthropic", "claude-sonnet-4-5-20250929")
            .with_max_tokens(500)
        )

        skill_lines = "\n".join(
            f"- {s['name']} ({s['category']}): current {s['current_level']}%, "
            f"target {s['desired_level']}%, gap {s['gap']}%"
            for s in skills
        )
        gap_lines = "\n".join(f"- {g['name']}: {g['gap']}% gap" for g in top_gaps)

        prompt = (
            f"Learner: {user_name}\n\n"
            f"Full skill profile:\n{skill_lines}\n\n"
            f"Priority gaps to address:\n{gap_lines}\n\n"
            "Write the analysis now."
        )

        msg = UserMessage(text=prompt)
        response = await chat.send_message(msg)
        return str(response).strip()
    except Exception as e:
        print(f"[ai_service] LLM error: {e}")
        return _fallback_narrative(user_name, top_gaps)


def _fallback_narrative(user_name: str, top_gaps: list[dict]) -> str:
    if not top_gaps:
        return (
            f"{user_name}, your skill profile is well-balanced with no critical gaps. "
            "Consider deepening expertise in your strongest areas to become a domain leader, "
            "and explore adjacent skills that complement your current strengths."
        )
    top = top_gaps[0]["name"]
    return (
        f"{user_name}, your priority development area is {top}, followed by "
        f"{', '.join(g['name'] for g in top_gaps[1:3])}. "
        "Closing these gaps will materially expand your effectiveness and open new project opportunities. "
        "We recommend starting with a focused 2-week sprint on the highest-gap skill, "
        "combining a foundational course with hands-on practice, then progressively layering "
        "adjacent competencies. Consistent 30-minute daily learning sessions produce compounding results."
    )
