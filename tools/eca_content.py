# -*- coding: utf-8 -*-
"""เนื้อหา ECA ฉบับแก้ไข 01 — คัดจาก OMA D.2.9.5 คอลัมน์ Elements Assessed

หัวข้อและลำดับต้องตรงกับคู่มือทุกตัวอักษร ห้ามเพิ่มหัวข้อที่คู่มือไม่มี
คำบรรยายเกรดเขียนใหม่ให้พูดถึงเฉพาะสิ่งที่ elements ของหัวข้อนั้นระบุ
ไม่งั้นผู้ตรวจจะให้เกรดจากสิ่งที่คู่มือไม่ได้บอกให้ดู
"""

# (หัวข้อ, สิ่งที่ผู้ตรวจสังเกต, G1, G2, G3, G4, G5)
FI = [
 ("Pre-flight Briefing",
  "Lesson structure, objectives stated, weather covered, emergency procedures, "
  "student preparation confirmed",
  "No brief given, or objectives and emergency procedures omitted; weather not covered",
  "Brief delivered but unstructured; objectives vague; a required item missed; "
  "student left unprepared",
  "Brief covers lesson structure, objectives, weather and emergency procedures; "
  "student preparation confirmed",
  "Brief thorough and well-structured; anticipates student questions; objectives "
  "linked to the syllabus stage",
  "Exemplary brief; integrates current conditions and real-time data; student "
  "demonstrably prepared and engaged"),

 ("Demonstration and Technique",
  "Accuracy of manoeuvre, ATO standard technique, correct airspeed / altitude management",
  "Manoeuvre flown inaccurately or not to ATO technique; airspeed or altitude not controlled",
  "Demonstration recognisable but imprecise; recurring deviations in airspeed or altitude",
  "Manoeuvre accurate and flown to ATO standard technique; airspeed and altitude "
  "held within tolerance",
  "Demonstration precise and repeatable; tolerances comfortably bettered; technique "
  "clearly modelled for the student",
  "Benchmark demonstration; handling used deliberately as the teaching reference"),

 ("Instructional Patter",
  "Clarity, correct sequence, standard phraseology, appropriate pace, absence of "
  "negative habits",
  "Patter unclear or absent; sequence incorrect; non-standard phraseology; negative "
  "habits evident",
  "Patter inconsistent; sequence occasionally out of order; pace mismatched to the student",
  "Clear patter in correct sequence using standard phraseology at a pace the student "
  "can follow; no negative habits",
  "Patter concise and well-timed; wording adapted when the student does not follow",
  "Patter exemplary; commentary and handling fully integrated; student follows "
  "without prompting"),

 ("Student Management",
  "Recognition of errors, intervention timing and method, correction technique",
  "Errors not recognised, or intervention late or unsafe; correction not given",
  "Errors recognised late; intervention heavier than required; correction unclear",
  "Errors recognised promptly; intervention timed and sized appropriately; correction "
  "understood by the student",
  "Allows productive errors to develop safely before intervening; correction targeted "
  "and confidence-building",
  "Manages student workload throughout; correction produces measurable improvement "
  "within the sortie"),

 ("Safety and Airmanship ★",
  "TEM application, situational awareness, decision-making, go-around judgment",
  "Unsafe act or deviation requiring intervention by the assessor; threats and errors "
  "not managed",
  "Recurring minor deviations; inconsistent scan; limited situational awareness; "
  "go-around decision delayed",
  "Threats and errors identified and managed; situational awareness maintained; sound "
  "decisions including go-around judgment",
  "Anticipates threats before they develop; decisions proactive; go-around criteria "
  "briefed and applied",
  "Masterful TEM and airmanship; consistently sets the benchmark standard for the ATO"),

 ("Post-flight Debrief",
  "Structure, specific feedback, improvement actions identified, student motivation "
  "maintained",
  "No debrief, or generic praise only; no improvement actions identified",
  "Debrief unstructured; feedback general; improvement actions vague",
  "Structured debrief; specific feedback; improvement actions identified; student "
  "motivation maintained",
  "Student-led elements; improvement areas prioritised; tone keeps the student motivated",
  "Highly developmental debrief; student produces their own prioritised action plan"),

 ("Documentation",
  "Accuracy and completeness of FRAE, AFM, student training records",
  "FRAE, AFM or student training record not completed, or containing significant errors",
  "Records completed late or with minor inaccuracies",
  "FRAE, AFM and student training records accurate and complete",
  "Records completed promptly and thoroughly; includes learning points for the next sortie",
  "Documentation exemplary; used as a reference for the student's continued training"),
]

