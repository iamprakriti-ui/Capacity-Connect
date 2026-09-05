"""Generates PDF certificates via reportlab."""
from io import BytesIO
from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm


def generate_certificate_pdf(
    user_name: str,
    course_title: str,
    certificate_id: str,
    issued_at: str,
    quiz_score: int,
) -> bytes:
    buf = BytesIO()
    W, H = landscape(A4)
    c = canvas.Canvas(buf, pagesize=landscape(A4))

    # Background
    c.setFillColor(HexColor("#070B14"))
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Decorative borders
    c.setStrokeColor(HexColor("#7C5CFF"))
    c.setLineWidth(2)
    c.rect(15 * mm, 15 * mm, W - 30 * mm, H - 30 * mm, stroke=1, fill=0)
    c.setStrokeColor(HexColor("#35D6C8"))
    c.setLineWidth(0.6)
    c.rect(20 * mm, 20 * mm, W - 40 * mm, H - 40 * mm, stroke=1, fill=0)

    # Corner accents
    c.setFillColor(HexColor("#7C5CFF"))
    for x, y in [(15, 15), (W / mm - 25, 15), (15, H / mm - 25), (W / mm - 25, H / mm - 25)]:
        c.rect(x * mm, y * mm, 10 * mm, 10 * mm, fill=1, stroke=0)

    # Brand mark
    c.setFillColor(HexColor("#8793A8"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(30 * mm, H - 30 * mm, "CAPACITY  CONNECT")
    c.setFont("Helvetica", 8)
    c.drawString(30 * mm, H - 35 * mm, "Enterprise Learning Platform")

    # Title
    c.setFillColor(HexColor("#F4F7FB"))
    c.setFont("Helvetica-Bold", 44)
    c.drawCentredString(W / 2, H - 65 * mm, "CERTIFICATE OF COMPLETION")

    c.setFillColor(HexColor("#8793A8"))
    c.setFont("Helvetica", 12)
    c.drawCentredString(W / 2, H - 78 * mm, "This is proudly presented to")

    # Name
    c.setFillColor(HexColor("#F4F7FB"))
    c.setFont("Helvetica-Bold", 38)
    c.drawCentredString(W / 2, H - 100 * mm, user_name)

    # Underline
    c.setStrokeColor(HexColor("#7C5CFF"))
    c.setLineWidth(1)
    text_w = c.stringWidth(user_name, "Helvetica-Bold", 38)
    c.line((W - text_w) / 2 - 10, H - 105 * mm, (W + text_w) / 2 + 10, H - 105 * mm)

    # Body
    c.setFillColor(HexColor("#8793A8"))
    c.setFont("Helvetica", 13)
    c.drawCentredString(W / 2, H - 122 * mm, "for successfully completing the course")

    c.setFillColor(HexColor("#35D6C8"))
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(W / 2, H - 138 * mm, course_title)

    c.setFillColor(HexColor("#8793A8"))
    c.setFont("Helvetica", 11)
    c.drawCentredString(
        W / 2,
        H - 152 * mm,
        f"with an assessment score of {quiz_score}%.",
    )

    # Footer meta
    c.setFillColor(HexColor("#8793A8"))
    c.setFont("Helvetica", 9)
    c.drawString(30 * mm, 30 * mm, f"Issued: {issued_at[:10]}")
    c.drawRightString(W - 30 * mm, 30 * mm, f"Certificate ID: {certificate_id}")

    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(HexColor("#F4F7FB"))
    c.drawCentredString(W / 2, 30 * mm, "CAPACITY CONNECT · Verified Achievement")

    c.showPage()
    c.save()
    return buf.getvalue()
