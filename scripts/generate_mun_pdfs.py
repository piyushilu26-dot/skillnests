from pathlib import Path
import json
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors

root=Path(__file__).resolve().parents[1]
out=root/"public"/"mun-committee-pdfs"
out.mkdir(parents=True,exist_ok=True)
data=json.loads((root/"scripts"/"mun_committees.json").read_text(encoding="utf-8"))
styles=getSampleStyleSheet()
title=ParagraphStyle("TitleX",parent=styles["Title"],fontName="Helvetica-Bold",fontSize=19,leading=23,alignment=TA_CENTER,spaceAfter=12)
sub=ParagraphStyle("SubX",parent=styles["Heading2"],fontSize=11,leading=14,textColor=colors.HexColor("#8B1E2D"),spaceAfter=10)
body=ParagraphStyle("BodyX",parent=styles["BodyText"],fontSize=10.5,leading=16,spaceAfter=10)
for item in data:
    slug=item["code"].lower().replace(" ","-").replace("/","-")
    path=out/f"{slug}.pdf"
    doc=SimpleDocTemplate(str(path),pagesize=A4,rightMargin=52,leftMargin=52,topMargin=55,bottomMargin=55)
    story=[Paragraph(item["name"],title),Paragraph(f"{item['code']} • MUN Committee Brief",sub),Paragraph(item["brief"],body),Spacer(1,12),Paragraph("<b>Preparation note:</b> Check your conference rules and agenda, then research your assigned country or role, evidence, allies and workable solutions.",body)]
    doc.build(story)