TKI = [
 ("Lesson Planning",
  "CAAT syllabus alignment, learning objectives defined, appropriate duration, "
  "materials prepared",
  "No lesson plan; content not aligned to the CAAT syllabus; materials missing",
  "Plan incomplete; objectives implied rather than defined; duration misjudged; some "
  "materials missing",
  "Plan aligned to the CAAT syllabus; learning objectives defined; duration appropriate; "
  "materials prepared",
  "Well-structured plan with differentiated activities; timing allows for questions",
  "Comprehensive plan with contingencies; executed seamlessly to time"),

 ("Delivery ★",
  "Structure, clarity, correct technical content, approved materials, appropriate pace",
  "Delivery unclear or unstructured; technical content incorrect; unapproved materials used",
  "Delivery inconsistent; minor technical errors; pace misjudged for the class",
  "Clear, structured delivery; technical content correct; approved materials used at a "
  "suitable pace",
  "Varied delivery methods; content linked to operational practice; pace adjusted to "
  "the class",
  "Delivery elevates the subject; every student demonstrably understands the "
  "safety-critical content"),

 ("Student Engagement",
  "Questioning technique, checking understanding, adapting to class response",
  "No questioning; understanding never checked; class passive",
  "Limited questioning; understanding checked only at the end",
  "Questioning used throughout; understanding verified during the lesson; delivery "
  "adapted to the class response",
  "Stimulates discussion; draws in quieter students; adapts in real time",
  "Highly interactive; students construct and test understanding collaboratively"),

 ("Assessment",
  "Assessment tools applied correctly, consistent marking, written feedback provided",
  "Assessment not applied, or not aligned to the objectives; no feedback given",
  "Assessment applied inconsistently; marking uneven; feedback vague or verbal only",
  "Assessment tools applied correctly and marked consistently; written feedback provided",
  "Assessment well designed; feedback specific and developmental",
  "Assessment drives learning; feedback measurably changes student performance"),

 ("Classroom Management",
  "Attendance procedure, time management, student conduct managed",
  "Attendance not taken; lesson overruns or ends early without cause; conduct not managed",
  "Attendance taken late; timing slips; conduct issues left unaddressed",
  "Attendance procedure followed; lesson runs to time; student conduct managed",
  "Time managed with margin for questions; classroom climate professional and orderly",
  "Classroom runs without visible intervention; students self-manage to the standard set"),

 ("Documentation",
  "Accuracy of attendance records, progress entries, submissions to the training "
  "records system",
  "Attendance records or progress entries not completed; results not submitted",
  "Records incomplete or submitted late",
  "Attendance records and progress entries accurate; results submitted to the training "
  "records system",
  "Records completed promptly; includes narrative progress notes",
  "Documentation comprehensive; forms the evidence base for the student file"),
]

HEAD = ["D-0507-ECA-001", "Issue 01 / Rev 01", "Ref: OMA D.2.9.5",
        "Pass: Grade ≥ 3 in ALL areas"]

PURPOSE = ("This document reproduces the evaluation criteria and grade descriptors "
           "defined in OMA D.2.9.5 for all in-house proficiency checks conducted at "
           "D-0507 Flight Training Co., Ltd. Assessors (HT / CFI / CTKI / FIE) shall use "
           "Part A when completing Form D-0507-PCR-FI-001 and Part B when completing Form "
           "D-0507-PCR-TKI-001. Where this document and OMA D.2.9.5 differ, OMA D.2.9.5 "
           "governs.")

# กฎเดียวกันทั้งสองภาค ต่างแค่ชื่อหัวข้อที่เป็น safety-critical
def starnote(who, area):
    return ("Grade 2 or below in the safety-critical area (%s) is an automatic fail. "
            "Grade 1 in any area is an automatic fail. Grade 2 in more than two "
            "non-safety-critical areas is a fail; Grade 2 in one or two non-safety-critical "
            "areas is a Marginal Pass. There is no overall percentage requirement."
            % area)

NOTE = ("These criteria are reproduced from OMA D.2.9.5 and are minimum standards. The "
        "Head of Training may set higher standards for specific ratings or courses, but "
        "may not lower them or alter the pass rules. They govern all three proficiency "
        "tiers — Tier 1 In-House IPC, the instructional observation element of Tier 2 "
        "LPC+, and Tier 3 Assessment of Competence.")
