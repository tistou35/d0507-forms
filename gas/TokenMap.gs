/**
 * TokenMap.gs — สร้างอัตโนมัติจาก tools/make_tokenmap.py
 * อย่าแก้ด้วยมือ · แก้ที่นิยามฟอร์มแล้วรันเครื่องมือใหม่
 *
 * byLabel  ป้ายในเซลล์ -> token ที่ใส่ในเซลล์ถัดไปทางขวา
 * byLine   "ป้าย: ______" ในเซลล์ -> แทนเส้นประด้วย token
 * boxes    token ช่องติ๊ก เรียงตามลำดับที่ ☐ ปรากฏ
 * manual   จับคู่ไม่ได้ ต้องวางมือ — สคริปต์พิมพ์ไว้ท้ายเอกสาร
 */
var TOKEN_MAP = {
  "APF": {
    "abbr": "APF",
    "docx": "D-0507-APF-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "Full Name:",
        "tok": "{{appName}}"
      },
      {
        "label": "ID / Licence No.:",
        "tok": "{{appId}}"
      },
      {
        "label": "Date of Appeal:",
        "tok": "{{appDate}}"
      },
      {
        "label": "Role / Course:",
        "tok": "{{appRole}}"
      },
      {
        "label": "Contact No.:",
        "tok": "{{appPhone}}"
      },
      {
        "label": "Email:",
        "tok": "{{appEmail}}"
      },
      {
        "label": "Nature of Decision:",
        "tok": "{{decNature}}"
      },
      {
        "label": "Decision Date:",
        "tok": "{{decDate}}"
      },
      {
        "label": "Decision Made by:",
        "tok": "{{decBy}}"
      },
      {
        "label": "Appellant Signature:\n___________________________",
        "tok": "{{sig_appSign}}"
      },
      {
        "label": "Date Submitted:\n___________________________",
        "tok": "{{submitDate}}"
      },
      {
        "label": "Received by (Admin):\n___________________________",
        "tok": "{{recvBy}}"
      },
      {
        "label": "Date Notified:",
        "tok": "{{notifyDate}}"
      },
      {
        "label": "Decided by:",
        "tok": "{{decidedBy}}"
      },
      {
        "label": "Remarks / Action Taken:",
        "tok": "{{acmRemark}}"
      }
    ],
    "byLine": [],
    "boxes": [
      {
        "tok": "{{k_decCat_assessment}}",
        "label": "Assessment result",
        "ord": "Assessment result"
      },
      {
        "tok": "{{k_decCat_exam}}",
        "label": "Examination failure",
        "ord": "Examination failure"
      },
      {
        "tok": "{{k_decCat_enrolment}}",
        "label": "Enrolment decision",
        "ord": "Enrolment decision"
      },
      {
        "tok": "{{k_decCat_disciplinary}}",
        "label": "Disciplinary action",
        "ord": "Disciplinary action"
      },
      {
        "tok": "{{k_decCat_other}}",
        "label": "Other",
        "ord": "Other"
      },
      {
        "tok": "{{k_outcome_upheld}}",
        "label": "Appeal upheld",
        "ord": "Appeal upheld"
      },
      {
        "tok": "{{k_outcome_partly}}",
        "label": "Appeal partly upheld",
        "ord": "Appeal partly upheld"
      },
      {
        "tok": "{{k_outcome_dismissed}}",
        "label": "Appeal dismissed",
        "ord": "Appeal dismissed"
      }
    ],
    "tables": [],
    "boxesInDocx": 8,
    "approval": [
      {
        "tok": "{{sig_acmSign}}",
        "label": "Signature",
        "labelTh": "ลายเซ็นผู้พิจารณา",
        "sign": true
      }
    ],
    "manual": [
      {
        "tok": "{{decOther}}",
        "label": "Other — specify",
        "labelTh": "ระบุประเภทอื่น",
        "sign": false
      },
      {
        "tok": "{{grounds}}",
        "label": "State the specific grounds on which this appeal is based (cite relevant regulations, procedures, or facts)",
        "labelTh": "ระบุเหตุผลที่ใช้อุทธรณ์ พร้อมอ้างอิงกฎ ระเบียบ ขั้นตอน หรือข้อเท็จจริงที่เกี่ยวข้อง",
        "sign": false
      },
      {
        "tok": "{{evidence}}",
        "label": "Documents, records, or evidence attached in support",
        "labelTh": "เอกสารหรือหลักฐานที่แนบ",
        "sign": false
      }
    ]
  },
  "ASF": {
    "abbr": "ASF",
    "docx": "D-0507-ASF-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "Student Name",
        "tok": "{{stuName}}"
      },
      {
        "label": "Email / Line ID",
        "tok": "{{stuContact}}"
      },
      {
        "label": "Instructor Name",
        "tok": "{{insName}}"
      },
      {
        "label": "Instructor Email / Line ID",
        "tok": "{{insContact}}"
      },
      {
        "label": "Aircraft Type:  _______________________",
        "tok": "{{acType}}"
      },
      {
        "label": "Date:  ___ / ___ / ______",
        "tok": "{{fltDate}}"
      },
      {
        "label": "Lesson of Flight:  ___________",
        "tok": "{{lesson}}"
      },
      {
        "label": "Instructor Licence No.:  _______________________________",
        "tok": "{{insLicence}}"
      },
      {
        "label": "Instructor Signature:",
        "tok": "{{sig_insSign}}"
      }
    ],
    "byLine": [],
    "boxes": [
      {
        "tok": "{{k_soloType_initial}}",
        "label": "Initial solo",
        "ord": "Initial solo"
      },
      {
        "tok": "{{k_soloType_localxc}}",
        "label": "Solo local / cross-country",
        "ord": "Solo local / cross-country"
      },
      {
        "tok": "{{k_soloType_night}}",
        "label": "Night solo local / cross-country",
        "ord": "Night solo local / cross-country"
      },
      {
        "tok": "{{k_preHours_hours_Y}}",
        "label": "Flight hours & landings · ✓",
        "ord": "✓",
        "item": "Flight hours & landings"
      },
      {
        "tok": "{{k_nightKnow_nightHours_Y}}",
        "label": "Night hours & landings · ✓",
        "ord": "✓",
        "item": "Night hours & landings"
      },
      {
        "tok": "{{k_knowledge_systems_Y}}",
        "label": "Aircraft systems & flight controls · ✓",
        "ord": "✓",
        "item": "Aircraft systems & flight controls"
      },
      {
        "tok": "{{k_knowledge_aero_Y}}",
        "label": "Aerodynamics · ✓",
        "ord": "✓",
        "item": "Aerodynamics"
      },
      {
        "tok": "{{k_knowledge_emerg_Y}}",
        "label": "Emergency procedures · ✓",
        "ord": "✓",
        "item": "Emergency procedures"
      },
      {
        "tok": "{{k_knowledge_law_Y}}",
        "label": "Airspace, air laws & regulations · ✓",
        "ord": "✓",
        "item": "Airspace, air laws & regulations"
      },
      {
        "tok": "{{k_knowledge_wx_Y}}",
        "label": "Weather — interpretation & decision-making · ✓",
        "ord": "✓",
        "item": "Weather — interpretation & decision-making"
      },
      {
        "tok": "{{k_knowledge_preflight_Y}}",
        "label": "Pre-flight procedures & documentation · ✓",
        "ord": "✓",
        "item": "Pre-flight procedures & documentation"
      },
      {
        "tok": "{{k_knowledge_radio_Y}}",
        "label": "Radio communication procedures · ✓",
        "ord": "✓",
        "item": "Radio communication procedures"
      },
      {
        "tok": "{{k_nightKnow_vision_Y}}",
        "label": "Night vision & physiology · ✓",
        "ord": "✓",
        "item": "Night vision & physiology"
      },
      {
        "tok": "{{k_nightKnow_lighting_Y}}",
        "label": "Aircraft lighting systems · ✓",
        "ord": "✓",
        "item": "Aircraft lighting systems"
      },
      {
        "tok": "{{k_nightKnow_disorient_Y}}",
        "label": "Spatial disorientation — recognition & recovery · ✓",
        "ord": "✓",
        "item": "Spatial disorientation — recognition & recovery"
      },
      {
        "tok": "{{k_nightKnow_nav_Y}}",
        "label": "Night navigation · ✓",
        "ord": "✓",
        "item": "Night navigation"
      }
    ],
    "tables": [],
    "boxesInDocx": 16,
    "approval": [
      {
        "tok": "{{htName}}",
        "label": "Head of Training name",
        "labelTh": "ชื่อหัวหน้าครูฝึก",
        "sign": false
      },
      {
        "tok": "{{htDate}}",
        "label": "Date approved",
        "labelTh": "วันที่อนุมัติ",
        "sign": false
      },
      {
        "tok": "{{htComment}}",
        "label": "Comment",
        "labelTh": "ความเห็น",
        "sign": false
      },
      {
        "tok": "{{sig_htSign}}",
        "label": "Head of Training signature",
        "labelTh": "ลายเซ็นหัวหน้าครูฝึก",
        "sign": true
      }
    ],
    "manual": [
      {
        "tok": "{{acReg}}",
        "label": "Aircraft registration",
        "labelTh": "ทะเบียนอากาศยาน",
        "sign": false
      }
    ]
  },
  "DAF": {
    "abbr": "DAF",
    "docx": "D-0507-DAF-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "Full Name:",
        "tok": "{{subName}}"
      },
      {
        "label": "ID / Licence No.:",
        "tok": "{{subId}}"
      },
      {
        "label": "Date of Record:",
        "tok": "{{recDate}}"
      },
      {
        "label": "Role / Position:",
        "tok": "{{subRole}}"
      },
      {
        "label": "Department:",
        "tok": "{{subDept}}"
      },
      {
        "label": "Incident Date:",
        "tok": "{{incDate}}"
      },
      {
        "label": "Reference (Regulation / SOP / Policy):",
        "tok": "{{infRef}}"
      },
      {
        "label": "Provide a factual and chronological account of the incident or behaviour:",
        "tok": "{{account}}"
      },
      {
        "label": "Effective Date:",
        "tok": "{{effDate}}"
      },
      {
        "label": "Duration (if applicable):",
        "tok": "{{duration}}"
      },
      {
        "label": "Right of Appeal Deadline:",
        "tok": "{{appealBy}}"
      },
      {
        "label": "Reviewed by:",
        "tok": "{{reviewBy}}"
      },
      {
        "label": "Remarks / Special Conditions:",
        "tok": "{{remark}}"
      },
      {
        "label": "Subject Signature:\n___________________________",
        "tok": "{{sig_subSign}}"
      },
      {
        "label": "Issued by (Manager):\n___________________________",
        "tok": "{{mgrName}}"
      },
      {
        "label": "Date:\n___________________________",
        "tok": "{{mgrDate}}"
      }
    ],
    "byLine": [
      {
        "label": "Suspension (specify days)",
        "und": 7,
        "tok": "{{suspendDays}}"
      }
    ],
    "boxes": [
      {
        "tok": "{{k_infCat_sop}}",
        "label": "Breach of SOP / procedure",
        "ord": "Breach of SOP / procedure"
      },
      {
        "tok": "{{k_infCat_caat}}",
        "label": "Violation of CAAT regulation",
        "ord": "Violation of CAAT regulation"
      },
      {
        "tok": "{{k_infCat_unsafe}}",
        "label": "Unsafe act",
        "ord": "Unsafe act"
      },
      {
        "tok": "{{k_infCat_misconduct}}",
        "label": "Misconduct",
        "ord": "Misconduct"
      },
      {
        "tok": "{{k_infCat_negligence}}",
        "label": "Negligence",
        "ord": "Negligence"
      },
      {
        "tok": "{{k_infCat_insub}}",
        "label": "Insubordination",
        "ord": "Insubordination"
      },
      {
        "tok": "{{k_infCat_dishonesty}}",
        "label": "Dishonesty / falsification",
        "ord": "Dishonesty / falsification"
      },
      {
        "tok": "{{k_infCat_other}}",
        "label": "Other",
        "ord": "Other"
      },
      {
        "tok": "{{k_actLevel_verbal}}",
        "label": "Verbal warning",
        "ord": "Verbal warning"
      },
      {
        "tok": "{{k_actLevel_written}}",
        "label": "Written warning",
        "ord": "Written warning"
      },
      {
        "tok": "{{k_actLevel_suspend}}",
        "label": "Suspension",
        "ord": "Suspension"
      },
      {
        "tok": "{{k_actLevel_terminate}}",
        "label": "Termination / expulsion",
        "ord": "Termination / expulsion"
      },
      {
        "tok": "{{k_actLevel_training}}",
        "label": "Additional training required",
        "ord": "Additional training required"
      },
      {
        "tok": "{{k_actLevel_licence}}",
        "label": "Licence suspension request to CAAT",
        "ord": "Licence suspension request to CAAT"
      },
      {
        "tok": "{{k_actLevel_other}}",
        "label": "Other",
        "ord": "Other"
      }
    ],
    "tables": [],
    "boxesInDocx": 15,
    "approval": [
      {
        "tok": "{{acmName}}",
        "label": "Accountable Manager name",
        "labelTh": "ชื่อผู้จัดการฝ่ายรับผิดชอบ",
        "sign": false
      },
      {
        "tok": "{{acmDate}}",
        "label": "Date endorsed",
        "labelTh": "วันที่รับรอง",
        "sign": false
      },
      {
        "tok": "{{acmComment}}",
        "label": "Comment",
        "labelTh": "ความเห็น",
        "sign": false
      },
      {
        "tok": "{{sig_acmSign}}",
        "label": "Accountable Manager signature",
        "labelTh": "ลายเซ็นผู้จัดการฝ่ายรับผิดชอบ",
        "sign": true
      }
    ],
    "manual": [
      {
        "tok": "{{infOther}}",
        "label": "Other — specify",
        "labelTh": "ระบุประเภทอื่น",
        "sign": false
      },
      {
        "tok": "{{actOther}}",
        "label": "Other — specify",
        "labelTh": "ระบุโทษอื่น",
        "sign": false
      },
      {
        "tok": "{{sig_mgrSign}}",
        "label": "Issuing manager signature",
        "labelTh": "ลายเซ็นผู้ออกคำสั่ง",
        "sign": true
      }
    ]
  },
  "DRC": {
    "abbr": "DRC",
    "docx": "D-0507-DRC-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "Distributed to (Name):",
        "tok": "{{rcvName}}"
      },
      {
        "label": "Position / Role:",
        "tok": "{{rcvRole}}"
      },
      {
        "label": "Date Issued:",
        "tok": "{{issDate}}"
      },
      {
        "label": "Issued by:",
        "tok": "{{issBy}}"
      },
      {
        "label": "Copy No.:",
        "tok": "{{copyNo}}"
      },
      {
        "label": "Recipient Name:\n___________________________",
        "tok": "{{rcvSignName}}"
      },
      {
        "label": "Date:\n___________________________",
        "tok": "{{rcvDate}}"
      }
    ],
    "byLine": [],
    "boxes": [
      {
        "tok": "{{k_copyType_hard}}",
        "label": "Hard copy",
        "ord": "Hard copy"
      },
      {
        "tok": "{{k_copyType_digital}}",
        "label": "Digital",
        "ord": "Digital"
      }
    ],
    "tables": [
      {
        "k": "docs",
        "rows": 8,
        "label": "Document list",
        "cols": [
          {
            "k": "title",
            "head": "Document title"
          },
          {
            "k": "code",
            "head": "Document code"
          },
          {
            "k": "rev",
            "head": "Issue / Rev."
          },
          {
            "k": "eff",
            "head": "Eff. date"
          }
        ]
      }
    ],
    "boxesInDocx": 2,
    "approval": [
      {
        "tok": "{{sig_rcvSign}}",
        "label": "Recipient signature",
        "labelTh": "ลายเซ็นผู้รับ",
        "sign": true
      }
    ],
    "manual": []
  },
  "DRF": {
    "abbr": "DRF",
    "docx": "D-0507-DRF-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "Request No.:",
        "tok": "{{reqNo}}"
      },
      {
        "label": "Date:",
        "tok": "{{reqDate}}"
      },
      {
        "label": "Requested by:",
        "tok": "{{reqBy}}"
      },
      {
        "label": "Department:",
        "tok": "{{reqDept}}"
      },
      {
        "label": "Document Title:",
        "tok": "{{docTitle}}"
      },
      {
        "label": "Document Code:",
        "tok": "{{docCode}}"
      },
      {
        "label": "Current Issue / Rev.:",
        "tok": "{{curRev}}"
      },
      {
        "label": "Section / Page Affected:",
        "tok": "{{sectionAff}}"
      },
      {
        "label": "CURRENT TEXT / CONTENT",
        "tok": "{{curText}}"
      },
      {
        "label": "PROPOSED TEXT / CONTENT",
        "tok": "{{newText}}"
      },
      {
        "label": "Additional explanation:",
        "tok": "{{explain}}"
      },
      {
        "label": "Reviewed by (QM):\n___________________________",
        "tok": "{{qmName}}"
      },
      {
        "label": "Approved by:\n___________________________",
        "tok": "{{approvedBy}}"
      },
      {
        "label": "Effective Date:\n___________________________",
        "tok": "{{newEff}}"
      }
    ],
    "byLine": [],
    "boxes": [
      {
        "tok": "{{k_changeType_minor}}",
        "label": "Minor correction",
        "ord": "Minor correction"
      },
      {
        "tok": "{{k_changeType_major}}",
        "label": "Major revision",
        "ord": "Major revision"
      },
      {
        "tok": "{{k_changeType_new}}",
        "label": "New section",
        "ord": "New section"
      },
      {
        "tok": "{{k_changeType_delete}}",
        "label": "Delete section",
        "ord": "Delete section"
      },
      {
        "tok": "{{k_changeType_regulatory}}",
        "label": "Regulatory update",
        "ord": "Regulatory update"
      },
      {
        "tok": "{{k_reason_regulatory}}",
        "label": "Regulatory requirement",
        "ord": "Regulatory requirement"
      },
      {
        "tok": "{{k_reason_operational}}",
        "label": "Operational need",
        "ord": "Operational need"
      },
      {
        "tok": "{{k_reason_error}}",
        "label": "Error correction",
        "ord": "Error correction"
      },
      {
        "tok": "{{k_reason_practice}}",
        "label": "Best practice update",
        "ord": "Best practice update"
      },
      {
        "tok": "{{k_reason_directive}}",
        "label": "CAAT directive",
        "ord": "CAAT directive"
      }
    ],
    "tables": [],
    "boxesInDocx": 10,
    "approval": [
      {
        "tok": "{{qmDate}}",
        "label": "Date reviewed",
        "labelTh": "วันที่ทบทวน",
        "sign": false
      },
      {
        "tok": "{{qmComment}}",
        "label": "Comment",
        "labelTh": "ความเห็น",
        "sign": false
      },
      {
        "tok": "{{sig_qmSign}}",
        "label": "Reviewer signature",
        "labelTh": "ลายเซ็นผู้ทบทวน",
        "sign": true
      }
    ],
    "manual": [
      {
        "tok": "{{sig_reqSign}}",
        "label": "Requester signature",
        "labelTh": "ลายเซ็นผู้ขอแก้ไข",
        "sign": true
      }
    ]
  },
  "EFC": {
    "abbr": "EFC",
    "docx": "D-0507-EFC-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "Student Name",
        "tok": "{{stuName}}"
      },
      {
        "label": "Course Attended",
        "tok": "{{course}}"
      },
      {
        "label": "Completion Date",
        "tok": "{{completeDate}}"
      },
      {
        "label": "Last Flight Log Date",
        "tok": "{{lastLogDate}}"
      },
      {
        "label": "Exam Score",
        "tok": "{{examScore}}"
      },
      {
        "label": "Total Score",
        "tok": "{{totalScore}}"
      }
    ],
    "byLine": [],
    "boxes": [
      {
        "tok": "{{k_courseType_ground}}",
        "label": "Ground course",
        "ord": "Ground course"
      },
      {
        "tok": "{{k_courseType_flight}}",
        "label": "Flight training",
        "ord": "Flight training"
      },
      {
        "tok": "{{k_examType_afterclass}}",
        "label": "After class",
        "ord": "After class"
      },
      {
        "tok": "{{k_examType_stage}}",
        "label": "Stage exam",
        "ord": "Stage exam"
      },
      {
        "tok": "{{k_examType_endcourse}}",
        "label": "End-of-course",
        "ord": "End-of-course"
      },
      {
        "tok": "{{k_examType_progressive}}",
        "label": "Flight progressive",
        "ord": "Flight progressive"
      },
      {
        "tok": "{{k_examType_endflight}}",
        "label": "End-of-course flight",
        "ord": "End-of-course flight"
      },
      {
        "tok": "{{k_result_passed}}",
        "label": "Passed",
        "ord": "Passed"
      },
      {
        "tok": "{{k_result_notpassed}}",
        "label": "Not passed",
        "ord": "Not passed"
      },
      {
        "tok": "{{k_result_repeat}}",
        "label": "Repeat",
        "ord": "Repeat"
      },
      {
        "tok": "{{k_s1_sIntroDiscoveringAviation_S}}",
        "label": "[Intro] Discovering Aviation · Satisfied",
        "ord": "Satisfied",
        "item": "[Intro] Discovering Aviation"
      },
      {
        "tok": "{{k_s1_sIntroDiscoveringAviation_U}}",
        "label": "[Intro] Discovering Aviation · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[Intro] Discovering Aviation"
      },
      {
        "tok": "{{k_s1_sPpl01AirplaneSystems_S}}",
        "label": "[PPL 01] Airplane Systems · Satisfied",
        "ord": "Satisfied",
        "item": "[PPL 01] Airplane Systems"
      },
      {
        "tok": "{{k_s1_sPpl01AirplaneSystems_U}}",
        "label": "[PPL 01] Airplane Systems · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[PPL 01] Airplane Systems"
      },
      {
        "tok": "{{k_s1_sPpl02AerodynamicPrinciples_S}}",
        "label": "[PPL 02] Aerodynamic Principles · Satisfied",
        "ord": "Satisfied",
        "item": "[PPL 02] Aerodynamic Principles"
      },
      {
        "tok": "{{k_s1_sPpl02AerodynamicPrinciples_U}}",
        "label": "[PPL 02] Aerodynamic Principles · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[PPL 02] Aerodynamic Principles"
      },
      {
        "tok": "{{k_s1_sPpl03TheFlight_S}}",
        "label": "[PPL 03] The Flight Environment · Satisfied",
        "ord": "Satisfied",
        "item": "[PPL 03] The Flight Environment"
      },
      {
        "tok": "{{k_s1_sPpl03TheFlight_U}}",
        "label": "[PPL 03] The Flight Environment · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[PPL 03] The Flight Environment"
      },
      {
        "tok": "{{k_s1_sPpl04CommunicationAnd_S}}",
        "label": "[PPL 04] Communication and Flight Information · Satisfied",
        "ord": "Satisfied",
        "item": "[PPL 04] Communication and Flight Information"
      },
      {
        "tok": "{{k_s1_sPpl04CommunicationAnd_U}}",
        "label": "[PPL 04] Communication and Flight Information · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[PPL 04] Communication and Flight Information"
      },
      {
        "tok": "{{k_s1_sPpl05MeteorologyFor_S}}",
        "label": "[PPL 05] Meteorology for Pilots and Interpreting Weather Data · Satisfied",
        "ord": "Satisfied",
        "item": "[PPL 05] Meteorology for Pilots and Interpreting Weather Data"
      },
      {
        "tok": "{{k_s1_sPpl05MeteorologyFor_U}}",
        "label": "[PPL 05] Meteorology for Pilots and Interpreting Weather Data · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[PPL 05] Meteorology for Pilots and Interpreting Weather Data"
      },
      {
        "tok": "{{k_s1_sPpl06AirplanePerformance_S}}",
        "label": "[PPL 06] Airplane Performance & Technical Type · Satisfied",
        "ord": "Satisfied",
        "item": "[PPL 06] Airplane Performance & Technical Type"
      },
      {
        "tok": "{{k_s1_sPpl06AirplanePerformance_U}}",
        "label": "[PPL 06] Airplane Performance & Technical Type · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[PPL 06] Airplane Performance & Technical Type"
      },
      {
        "tok": "{{k_s1_sPpl07Navigation_S}}",
        "label": "[PPL 07] Navigation · Satisfied",
        "ord": "Satisfied",
        "item": "[PPL 07] Navigation"
      },
      {
        "tok": "{{k_s1_sPpl07Navigation_U}}",
        "label": "[PPL 07] Navigation · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[PPL 07] Navigation"
      },
      {
        "tok": "{{k_s1_sPpl08ApplyingHuman_S}}",
        "label": "[PPL 08] Applying Human Factor Principles · Satisfied",
        "ord": "Satisfied",
        "item": "[PPL 08] Applying Human Factor Principles"
      },
      {
        "tok": "{{k_s1_sPpl08ApplyingHuman_U}}",
        "label": "[PPL 08] Applying Human Factor Principles · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[PPL 08] Applying Human Factor Principles"
      },
      {
        "tok": "{{k_s1_sCpl061FlyingCrosscountry_S}}",
        "label": "[CPL 06.1] Flying Cross-Country · Satisfied",
        "ord": "Satisfied",
        "item": "[CPL 06.1] Flying Cross-Country"
      },
      {
        "tok": "{{k_s1_sCpl061FlyingCrosscountry_U}}",
        "label": "[CPL 06.1] Flying Cross-Country · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[CPL 06.1] Flying Cross-Country"
      },
      {
        "tok": "{{k_s1_sPpl09AirLaws_S}}",
        "label": "[PPL 09] Air Laws & Rule of the Air · Satisfied",
        "ord": "Satisfied",
        "item": "[PPL 09] Air Laws & Rule of the Air"
      },
      {
        "tok": "{{k_s1_sPpl09AirLaws_U}}",
        "label": "[PPL 09] Air Laws & Rule of the Air · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[PPL 09] Air Laws & Rule of the Air"
      },
      {
        "tok": "{{k_s2_sDft01MathPhysics_S}}",
        "label": "[DFT 01] Math & Physics for Aviation · Satisfied",
        "ord": "Satisfied",
        "item": "[DFT 01] Math & Physics for Aviation"
      },
      {
        "tok": "{{k_s2_sDft01MathPhysics_U}}",
        "label": "[DFT 01] Math & Physics for Aviation · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[DFT 01] Math & Physics for Aviation"
      },
      {
        "tok": "{{k_s2_sDft02C172System_S}}",
        "label": "[DFT 02] C-172 System · Satisfied",
        "ord": "Satisfied",
        "item": "[DFT 02] C-172 System"
      },
      {
        "tok": "{{k_s2_sDft02C172System_U}}",
        "label": "[DFT 02] C-172 System · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[DFT 02] C-172 System"
      },
      {
        "tok": "{{k_s2_sDft03NormalEmergency_S}}",
        "label": "[DFT 03] Normal & Emergency Procedure · Satisfied",
        "ord": "Satisfied",
        "item": "[DFT 03] Normal & Emergency Procedure"
      },
      {
        "tok": "{{k_s2_sDft03NormalEmergency_U}}",
        "label": "[DFT 03] Normal & Emergency Procedure · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[DFT 03] Normal & Emergency Procedure"
      },
      {
        "tok": "{{k_s2_sDft04FundamentalOf_S}}",
        "label": "[DFT 04] Fundamental of Psychology · Satisfied",
        "ord": "Satisfied",
        "item": "[DFT 04] Fundamental of Psychology"
      },
      {
        "tok": "{{k_s2_sDft04FundamentalOf_U}}",
        "label": "[DFT 04] Fundamental of Psychology · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[DFT 04] Fundamental of Psychology"
      },
      {
        "tok": "{{k_s3_sCpl01AdvanceSystems_S}}",
        "label": "[CPL 01] Advance Systems 2 · Satisfied",
        "ord": "Satisfied",
        "item": "[CPL 01] Advance Systems 2"
      },
      {
        "tok": "{{k_s3_sCpl01AdvanceSystems_U}}",
        "label": "[CPL 01] Advance Systems 2 · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[CPL 01] Advance Systems 2"
      },
      {
        "tok": "{{k_s3_sCpl02Aerodynamic2_S}}",
        "label": "[CPL 02] Aerodynamic 2 · Satisfied",
        "ord": "Satisfied",
        "item": "[CPL 02] Aerodynamic 2"
      },
      {
        "tok": "{{k_s3_sCpl02Aerodynamic2_U}}",
        "label": "[CPL 02] Aerodynamic 2 · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[CPL 02] Aerodynamic 2"
      },
      {
        "tok": "{{k_s3_sCpl031CommercialFlight_S}}",
        "label": "[CPL 03.1] Commercial Flight Consideration · Satisfied",
        "ord": "Satisfied",
        "item": "[CPL 03.1] Commercial Flight Consideration"
      },
      {
        "tok": "{{k_s3_sCpl031CommercialFlight_U}}",
        "label": "[CPL 03.1] Commercial Flight Consideration · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[CPL 03.1] Commercial Flight Consideration"
      },
      {
        "tok": "{{k_s3_sCpl032CommercialManeuver_S}}",
        "label": "[CPL 03.2] Commercial Maneuver · Satisfied",
        "ord": "Satisfied",
        "item": "[CPL 03.2] Commercial Maneuver"
      },
      {
        "tok": "{{k_s3_sCpl032CommercialManeuver_U}}",
        "label": "[CPL 03.2] Commercial Maneuver · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[CPL 03.2] Commercial Maneuver"
      },
      {
        "tok": "{{k_s3_sCpl04AirplanePerformance_S}}",
        "label": "[CPL 04] Airplane Performance 2 · Satisfied",
        "ord": "Satisfied",
        "item": "[CPL 04] Airplane Performance 2"
      },
      {
        "tok": "{{k_s3_sCpl04AirplanePerformance_U}}",
        "label": "[CPL 04] Airplane Performance 2 · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[CPL 04] Airplane Performance 2"
      },
      {
        "tok": "{{k_s3_sCpl05Navigation2_S}}",
        "label": "[CPL 05] Navigation 2 · Satisfied",
        "ord": "Satisfied",
        "item": "[CPL 05] Navigation 2"
      },
      {
        "tok": "{{k_s3_sCpl05Navigation2_U}}",
        "label": "[CPL 05] Navigation 2 · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[CPL 05] Navigation 2"
      },
      {
        "tok": "{{k_s3_sCpl062FlyingCross_S}}",
        "label": "[CPL 06.2] Flying Cross Country · Satisfied",
        "ord": "Satisfied",
        "item": "[CPL 06.2] Flying Cross Country"
      },
      {
        "tok": "{{k_s3_sCpl062FlyingCross_U}}",
        "label": "[CPL 06.2] Flying Cross Country · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[CPL 06.2] Flying Cross Country"
      },
      {
        "tok": "{{k_s4_sIr01PrinciplesOf_S}}",
        "label": "[IR 01] Principles of Instrument Flight · Satisfied",
        "ord": "Satisfied",
        "item": "[IR 01] Principles of Instrument Flight"
      },
      {
        "tok": "{{k_s4_sIr01PrinciplesOf_U}}",
        "label": "[IR 01] Principles of Instrument Flight · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[IR 01] Principles of Instrument Flight"
      },
      {
        "tok": "{{k_s4_sIr02IfrFlight_S}}",
        "label": "[IR 02] IFR Flight Environment · Satisfied",
        "ord": "Satisfied",
        "item": "[IR 02] IFR Flight Environment"
      },
      {
        "tok": "{{k_s4_sIr02IfrFlight_U}}",
        "label": "[IR 02] IFR Flight Environment · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[IR 02] IFR Flight Environment"
      },
      {
        "tok": "{{k_s4_sIr03Departure_S}}",
        "label": "[IR 03] Departure · Satisfied",
        "ord": "Satisfied",
        "item": "[IR 03] Departure"
      },
      {
        "tok": "{{k_s4_sIr03Departure_U}}",
        "label": "[IR 03] Departure · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[IR 03] Departure"
      },
      {
        "tok": "{{k_s4_sIr04Enroute_S}}",
        "label": "[IR 04] Enroute · Satisfied",
        "ord": "Satisfied",
        "item": "[IR 04] Enroute"
      },
      {
        "tok": "{{k_s4_sIr04Enroute_U}}",
        "label": "[IR 04] Enroute · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[IR 04] Enroute"
      },
      {
        "tok": "{{k_s4_sIr05Arrival_S}}",
        "label": "[IR 05] Arrival · Satisfied",
        "ord": "Satisfied",
        "item": "[IR 05] Arrival"
      },
      {
        "tok": "{{k_s4_sIr05Arrival_U}}",
        "label": "[IR 05] Arrival · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[IR 05] Arrival"
      },
      {
        "tok": "{{k_s4_sIr061Approach_S}}",
        "label": "[IR 06.1] Approach · Satisfied",
        "ord": "Satisfied",
        "item": "[IR 06.1] Approach"
      },
      {
        "tok": "{{k_s4_sIr061Approach_U}}",
        "label": "[IR 06.1] Approach · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[IR 06.1] Approach"
      },
      {
        "tok": "{{k_s4_sIr062InstrumentApproaches_S}}",
        "label": "[IR 06.2] Instrument Approaches · Satisfied",
        "ord": "Satisfied",
        "item": "[IR 06.2] Instrument Approaches"
      },
      {
        "tok": "{{k_s4_sIr062InstrumentApproaches_U}}",
        "label": "[IR 06.2] Instrument Approaches · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[IR 06.2] Instrument Approaches"
      },
      {
        "tok": "{{k_s4_sIr07Meteorology_S}}",
        "label": "[IR 07] Meteorology · Satisfied",
        "ord": "Satisfied",
        "item": "[IR 07] Meteorology"
      },
      {
        "tok": "{{k_s4_sIr07Meteorology_U}}",
        "label": "[IR 07] Meteorology · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[IR 07] Meteorology"
      },
      {
        "tok": "{{k_s4_sIr08IfrFlight_S}}",
        "label": "[IR 08] IFR Flight Considerations · Satisfied",
        "ord": "Satisfied",
        "item": "[IR 08] IFR Flight Considerations"
      },
      {
        "tok": "{{k_s4_sIr08IfrFlight_U}}",
        "label": "[IR 08] IFR Flight Considerations · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[IR 08] IFR Flight Considerations"
      },
      {
        "tok": "{{k_s4_sIr09FlightRule_S}}",
        "label": "[IR 09] Flight Rule · Satisfied",
        "ord": "Satisfied",
        "item": "[IR 09] Flight Rule"
      },
      {
        "tok": "{{k_s4_sIr09FlightRule_U}}",
        "label": "[IR 09] Flight Rule · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[IR 09] Flight Rule"
      },
      {
        "tok": "{{k_s5_sIp01FoundationOf_S}}",
        "label": "[IP 01] Foundation of Learning · Satisfied",
        "ord": "Satisfied",
        "item": "[IP 01] Foundation of Learning"
      },
      {
        "tok": "{{k_s5_sIp01FoundationOf_U}}",
        "label": "[IP 01] Foundation of Learning · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[IP 01] Foundation of Learning"
      },
      {
        "tok": "{{k_s5_sIp02TheArt_S}}",
        "label": "[IP 02] The Art and Science of Teaching · Satisfied",
        "ord": "Satisfied",
        "item": "[IP 02] The Art and Science of Teaching"
      },
      {
        "tok": "{{k_s5_sIp02TheArt_U}}",
        "label": "[IP 02] The Art and Science of Teaching · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[IP 02] The Art and Science of Teaching"
      },
      {
        "tok": "{{k_s5_sIp03ExploringHuman_S}}",
        "label": "[IP 03] Exploring Human Factor · Satisfied",
        "ord": "Satisfied",
        "item": "[IP 03] Exploring Human Factor"
      },
      {
        "tok": "{{k_s5_sIp03ExploringHuman_U}}",
        "label": "[IP 03] Exploring Human Factor · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[IP 03] Exploring Human Factor"
      },
      {
        "tok": "{{k_s5_sIp04BecomingAn_S}}",
        "label": "[IP 04] Becoming an Instructor · Satisfied",
        "ord": "Satisfied",
        "item": "[IP 04] Becoming an Instructor"
      },
      {
        "tok": "{{k_s5_sIp04BecomingAn_U}}",
        "label": "[IP 04] Becoming an Instructor · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[IP 04] Becoming an Instructor"
      },
      {
        "tok": "{{k_s5_sIp05TheBasic_S}}",
        "label": "[IP 05] The Basic Instructor · Satisfied",
        "ord": "Satisfied",
        "item": "[IP 05] The Basic Instructor"
      },
      {
        "tok": "{{k_s5_sIp05TheBasic_U}}",
        "label": "[IP 05] The Basic Instructor · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[IP 05] The Basic Instructor"
      },
      {
        "tok": "{{k_s5_sIp06TheAdvanced_S}}",
        "label": "[IP 06] The Advanced Instructor · Satisfied",
        "ord": "Satisfied",
        "item": "[IP 06] The Advanced Instructor"
      },
      {
        "tok": "{{k_s5_sIp06TheAdvanced_U}}",
        "label": "[IP 06] The Advanced Instructor · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "[IP 06] The Advanced Instructor"
      },
      {
        "tok": "{{k_s6_sRecurrentA_S}}",
        "label": "Recurrent A · Satisfied",
        "ord": "Satisfied",
        "item": "Recurrent A"
      },
      {
        "tok": "{{k_s6_sRecurrentA_U}}",
        "label": "Recurrent A · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "Recurrent A"
      },
      {
        "tok": "{{k_s6_sRecurrentE_S}}",
        "label": "Recurrent E · Satisfied",
        "ord": "Satisfied",
        "item": "Recurrent E"
      },
      {
        "tok": "{{k_s6_sRecurrentE_U}}",
        "label": "Recurrent E · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "Recurrent E"
      },
      {
        "tok": "{{k_s6_sRecurrentIr_S}}",
        "label": "Recurrent IR · Satisfied",
        "ord": "Satisfied",
        "item": "Recurrent IR"
      },
      {
        "tok": "{{k_s6_sRecurrentIr_U}}",
        "label": "Recurrent IR · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "Recurrent IR"
      },
      {
        "tok": "{{k_s6_sRecurrentNight_S}}",
        "label": "Recurrent Night · Satisfied",
        "ord": "Satisfied",
        "item": "Recurrent Night"
      },
      {
        "tok": "{{k_s6_sRecurrentNight_U}}",
        "label": "Recurrent Night · Unsatisfied",
        "ord": "Unsatisfied",
        "item": "Recurrent Night"
      }
    ],
    "tables": [],
    "boxesInDocx": 94,
    "approval": [],
    "manual": [
      {
        "tok": "{{htComment}}",
        "label": "Comment",
        "labelTh": "ความเห็น",
        "sign": false
      },
      {
        "tok": "{{htName}}",
        "label": "Head of Training name",
        "labelTh": "ชื่อหัวหน้าครูฝึก",
        "sign": false
      },
      {
        "tok": "{{htDate}}",
        "label": "Date",
        "labelTh": "วันที่",
        "sign": false
      },
      {
        "tok": "{{sig_htSign}}",
        "label": "Head of Training signature",
        "labelTh": "ลายเซ็นหัวหน้าครูฝึก",
        "sign": true
      }
    ]
  },
  "EFM": {
    "abbr": "EFM",
    "docx": "D-0507-EFM-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "Date",
        "tok": "{{evalDate}}"
      },
      {
        "label": "Trainee Name",
        "tok": "{{trainee}}"
      },
      {
        "label": "Subject / Mission",
        "tok": "{{subject}}"
      },
      {
        "label": "Class",
        "tok": "{{classNo}}"
      },
      {
        "label": "Evaluator Name:",
        "tok": "{{evName}}"
      }
    ],
    "byLine": [],
    "boxes": [
      {
        "tok": "{{k_trainType_ground}}",
        "label": "Ground",
        "ord": "Ground"
      },
      {
        "tok": "{{k_trainType_flight}}",
        "label": "Flight",
        "ord": "Flight"
      },
      {
        "tok": "{{k_trainType_simulator}}",
        "label": "Simulator",
        "ord": "Simulator"
      },
      {
        "tok": "{{k_trainType_recurrent}}",
        "label": "Recurrent",
        "ord": "Recurrent"
      },
      {
        "tok": "{{k_trainType_progressive}}",
        "label": "Progressive / standard check",
        "ord": "Progressive / standard check"
      },
      {
        "tok": "{{k_teach_tTheContentInThe_excellent}}",
        "label": "The content in the lesson was · Excellent",
        "ord": "Excellent",
        "item": "The content in the lesson was"
      },
      {
        "tok": "{{k_teach_tTheContentInThe_verygood}}",
        "label": "The content in the lesson was · Very good",
        "ord": "Very good",
        "item": "The content in the lesson was"
      },
      {
        "tok": "{{k_teach_tTheContentInThe_good}}",
        "label": "The content in the lesson was · Good",
        "ord": "Good",
        "item": "The content in the lesson was"
      },
      {
        "tok": "{{k_teach_tTheContentInThe_fair}}",
        "label": "The content in the lesson was · Fair",
        "ord": "Fair",
        "item": "The content in the lesson was"
      },
      {
        "tok": "{{k_teach_tTheContentInThe_poor}}",
        "label": "The content in the lesson was · Poor",
        "ord": "Poor",
        "item": "The content in the lesson was"
      },
      {
        "tok": "{{k_teach_tTheContentInThe_na}}",
        "label": "The content in the lesson was · N/A",
        "ord": "N/A",
        "item": "The content in the lesson was"
      },
      {
        "tok": "{{k_teach_tTheInstructorsContributionTo_excellent}}",
        "label": "The instructor's contribution to the training/course was · Excellent",
        "ord": "Excellent",
        "item": "The instructor's contribution to the training/course was"
      },
      {
        "tok": "{{k_teach_tTheInstructorsContributionTo_verygood}}",
        "label": "The instructor's contribution to the training/course was · Very good",
        "ord": "Very good",
        "item": "The instructor's contribution to the training/course was"
      },
      {
        "tok": "{{k_teach_tTheInstructorsContributionTo_good}}",
        "label": "The instructor's contribution to the training/course was · Good",
        "ord": "Good",
        "item": "The instructor's contribution to the training/course was"
      },
      {
        "tok": "{{k_teach_tTheInstructorsContributionTo_fair}}",
        "label": "The instructor's contribution to the training/course was · Fair",
        "ord": "Fair",
        "item": "The instructor's contribution to the training/course was"
      },
      {
        "tok": "{{k_teach_tTheInstructorsContributionTo_poor}}",
        "label": "The instructor's contribution to the training/course was · Poor",
        "ord": "Poor",
        "item": "The instructor's contribution to the training/course was"
      },
      {
        "tok": "{{k_teach_tTheInstructorsContributionTo_na}}",
        "label": "The instructor's contribution to the training/course was · N/A",
        "ord": "N/A",
        "item": "The instructor's contribution to the training/course was"
      },
      {
        "tok": "{{k_teach_tTheInstructorsEffectivenessIn_excellent}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Excellent",
        "ord": "Excellent",
        "item": "The instructor's effectiveness in teaching the subject matter was"
      },
      {
        "tok": "{{k_teach_tTheInstructorsEffectivenessIn_verygood}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Very good",
        "ord": "Very good",
        "item": "The instructor's effectiveness in teaching the subject matter was"
      },
      {
        "tok": "{{k_teach_tTheInstructorsEffectivenessIn_good}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Good",
        "ord": "Good",
        "item": "The instructor's effectiveness in teaching the subject matter was"
      },
      {
        "tok": "{{k_teach_tTheInstructorsEffectivenessIn_fair}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Fair",
        "ord": "Fair",
        "item": "The instructor's effectiveness in teaching the subject matter was"
      },
      {
        "tok": "{{k_teach_tTheInstructorsEffectivenessIn_poor}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Poor",
        "ord": "Poor",
        "item": "The instructor's effectiveness in teaching the subject matter was"
      },
      {
        "tok": "{{k_teach_tTheInstructorsEffectivenessIn_na}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · N/A",
        "ord": "N/A",
        "item": "The instructor's effectiveness in teaching the subject matter was"
      },
      {
        "tok": "{{k_teach_tClarityOfInstructorsVoice_excellent}}",
        "label": "Clarity of instructor's voice was · Excellent",
        "ord": "Excellent",
        "item": "Clarity of instructor's voice was"
      },
      {
        "tok": "{{k_teach_tClarityOfInstructorsVoice_verygood}}",
        "label": "Clarity of instructor's voice was · Very good",
        "ord": "Very good",
        "item": "Clarity of instructor's voice was"
      },
      {
        "tok": "{{k_teach_tClarityOfInstructorsVoice_good}}",
        "label": "Clarity of instructor's voice was · Good",
        "ord": "Good",
        "item": "Clarity of instructor's voice was"
      },
      {
        "tok": "{{k_teach_tClarityOfInstructorsVoice_fair}}",
        "label": "Clarity of instructor's voice was · Fair",
        "ord": "Fair",
        "item": "Clarity of instructor's voice was"
      },
      {
        "tok": "{{k_teach_tClarityOfInstructorsVoice_poor}}",
        "label": "Clarity of instructor's voice was · Poor",
        "ord": "Poor",
        "item": "Clarity of instructor's voice was"
      },
      {
        "tok": "{{k_teach_tClarityOfInstructorsVoice_na}}",
        "label": "Clarity of instructor's voice was · N/A",
        "ord": "N/A",
        "item": "Clarity of instructor's voice was"
      },
      {
        "tok": "{{k_teach_tExplanationsByInstructorWere_excellent}}",
        "label": "Explanations by instructor were · Excellent",
        "ord": "Excellent",
        "item": "Explanations by instructor were"
      },
      {
        "tok": "{{k_teach_tExplanationsByInstructorWere_verygood}}",
        "label": "Explanations by instructor were · Very good",
        "ord": "Very good",
        "item": "Explanations by instructor were"
      },
      {
        "tok": "{{k_teach_tExplanationsByInstructorWere_good}}",
        "label": "Explanations by instructor were · Good",
        "ord": "Good",
        "item": "Explanations by instructor were"
      },
      {
        "tok": "{{k_teach_tExplanationsByInstructorWere_fair}}",
        "label": "Explanations by instructor were · Fair",
        "ord": "Fair",
        "item": "Explanations by instructor were"
      },
      {
        "tok": "{{k_teach_tExplanationsByInstructorWere_poor}}",
        "label": "Explanations by instructor were · Poor",
        "ord": "Poor",
        "item": "Explanations by instructor were"
      },
      {
        "tok": "{{k_teach_tExplanationsByInstructorWere_na}}",
        "label": "Explanations by instructor were · N/A",
        "ord": "N/A",
        "item": "Explanations by instructor were"
      },
      {
        "tok": "{{k_teach_tInstructorsUseOfExamples_excellent}}",
        "label": "Instructor's use of examples and illustrations was · Excellent",
        "ord": "Excellent",
        "item": "Instructor's use of examples and illustrations was"
      },
      {
        "tok": "{{k_teach_tInstructorsUseOfExamples_verygood}}",
        "label": "Instructor's use of examples and illustrations was · Very good",
        "ord": "Very good",
        "item": "Instructor's use of examples and illustrations was"
      },
      {
        "tok": "{{k_teach_tInstructorsUseOfExamples_good}}",
        "label": "Instructor's use of examples and illustrations was · Good",
        "ord": "Good",
        "item": "Instructor's use of examples and illustrations was"
      },
      {
        "tok": "{{k_teach_tInstructorsUseOfExamples_fair}}",
        "label": "Instructor's use of examples and illustrations was · Fair",
        "ord": "Fair",
        "item": "Instructor's use of examples and illustrations was"
      },
      {
        "tok": "{{k_teach_tInstructorsUseOfExamples_poor}}",
        "label": "Instructor's use of examples and illustrations was · Poor",
        "ord": "Poor",
        "item": "Instructor's use of examples and illustrations was"
      },
      {
        "tok": "{{k_teach_tInstructorsUseOfExamples_na}}",
        "label": "Instructor's use of examples and illustrations was · N/A",
        "ord": "N/A",
        "item": "Instructor's use of examples and illustrations was"
      },
      {
        "tok": "{{k_teach_tQualityOfQuestionsOr_excellent}}",
        "label": "Quality of questions or problems raised by the instructor was · Excellent",
        "ord": "Excellent",
        "item": "Quality of questions or problems raised by the instructor was"
      },
      {
        "tok": "{{k_teach_tQualityOfQuestionsOr_verygood}}",
        "label": "Quality of questions or problems raised by the instructor was · Very good",
        "ord": "Very good",
        "item": "Quality of questions or problems raised by the instructor was"
      },
      {
        "tok": "{{k_teach_tQualityOfQuestionsOr_good}}",
        "label": "Quality of questions or problems raised by the instructor was · Good",
        "ord": "Good",
        "item": "Quality of questions or problems raised by the instructor was"
      },
      {
        "tok": "{{k_teach_tQualityOfQuestionsOr_fair}}",
        "label": "Quality of questions or problems raised by the instructor was · Fair",
        "ord": "Fair",
        "item": "Quality of questions or problems raised by the instructor was"
      },
      {
        "tok": "{{k_teach_tQualityOfQuestionsOr_poor}}",
        "label": "Quality of questions or problems raised by the instructor was · Poor",
        "ord": "Poor",
        "item": "Quality of questions or problems raised by the instructor was"
      },
      {
        "tok": "{{k_teach_tQualityOfQuestionsOr_na}}",
        "label": "Quality of questions or problems raised by the instructor was · N/A",
        "ord": "N/A",
        "item": "Quality of questions or problems raised by the instructor was"
      },
      {
        "tok": "{{k_teach_tStudentsConfidenceInInstructors_excellent}}",
        "label": "Student's confidence in instructor's knowledge was · Excellent",
        "ord": "Excellent",
        "item": "Student's confidence in instructor's knowledge was"
      },
      {
        "tok": "{{k_teach_tStudentsConfidenceInInstructors_verygood}}",
        "label": "Student's confidence in instructor's knowledge was · Very good",
        "ord": "Very good",
        "item": "Student's confidence in instructor's knowledge was"
      },
      {
        "tok": "{{k_teach_tStudentsConfidenceInInstructors_good}}",
        "label": "Student's confidence in instructor's knowledge was · Good",
        "ord": "Good",
        "item": "Student's confidence in instructor's knowledge was"
      },
      {
        "tok": "{{k_teach_tStudentsConfidenceInInstructors_fair}}",
        "label": "Student's confidence in instructor's knowledge was · Fair",
        "ord": "Fair",
        "item": "Student's confidence in instructor's knowledge was"
      },
      {
        "tok": "{{k_teach_tStudentsConfidenceInInstructors_poor}}",
        "label": "Student's confidence in instructor's knowledge was · Poor",
        "ord": "Poor",
        "item": "Student's confidence in instructor's knowledge was"
      },
      {
        "tok": "{{k_teach_tStudentsConfidenceInInstructors_na}}",
        "label": "Student's confidence in instructor's knowledge was · N/A",
        "ord": "N/A",
        "item": "Student's confidence in instructor's knowledge was"
      },
      {
        "tok": "{{k_teach_tInstructorsEnthusiasmWas_excellent}}",
        "label": "Instructor's enthusiasm was · Excellent",
        "ord": "Excellent",
        "item": "Instructor's enthusiasm was"
      },
      {
        "tok": "{{k_teach_tInstructorsEnthusiasmWas_verygood}}",
        "label": "Instructor's enthusiasm was · Very good",
        "ord": "Very good",
        "item": "Instructor's enthusiasm was"
      },
      {
        "tok": "{{k_teach_tInstructorsEnthusiasmWas_good}}",
        "label": "Instructor's enthusiasm was · Good",
        "ord": "Good",
        "item": "Instructor's enthusiasm was"
      },
      {
        "tok": "{{k_teach_tInstructorsEnthusiasmWas_fair}}",
        "label": "Instructor's enthusiasm was · Fair",
        "ord": "Fair",
        "item": "Instructor's enthusiasm was"
      },
      {
        "tok": "{{k_teach_tInstructorsEnthusiasmWas_poor}}",
        "label": "Instructor's enthusiasm was · Poor",
        "ord": "Poor",
        "item": "Instructor's enthusiasm was"
      },
      {
        "tok": "{{k_teach_tInstructorsEnthusiasmWas_na}}",
        "label": "Instructor's enthusiasm was · N/A",
        "ord": "N/A",
        "item": "Instructor's enthusiasm was"
      },
      {
        "tok": "{{k_teach_tEncouragementGivenToStudents_excellent}}",
        "label": "Encouragement given to students to express themselves was · Excellent",
        "ord": "Excellent",
        "item": "Encouragement given to students to express themselves was"
      },
      {
        "tok": "{{k_teach_tEncouragementGivenToStudents_verygood}}",
        "label": "Encouragement given to students to express themselves was · Very good",
        "ord": "Very good",
        "item": "Encouragement given to students to express themselves was"
      },
      {
        "tok": "{{k_teach_tEncouragementGivenToStudents_good}}",
        "label": "Encouragement given to students to express themselves was · Good",
        "ord": "Good",
        "item": "Encouragement given to students to express themselves was"
      },
      {
        "tok": "{{k_teach_tEncouragementGivenToStudents_fair}}",
        "label": "Encouragement given to students to express themselves was · Fair",
        "ord": "Fair",
        "item": "Encouragement given to students to express themselves was"
      },
      {
        "tok": "{{k_teach_tEncouragementGivenToStudents_poor}}",
        "label": "Encouragement given to students to express themselves was · Poor",
        "ord": "Poor",
        "item": "Encouragement given to students to express themselves was"
      },
      {
        "tok": "{{k_teach_tEncouragementGivenToStudents_na}}",
        "label": "Encouragement given to students to express themselves was · N/A",
        "ord": "N/A",
        "item": "Encouragement given to students to express themselves was"
      },
      {
        "tok": "{{k_teach_tAnswersToStudentQuestions_excellent}}",
        "label": "Answers to student questions were · Excellent",
        "ord": "Excellent",
        "item": "Answers to student questions were"
      },
      {
        "tok": "{{k_teach_tAnswersToStudentQuestions_verygood}}",
        "label": "Answers to student questions were · Very good",
        "ord": "Very good",
        "item": "Answers to student questions were"
      },
      {
        "tok": "{{k_teach_tAnswersToStudentQuestions_good}}",
        "label": "Answers to student questions were · Good",
        "ord": "Good",
        "item": "Answers to student questions were"
      },
      {
        "tok": "{{k_teach_tAnswersToStudentQuestions_fair}}",
        "label": "Answers to student questions were · Fair",
        "ord": "Fair",
        "item": "Answers to student questions were"
      },
      {
        "tok": "{{k_teach_tAnswersToStudentQuestions_poor}}",
        "label": "Answers to student questions were · Poor",
        "ord": "Poor",
        "item": "Answers to student questions were"
      },
      {
        "tok": "{{k_teach_tAnswersToStudentQuestions_na}}",
        "label": "Answers to student questions were · N/A",
        "ord": "N/A",
        "item": "Answers to student questions were"
      },
      {
        "tok": "{{k_teach_tAvailabilityOfExtraHelp_excellent}}",
        "label": "Availability of extra help when needed was · Excellent",
        "ord": "Excellent",
        "item": "Availability of extra help when needed was"
      },
      {
        "tok": "{{k_teach_tAvailabilityOfExtraHelp_verygood}}",
        "label": "Availability of extra help when needed was · Very good",
        "ord": "Very good",
        "item": "Availability of extra help when needed was"
      },
      {
        "tok": "{{k_teach_tAvailabilityOfExtraHelp_good}}",
        "label": "Availability of extra help when needed was · Good",
        "ord": "Good",
        "item": "Availability of extra help when needed was"
      },
      {
        "tok": "{{k_teach_tAvailabilityOfExtraHelp_fair}}",
        "label": "Availability of extra help when needed was · Fair",
        "ord": "Fair",
        "item": "Availability of extra help when needed was"
      },
      {
        "tok": "{{k_teach_tAvailabilityOfExtraHelp_poor}}",
        "label": "Availability of extra help when needed was · Poor",
        "ord": "Poor",
        "item": "Availability of extra help when needed was"
      },
      {
        "tok": "{{k_teach_tAvailabilityOfExtraHelp_na}}",
        "label": "Availability of extra help when needed was · N/A",
        "ord": "N/A",
        "item": "Availability of extra help when needed was"
      },
      {
        "tok": "{{k_teach_tUseOfClassTime_excellent}}",
        "label": "Use of class time was · Excellent",
        "ord": "Excellent",
        "item": "Use of class time was"
      },
      {
        "tok": "{{k_teach_tUseOfClassTime_verygood}}",
        "label": "Use of class time was · Very good",
        "ord": "Very good",
        "item": "Use of class time was"
      },
      {
        "tok": "{{k_teach_tUseOfClassTime_good}}",
        "label": "Use of class time was · Good",
        "ord": "Good",
        "item": "Use of class time was"
      },
      {
        "tok": "{{k_teach_tUseOfClassTime_fair}}",
        "label": "Use of class time was · Fair",
        "ord": "Fair",
        "item": "Use of class time was"
      },
      {
        "tok": "{{k_teach_tUseOfClassTime_poor}}",
        "label": "Use of class time was · Poor",
        "ord": "Poor",
        "item": "Use of class time was"
      },
      {
        "tok": "{{k_teach_tUseOfClassTime_na}}",
        "label": "Use of class time was · N/A",
        "ord": "N/A",
        "item": "Use of class time was"
      },
      {
        "tok": "{{k_teach_tInstructorsInterestInStudents_excellent}}",
        "label": "Instructor's interest in student's progress was · Excellent",
        "ord": "Excellent",
        "item": "Instructor's interest in student's progress was"
      },
      {
        "tok": "{{k_teach_tInstructorsInterestInStudents_verygood}}",
        "label": "Instructor's interest in student's progress was · Very good",
        "ord": "Very good",
        "item": "Instructor's interest in student's progress was"
      },
      {
        "tok": "{{k_teach_tInstructorsInterestInStudents_good}}",
        "label": "Instructor's interest in student's progress was · Good",
        "ord": "Good",
        "item": "Instructor's interest in student's progress was"
      },
      {
        "tok": "{{k_teach_tInstructorsInterestInStudents_fair}}",
        "label": "Instructor's interest in student's progress was · Fair",
        "ord": "Fair",
        "item": "Instructor's interest in student's progress was"
      },
      {
        "tok": "{{k_teach_tInstructorsInterestInStudents_poor}}",
        "label": "Instructor's interest in student's progress was · Poor",
        "ord": "Poor",
        "item": "Instructor's interest in student's progress was"
      },
      {
        "tok": "{{k_teach_tInstructorsInterestInStudents_na}}",
        "label": "Instructor's interest in student's progress was · N/A",
        "ord": "N/A",
        "item": "Instructor's interest in student's progress was"
      },
      {
        "tok": "{{k_teach_tAmountYouLearnedWas_excellent}}",
        "label": "Amount you learned was · Excellent",
        "ord": "Excellent",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_teach_tAmountYouLearnedWas_verygood}}",
        "label": "Amount you learned was · Very good",
        "ord": "Very good",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_teach_tAmountYouLearnedWas_good}}",
        "label": "Amount you learned was · Good",
        "ord": "Good",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_teach_tAmountYouLearnedWas_fair}}",
        "label": "Amount you learned was · Fair",
        "ord": "Fair",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_teach_tAmountYouLearnedWas_poor}}",
        "label": "Amount you learned was · Poor",
        "ord": "Poor",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_teach_tAmountYouLearnedWas_na}}",
        "label": "Amount you learned was · N/A",
        "ord": "N/A",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_teach_tRelevanceOfCoursetrainingContent_excellent}}",
        "label": "Relevance of course/training content was · Excellent",
        "ord": "Excellent",
        "item": "Relevance of course/training content was"
      },
      {
        "tok": "{{k_teach_tRelevanceOfCoursetrainingContent_verygood}}",
        "label": "Relevance of course/training content was · Very good",
        "ord": "Very good",
        "item": "Relevance of course/training content was"
      },
      {
        "tok": "{{k_teach_tRelevanceOfCoursetrainingContent_good}}",
        "label": "Relevance of course/training content was · Good",
        "ord": "Good",
        "item": "Relevance of course/training content was"
      },
      {
        "tok": "{{k_teach_tRelevanceOfCoursetrainingContent_fair}}",
        "label": "Relevance of course/training content was · Fair",
        "ord": "Fair",
        "item": "Relevance of course/training content was"
      },
      {
        "tok": "{{k_teach_tRelevanceOfCoursetrainingContent_poor}}",
        "label": "Relevance of course/training content was · Poor",
        "ord": "Poor",
        "item": "Relevance of course/training content was"
      },
      {
        "tok": "{{k_teach_tRelevanceOfCoursetrainingContent_na}}",
        "label": "Relevance of course/training content was · N/A",
        "ord": "N/A",
        "item": "Relevance of course/training content was"
      },
      {
        "tok": "{{k_teach_tGradingTechniquesWere_excellent}}",
        "label": "Grading techniques were · Excellent",
        "ord": "Excellent",
        "item": "Grading techniques were"
      },
      {
        "tok": "{{k_teach_tGradingTechniquesWere_verygood}}",
        "label": "Grading techniques were · Very good",
        "ord": "Very good",
        "item": "Grading techniques were"
      },
      {
        "tok": "{{k_teach_tGradingTechniquesWere_good}}",
        "label": "Grading techniques were · Good",
        "ord": "Good",
        "item": "Grading techniques were"
      },
      {
        "tok": "{{k_teach_tGradingTechniquesWere_fair}}",
        "label": "Grading techniques were · Fair",
        "ord": "Fair",
        "item": "Grading techniques were"
      },
      {
        "tok": "{{k_teach_tGradingTechniquesWere_poor}}",
        "label": "Grading techniques were · Poor",
        "ord": "Poor",
        "item": "Grading techniques were"
      },
      {
        "tok": "{{k_teach_tGradingTechniquesWere_na}}",
        "label": "Grading techniques were · N/A",
        "ord": "N/A",
        "item": "Grading techniques were"
      },
      {
        "tok": "{{k_teach_tReasonablenessOfAssignedWork_excellent}}",
        "label": "Reasonableness of assigned work was · Excellent",
        "ord": "Excellent",
        "item": "Reasonableness of assigned work was"
      },
      {
        "tok": "{{k_teach_tReasonablenessOfAssignedWork_verygood}}",
        "label": "Reasonableness of assigned work was · Very good",
        "ord": "Very good",
        "item": "Reasonableness of assigned work was"
      },
      {
        "tok": "{{k_teach_tReasonablenessOfAssignedWork_good}}",
        "label": "Reasonableness of assigned work was · Good",
        "ord": "Good",
        "item": "Reasonableness of assigned work was"
      },
      {
        "tok": "{{k_teach_tReasonablenessOfAssignedWork_fair}}",
        "label": "Reasonableness of assigned work was · Fair",
        "ord": "Fair",
        "item": "Reasonableness of assigned work was"
      },
      {
        "tok": "{{k_teach_tReasonablenessOfAssignedWork_poor}}",
        "label": "Reasonableness of assigned work was · Poor",
        "ord": "Poor",
        "item": "Reasonableness of assigned work was"
      },
      {
        "tok": "{{k_teach_tReasonablenessOfAssignedWork_na}}",
        "label": "Reasonableness of assigned work was · N/A",
        "ord": "N/A",
        "item": "Reasonableness of assigned work was"
      },
      {
        "tok": "{{k_teach_tClarityOfStudentRequirements_excellent}}",
        "label": "Clarity of student requirements was · Excellent",
        "ord": "Excellent",
        "item": "Clarity of student requirements was"
      },
      {
        "tok": "{{k_teach_tClarityOfStudentRequirements_verygood}}",
        "label": "Clarity of student requirements was · Very good",
        "ord": "Very good",
        "item": "Clarity of student requirements was"
      },
      {
        "tok": "{{k_teach_tClarityOfStudentRequirements_good}}",
        "label": "Clarity of student requirements was · Good",
        "ord": "Good",
        "item": "Clarity of student requirements was"
      },
      {
        "tok": "{{k_teach_tClarityOfStudentRequirements_fair}}",
        "label": "Clarity of student requirements was · Fair",
        "ord": "Fair",
        "item": "Clarity of student requirements was"
      },
      {
        "tok": "{{k_teach_tClarityOfStudentRequirements_poor}}",
        "label": "Clarity of student requirements was · Poor",
        "ord": "Poor",
        "item": "Clarity of student requirements was"
      },
      {
        "tok": "{{k_teach_tClarityOfStudentRequirements_na}}",
        "label": "Clarity of student requirements was · N/A",
        "ord": "N/A",
        "item": "Clarity of student requirements was"
      },
      {
        "tok": "{{k_f1_fRouteSelection_S}}",
        "label": "Route Selection · Satisfied",
        "ord": "Satisfied",
        "item": "Route Selection"
      },
      {
        "tok": "{{k_f1_fRouteSelection_U}}",
        "label": "Route Selection · Not satisfied",
        "ord": "Not satisfied",
        "item": "Route Selection"
      },
      {
        "tok": "{{k_f1_fRouteSelection_NA}}",
        "label": "Route Selection · Exempt",
        "ord": "Exempt",
        "item": "Route Selection"
      },
      {
        "tok": "{{k_f1_fFuelPlanning_S}}",
        "label": "Fuel Planning · Satisfied",
        "ord": "Satisfied",
        "item": "Fuel Planning"
      },
      {
        "tok": "{{k_f1_fFuelPlanning_U}}",
        "label": "Fuel Planning · Not satisfied",
        "ord": "Not satisfied",
        "item": "Fuel Planning"
      },
      {
        "tok": "{{k_f1_fFuelPlanning_NA}}",
        "label": "Fuel Planning · Exempt",
        "ord": "Exempt",
        "item": "Fuel Planning"
      },
      {
        "tok": "{{k_f1_fComplianceWithRegulations_S}}",
        "label": "Compliance with Regulations · Satisfied",
        "ord": "Satisfied",
        "item": "Compliance with Regulations"
      },
      {
        "tok": "{{k_f1_fComplianceWithRegulations_U}}",
        "label": "Compliance with Regulations · Not satisfied",
        "ord": "Not satisfied",
        "item": "Compliance with Regulations"
      },
      {
        "tok": "{{k_f1_fComplianceWithRegulations_NA}}",
        "label": "Compliance with Regulations · Exempt",
        "ord": "Exempt",
        "item": "Compliance with Regulations"
      },
      {
        "tok": "{{k_f1_fMassAndBalance_S}}",
        "label": "Mass and Balance · Satisfied",
        "ord": "Satisfied",
        "item": "Mass and Balance"
      },
      {
        "tok": "{{k_f1_fMassAndBalance_U}}",
        "label": "Mass and Balance · Not satisfied",
        "ord": "Not satisfied",
        "item": "Mass and Balance"
      },
      {
        "tok": "{{k_f1_fMassAndBalance_NA}}",
        "label": "Mass and Balance · Exempt",
        "ord": "Exempt",
        "item": "Mass and Balance"
      },
      {
        "tok": "{{k_f1_fMapVfrNavigationLog_S}}",
        "label": "Map, VFR Navigation Log, Dead Reckoning · Satisfied",
        "ord": "Satisfied",
        "item": "Map, VFR Navigation Log, Dead Reckoning"
      },
      {
        "tok": "{{k_f1_fMapVfrNavigationLog_U}}",
        "label": "Map, VFR Navigation Log, Dead Reckoning · Not satisfied",
        "ord": "Not satisfied",
        "item": "Map, VFR Navigation Log, Dead Reckoning"
      },
      {
        "tok": "{{k_f1_fMapVfrNavigationLog_NA}}",
        "label": "Map, VFR Navigation Log, Dead Reckoning · Exempt",
        "ord": "Exempt",
        "item": "Map, VFR Navigation Log, Dead Reckoning"
      },
      {
        "tok": "{{k_f1_fPreflightInspectionAndServicing_S}}",
        "label": "Preflight Inspection and Servicing · Satisfied",
        "ord": "Satisfied",
        "item": "Preflight Inspection and Servicing"
      },
      {
        "tok": "{{k_f1_fPreflightInspectionAndServicing_U}}",
        "label": "Preflight Inspection and Servicing · Not satisfied",
        "ord": "Not satisfied",
        "item": "Preflight Inspection and Servicing"
      },
      {
        "tok": "{{k_f1_fPreflightInspectionAndServicing_NA}}",
        "label": "Preflight Inspection and Servicing · Exempt",
        "ord": "Exempt",
        "item": "Preflight Inspection and Servicing"
      },
      {
        "tok": "{{k_f1_fCockpitManagement_S}}",
        "label": "Cockpit Management · Satisfied",
        "ord": "Satisfied",
        "item": "Cockpit Management"
      },
      {
        "tok": "{{k_f1_fCockpitManagement_U}}",
        "label": "Cockpit Management · Not satisfied",
        "ord": "Not satisfied",
        "item": "Cockpit Management"
      },
      {
        "tok": "{{k_f1_fCockpitManagement_NA}}",
        "label": "Cockpit Management · Exempt",
        "ord": "Exempt",
        "item": "Cockpit Management"
      },
      {
        "tok": "{{k_f2_fKnowledgeOfAtcProcedures_S}}",
        "label": "Knowledge of ATC Procedures · Satisfied",
        "ord": "Satisfied",
        "item": "Knowledge of ATC Procedures"
      },
      {
        "tok": "{{k_f2_fKnowledgeOfAtcProcedures_U}}",
        "label": "Knowledge of ATC Procedures · Not satisfied",
        "ord": "Not satisfied",
        "item": "Knowledge of ATC Procedures"
      },
      {
        "tok": "{{k_f2_fKnowledgeOfAtcProcedures_NA}}",
        "label": "Knowledge of ATC Procedures · Exempt",
        "ord": "Exempt",
        "item": "Knowledge of ATC Procedures"
      },
      {
        "tok": "{{k_f2_fAbilityToCommunicateAtc_S}}",
        "label": "Ability to Communicate ATC Procedures · Satisfied",
        "ord": "Satisfied",
        "item": "Ability to Communicate ATC Procedures"
      },
      {
        "tok": "{{k_f2_fAbilityToCommunicateAtc_U}}",
        "label": "Ability to Communicate ATC Procedures · Not satisfied",
        "ord": "Not satisfied",
        "item": "Ability to Communicate ATC Procedures"
      },
      {
        "tok": "{{k_f2_fAbilityToCommunicateAtc_NA}}",
        "label": "Ability to Communicate ATC Procedures · Exempt",
        "ord": "Exempt",
        "item": "Ability to Communicate ATC Procedures"
      },
      {
        "tok": "{{k_f3_fExplanationOfRouteProcedures_S}}",
        "label": "Explanation of Route Procedures · Satisfied",
        "ord": "Satisfied",
        "item": "Explanation of Route Procedures"
      },
      {
        "tok": "{{k_f3_fExplanationOfRouteProcedures_U}}",
        "label": "Explanation of Route Procedures · Not satisfied",
        "ord": "Not satisfied",
        "item": "Explanation of Route Procedures"
      },
      {
        "tok": "{{k_f3_fExplanationOfRouteProcedures_NA}}",
        "label": "Explanation of Route Procedures · Exempt",
        "ord": "Exempt",
        "item": "Explanation of Route Procedures"
      },
      {
        "tok": "{{k_f3_fProperUseOfRoute_S}}",
        "label": "Proper Use of Route Procedures · Satisfied",
        "ord": "Satisfied",
        "item": "Proper Use of Route Procedures"
      },
      {
        "tok": "{{k_f3_fProperUseOfRoute_U}}",
        "label": "Proper Use of Route Procedures · Not satisfied",
        "ord": "Not satisfied",
        "item": "Proper Use of Route Procedures"
      },
      {
        "tok": "{{k_f3_fProperUseOfRoute_NA}}",
        "label": "Proper Use of Route Procedures · Exempt",
        "ord": "Exempt",
        "item": "Proper Use of Route Procedures"
      },
      {
        "tok": "{{k_f4_fCommunicationWithAtc_S}}",
        "label": "Communication with ATC · Satisfied",
        "ord": "Satisfied",
        "item": "Communication with ATC"
      },
      {
        "tok": "{{k_f4_fCommunicationWithAtc_U}}",
        "label": "Communication with ATC · Not satisfied",
        "ord": "Not satisfied",
        "item": "Communication with ATC"
      },
      {
        "tok": "{{k_f4_fCommunicationWithAtc_NA}}",
        "label": "Communication with ATC · Exempt",
        "ord": "Exempt",
        "item": "Communication with ATC"
      },
      {
        "tok": "{{k_f4_fCommunicationWithOtherAircraft_S}}",
        "label": "Communication with Other Aircraft · Satisfied",
        "ord": "Satisfied",
        "item": "Communication with Other Aircraft"
      },
      {
        "tok": "{{k_f4_fCommunicationWithOtherAircraft_U}}",
        "label": "Communication with Other Aircraft · Not satisfied",
        "ord": "Not satisfied",
        "item": "Communication with Other Aircraft"
      },
      {
        "tok": "{{k_f4_fCommunicationWithOtherAircraft_NA}}",
        "label": "Communication with Other Aircraft · Exempt",
        "ord": "Exempt",
        "item": "Communication with Other Aircraft"
      },
      {
        "tok": "{{k_f5_fInterpretationOfWeatherReports_S}}",
        "label": "Interpretation of Weather Reports · Satisfied",
        "ord": "Satisfied",
        "item": "Interpretation of Weather Reports"
      },
      {
        "tok": "{{k_f5_fInterpretationOfWeatherReports_U}}",
        "label": "Interpretation of Weather Reports · Not satisfied",
        "ord": "Not satisfied",
        "item": "Interpretation of Weather Reports"
      },
      {
        "tok": "{{k_f5_fInterpretationOfWeatherReports_NA}}",
        "label": "Interpretation of Weather Reports · Exempt",
        "ord": "Exempt",
        "item": "Interpretation of Weather Reports"
      },
      {
        "tok": "{{k_f5_fInterpretationOfWeatherForecasts_S}}",
        "label": "Interpretation of Weather Forecasts · Satisfied",
        "ord": "Satisfied",
        "item": "Interpretation of Weather Forecasts"
      },
      {
        "tok": "{{k_f5_fInterpretationOfWeatherForecasts_U}}",
        "label": "Interpretation of Weather Forecasts · Not satisfied",
        "ord": "Not satisfied",
        "item": "Interpretation of Weather Forecasts"
      },
      {
        "tok": "{{k_f5_fInterpretationOfWeatherForecasts_NA}}",
        "label": "Interpretation of Weather Forecasts · Exempt",
        "ord": "Exempt",
        "item": "Interpretation of Weather Forecasts"
      },
      {
        "tok": "{{k_f6_fAbilityToAnswerTechnical_S}}",
        "label": "Ability to Answer Technical Questions · Satisfied",
        "ord": "Satisfied",
        "item": "Ability to Answer Technical Questions"
      },
      {
        "tok": "{{k_f6_fAbilityToAnswerTechnical_U}}",
        "label": "Ability to Answer Technical Questions · Not satisfied",
        "ord": "Not satisfied",
        "item": "Ability to Answer Technical Questions"
      },
      {
        "tok": "{{k_f6_fAbilityToAnswerTechnical_NA}}",
        "label": "Ability to Answer Technical Questions · Exempt",
        "ord": "Exempt",
        "item": "Ability to Answer Technical Questions"
      },
      {
        "tok": "{{k_f6_fRelevanceOfTechnicalKnowledge_S}}",
        "label": "Relevance of Technical Knowledge · Satisfied",
        "ord": "Satisfied",
        "item": "Relevance of Technical Knowledge"
      },
      {
        "tok": "{{k_f6_fRelevanceOfTechnicalKnowledge_U}}",
        "label": "Relevance of Technical Knowledge · Not satisfied",
        "ord": "Not satisfied",
        "item": "Relevance of Technical Knowledge"
      },
      {
        "tok": "{{k_f6_fRelevanceOfTechnicalKnowledge_NA}}",
        "label": "Relevance of Technical Knowledge · Exempt",
        "ord": "Exempt",
        "item": "Relevance of Technical Knowledge"
      },
      {
        "tok": "{{k_f7_fAdherenceToCompanyPolicies_S}}",
        "label": "Adherence to Company Policies · Satisfied",
        "ord": "Satisfied",
        "item": "Adherence to Company Policies"
      },
      {
        "tok": "{{k_f7_fAdherenceToCompanyPolicies_U}}",
        "label": "Adherence to Company Policies · Not satisfied",
        "ord": "Not satisfied",
        "item": "Adherence to Company Policies"
      },
      {
        "tok": "{{k_f7_fAdherenceToCompanyPolicies_NA}}",
        "label": "Adherence to Company Policies · Exempt",
        "ord": "Exempt",
        "item": "Adherence to Company Policies"
      },
      {
        "tok": "{{k_f7_fKnowledgeOfCompanyRegulations_S}}",
        "label": "Knowledge of Company Regulations · Satisfied",
        "ord": "Satisfied",
        "item": "Knowledge of Company Regulations"
      },
      {
        "tok": "{{k_f7_fKnowledgeOfCompanyRegulations_U}}",
        "label": "Knowledge of Company Regulations · Not satisfied",
        "ord": "Not satisfied",
        "item": "Knowledge of Company Regulations"
      },
      {
        "tok": "{{k_f7_fKnowledgeOfCompanyRegulations_NA}}",
        "label": "Knowledge of Company Regulations · Exempt",
        "ord": "Exempt",
        "item": "Knowledge of Company Regulations"
      },
      {
        "tok": "{{k_f8_fKnowledgeOfEmergencyEquipment_S}}",
        "label": "Knowledge of Emergency Equipment · Satisfied",
        "ord": "Satisfied",
        "item": "Knowledge of Emergency Equipment"
      },
      {
        "tok": "{{k_f8_fKnowledgeOfEmergencyEquipment_U}}",
        "label": "Knowledge of Emergency Equipment · Not satisfied",
        "ord": "Not satisfied",
        "item": "Knowledge of Emergency Equipment"
      },
      {
        "tok": "{{k_f8_fKnowledgeOfEmergencyEquipment_NA}}",
        "label": "Knowledge of Emergency Equipment · Exempt",
        "ord": "Exempt",
        "item": "Knowledge of Emergency Equipment"
      },
      {
        "tok": "{{k_f8_fDemonstrationOfEmergencyProcedures_S}}",
        "label": "Demonstration of Emergency Procedures · Satisfied",
        "ord": "Satisfied",
        "item": "Demonstration of Emergency Procedures"
      },
      {
        "tok": "{{k_f8_fDemonstrationOfEmergencyProcedures_U}}",
        "label": "Demonstration of Emergency Procedures · Not satisfied",
        "ord": "Not satisfied",
        "item": "Demonstration of Emergency Procedures"
      },
      {
        "tok": "{{k_f8_fDemonstrationOfEmergencyProcedures_NA}}",
        "label": "Demonstration of Emergency Procedures · Exempt",
        "ord": "Exempt",
        "item": "Demonstration of Emergency Procedures"
      },
      {
        "tok": "{{k_f9_fFosteringCrewCooperation_S}}",
        "label": "Fostering Crew Cooperation · Satisfied",
        "ord": "Satisfied",
        "item": "Fostering Crew Cooperation"
      },
      {
        "tok": "{{k_f9_fFosteringCrewCooperation_U}}",
        "label": "Fostering Crew Cooperation · Not satisfied",
        "ord": "Not satisfied",
        "item": "Fostering Crew Cooperation"
      },
      {
        "tok": "{{k_f9_fFosteringCrewCooperation_NA}}",
        "label": "Fostering Crew Cooperation · Exempt",
        "ord": "Exempt",
        "item": "Fostering Crew Cooperation"
      },
      {
        "tok": "{{k_f9_fCoordinationDuringFlight_S}}",
        "label": "Coordination During Flight · Satisfied",
        "ord": "Satisfied",
        "item": "Coordination During Flight"
      },
      {
        "tok": "{{k_f9_fCoordinationDuringFlight_U}}",
        "label": "Coordination During Flight · Not satisfied",
        "ord": "Not satisfied",
        "item": "Coordination During Flight"
      },
      {
        "tok": "{{k_f9_fCoordinationDuringFlight_NA}}",
        "label": "Coordination During Flight · Exempt",
        "ord": "Exempt",
        "item": "Coordination During Flight"
      },
      {
        "tok": "{{k_f10_fDecisionmakingDuringFlight_S}}",
        "label": "Decision-Making During Flight · Satisfied",
        "ord": "Satisfied",
        "item": "Decision-Making During Flight"
      },
      {
        "tok": "{{k_f10_fDecisionmakingDuringFlight_U}}",
        "label": "Decision-Making During Flight · Not satisfied",
        "ord": "Not satisfied",
        "item": "Decision-Making During Flight"
      },
      {
        "tok": "{{k_f10_fDecisionmakingDuringFlight_NA}}",
        "label": "Decision-Making During Flight · Exempt",
        "ord": "Exempt",
        "item": "Decision-Making During Flight"
      },
      {
        "tok": "{{k_f10_fEfficiencyInFlightOperations_S}}",
        "label": "Efficiency in Flight Operations · Satisfied",
        "ord": "Satisfied",
        "item": "Efficiency in Flight Operations"
      },
      {
        "tok": "{{k_f10_fEfficiencyInFlightOperations_U}}",
        "label": "Efficiency in Flight Operations · Not satisfied",
        "ord": "Not satisfied",
        "item": "Efficiency in Flight Operations"
      },
      {
        "tok": "{{k_f10_fEfficiencyInFlightOperations_NA}}",
        "label": "Efficiency in Flight Operations · Exempt",
        "ord": "Exempt",
        "item": "Efficiency in Flight Operations"
      },
      {
        "tok": "{{k_f11_fKnowledgeOfAircraftSystems_S}}",
        "label": "Knowledge of Aircraft Systems · Satisfied",
        "ord": "Satisfied",
        "item": "Knowledge of Aircraft Systems"
      },
      {
        "tok": "{{k_f11_fKnowledgeOfAircraftSystems_U}}",
        "label": "Knowledge of Aircraft Systems · Not satisfied",
        "ord": "Not satisfied",
        "item": "Knowledge of Aircraft Systems"
      },
      {
        "tok": "{{k_f11_fKnowledgeOfAircraftSystems_NA}}",
        "label": "Knowledge of Aircraft Systems · Exempt",
        "ord": "Exempt",
        "item": "Knowledge of Aircraft Systems"
      },
      {
        "tok": "{{k_f11_fApplicationOfSystemsKnowledge_S}}",
        "label": "Application of Systems Knowledge During Flight · Satisfied",
        "ord": "Satisfied",
        "item": "Application of Systems Knowledge During Flight"
      },
      {
        "tok": "{{k_f11_fApplicationOfSystemsKnowledge_U}}",
        "label": "Application of Systems Knowledge During Flight · Not satisfied",
        "ord": "Not satisfied",
        "item": "Application of Systems Knowledge During Flight"
      },
      {
        "tok": "{{k_f11_fApplicationOfSystemsKnowledge_NA}}",
        "label": "Application of Systems Knowledge During Flight · Exempt",
        "ord": "Exempt",
        "item": "Application of Systems Knowledge During Flight"
      },
      {
        "tok": "{{k_f12_fEngineStarting_S}}",
        "label": "Engine Starting · Satisfied",
        "ord": "Satisfied",
        "item": "Engine Starting"
      },
      {
        "tok": "{{k_f12_fEngineStarting_U}}",
        "label": "Engine Starting · Not satisfied",
        "ord": "Not satisfied",
        "item": "Engine Starting"
      },
      {
        "tok": "{{k_f12_fEngineStarting_NA}}",
        "label": "Engine Starting · Exempt",
        "ord": "Exempt",
        "item": "Engine Starting"
      },
      {
        "tok": "{{k_f12_fTaxiing_S}}",
        "label": "Taxiing · Satisfied",
        "ord": "Satisfied",
        "item": "Taxiing"
      },
      {
        "tok": "{{k_f12_fTaxiing_U}}",
        "label": "Taxiing · Not satisfied",
        "ord": "Not satisfied",
        "item": "Taxiing"
      },
      {
        "tok": "{{k_f12_fTaxiing_NA}}",
        "label": "Taxiing · Exempt",
        "ord": "Exempt",
        "item": "Taxiing"
      },
      {
        "tok": "{{k_f12_fPretakeoffCheck_S}}",
        "label": "Pre-Takeoff Check · Satisfied",
        "ord": "Satisfied",
        "item": "Pre-Takeoff Check"
      },
      {
        "tok": "{{k_f12_fPretakeoffCheck_U}}",
        "label": "Pre-Takeoff Check · Not satisfied",
        "ord": "Not satisfied",
        "item": "Pre-Takeoff Check"
      },
      {
        "tok": "{{k_f12_fPretakeoffCheck_NA}}",
        "label": "Pre-Takeoff Check · Exempt",
        "ord": "Exempt",
        "item": "Pre-Takeoff Check"
      },
      {
        "tok": "{{k_f12_fNormalAndCrossWind_S}}",
        "label": "Normal and Cross Wind Takeoff and Climb · Satisfied",
        "ord": "Satisfied",
        "item": "Normal and Cross Wind Takeoff and Climb"
      },
      {
        "tok": "{{k_f12_fNormalAndCrossWind_U}}",
        "label": "Normal and Cross Wind Takeoff and Climb · Not satisfied",
        "ord": "Not satisfied",
        "item": "Normal and Cross Wind Takeoff and Climb"
      },
      {
        "tok": "{{k_f12_fNormalAndCrossWind_NA}}",
        "label": "Normal and Cross Wind Takeoff and Climb · Exempt",
        "ord": "Exempt",
        "item": "Normal and Cross Wind Takeoff and Climb"
      },
      {
        "tok": "{{k_f12_fShortfieldTakeoffAndClimb_S}}",
        "label": "Short-Field Takeoff and Climb · Satisfied",
        "ord": "Satisfied",
        "item": "Short-Field Takeoff and Climb"
      },
      {
        "tok": "{{k_f12_fShortfieldTakeoffAndClimb_U}}",
        "label": "Short-Field Takeoff and Climb · Not satisfied",
        "ord": "Not satisfied",
        "item": "Short-Field Takeoff and Climb"
      },
      {
        "tok": "{{k_f12_fShortfieldTakeoffAndClimb_NA}}",
        "label": "Short-Field Takeoff and Climb · Exempt",
        "ord": "Exempt",
        "item": "Short-Field Takeoff and Climb"
      },
      {
        "tok": "{{k_f12_fSoftfieldTakeoffAndClimb_S}}",
        "label": "Soft-Field Takeoff and Climb · Satisfied",
        "ord": "Satisfied",
        "item": "Soft-Field Takeoff and Climb"
      },
      {
        "tok": "{{k_f12_fSoftfieldTakeoffAndClimb_U}}",
        "label": "Soft-Field Takeoff and Climb · Not satisfied",
        "ord": "Not satisfied",
        "item": "Soft-Field Takeoff and Climb"
      },
      {
        "tok": "{{k_f12_fSoftfieldTakeoffAndClimb_NA}}",
        "label": "Soft-Field Takeoff and Climb · Exempt",
        "ord": "Exempt",
        "item": "Soft-Field Takeoff and Climb"
      },
      {
        "tok": "{{k_f12_fStraightAndLevelFlight_S}}",
        "label": "Straight and Level Flight · Satisfied",
        "ord": "Satisfied",
        "item": "Straight and Level Flight"
      },
      {
        "tok": "{{k_f12_fStraightAndLevelFlight_U}}",
        "label": "Straight and Level Flight · Not satisfied",
        "ord": "Not satisfied",
        "item": "Straight and Level Flight"
      },
      {
        "tok": "{{k_f12_fStraightAndLevelFlight_NA}}",
        "label": "Straight and Level Flight · Exempt",
        "ord": "Exempt",
        "item": "Straight and Level Flight"
      },
      {
        "tok": "{{k_f12_fLevelTurns_S}}",
        "label": "Level Turns · Satisfied",
        "ord": "Satisfied",
        "item": "Level Turns"
      },
      {
        "tok": "{{k_f12_fLevelTurns_U}}",
        "label": "Level Turns · Not satisfied",
        "ord": "Not satisfied",
        "item": "Level Turns"
      },
      {
        "tok": "{{k_f12_fLevelTurns_NA}}",
        "label": "Level Turns · Exempt",
        "ord": "Exempt",
        "item": "Level Turns"
      },
      {
        "tok": "{{k_f12_fStraightClimbsAndClimbing_S}}",
        "label": "Straight Climbs and Climbing Turns · Satisfied",
        "ord": "Satisfied",
        "item": "Straight Climbs and Climbing Turns"
      },
      {
        "tok": "{{k_f12_fStraightClimbsAndClimbing_U}}",
        "label": "Straight Climbs and Climbing Turns · Not satisfied",
        "ord": "Not satisfied",
        "item": "Straight Climbs and Climbing Turns"
      },
      {
        "tok": "{{k_f12_fStraightClimbsAndClimbing_NA}}",
        "label": "Straight Climbs and Climbing Turns · Exempt",
        "ord": "Exempt",
        "item": "Straight Climbs and Climbing Turns"
      },
      {
        "tok": "{{k_f12_fStraightDescentAndDescending_S}}",
        "label": "Straight Descent and Descending Turns · Satisfied",
        "ord": "Satisfied",
        "item": "Straight Descent and Descending Turns"
      },
      {
        "tok": "{{k_f12_fStraightDescentAndDescending_U}}",
        "label": "Straight Descent and Descending Turns · Not satisfied",
        "ord": "Not satisfied",
        "item": "Straight Descent and Descending Turns"
      },
      {
        "tok": "{{k_f12_fStraightDescentAndDescending_NA}}",
        "label": "Straight Descent and Descending Turns · Exempt",
        "ord": "Exempt",
        "item": "Straight Descent and Descending Turns"
      },
      {
        "tok": "{{k_f12_fPoweronStalls_S}}",
        "label": "Power-On Stalls · Satisfied",
        "ord": "Satisfied",
        "item": "Power-On Stalls"
      },
      {
        "tok": "{{k_f12_fPoweronStalls_U}}",
        "label": "Power-On Stalls · Not satisfied",
        "ord": "Not satisfied",
        "item": "Power-On Stalls"
      },
      {
        "tok": "{{k_f12_fPoweronStalls_NA}}",
        "label": "Power-On Stalls · Exempt",
        "ord": "Exempt",
        "item": "Power-On Stalls"
      },
      {
        "tok": "{{k_f12_fPoweroffStalls_S}}",
        "label": "Power-Off Stalls · Satisfied",
        "ord": "Satisfied",
        "item": "Power-Off Stalls"
      },
      {
        "tok": "{{k_f12_fPoweroffStalls_U}}",
        "label": "Power-Off Stalls · Not satisfied",
        "ord": "Not satisfied",
        "item": "Power-Off Stalls"
      },
      {
        "tok": "{{k_f12_fPoweroffStalls_NA}}",
        "label": "Power-Off Stalls · Exempt",
        "ord": "Exempt",
        "item": "Power-Off Stalls"
      },
      {
        "tok": "{{k_f12_fManeuveringDuringSlowFlight_S}}",
        "label": "Maneuvering during Slow Flight · Satisfied",
        "ord": "Satisfied",
        "item": "Maneuvering during Slow Flight"
      },
      {
        "tok": "{{k_f12_fManeuveringDuringSlowFlight_U}}",
        "label": "Maneuvering during Slow Flight · Not satisfied",
        "ord": "Not satisfied",
        "item": "Maneuvering during Slow Flight"
      },
      {
        "tok": "{{k_f12_fManeuveringDuringSlowFlight_NA}}",
        "label": "Maneuvering during Slow Flight · Exempt",
        "ord": "Exempt",
        "item": "Maneuvering during Slow Flight"
      },
      {
        "tok": "{{k_f12_fSteepTurns_S}}",
        "label": "Steep Turns · Satisfied",
        "ord": "Satisfied",
        "item": "Steep Turns"
      },
      {
        "tok": "{{k_f12_fSteepTurns_U}}",
        "label": "Steep Turns · Not satisfied",
        "ord": "Not satisfied",
        "item": "Steep Turns"
      },
      {
        "tok": "{{k_f12_fSteepTurns_NA}}",
        "label": "Steep Turns · Exempt",
        "ord": "Exempt",
        "item": "Steep Turns"
      },
      {
        "tok": "{{k_f12_fEmergencyDescent_S}}",
        "label": "Emergency Descent · Satisfied",
        "ord": "Satisfied",
        "item": "Emergency Descent"
      },
      {
        "tok": "{{k_f12_fEmergencyDescent_U}}",
        "label": "Emergency Descent · Not satisfied",
        "ord": "Not satisfied",
        "item": "Emergency Descent"
      },
      {
        "tok": "{{k_f12_fEmergencyDescent_NA}}",
        "label": "Emergency Descent · Exempt",
        "ord": "Exempt",
        "item": "Emergency Descent"
      },
      {
        "tok": "{{k_f12_fEmergencyApproachAndLanding_S}}",
        "label": "Emergency Approach and Landing · Satisfied",
        "ord": "Satisfied",
        "item": "Emergency Approach and Landing"
      },
      {
        "tok": "{{k_f12_fEmergencyApproachAndLanding_U}}",
        "label": "Emergency Approach and Landing · Not satisfied",
        "ord": "Not satisfied",
        "item": "Emergency Approach and Landing"
      },
      {
        "tok": "{{k_f12_fEmergencyApproachAndLanding_NA}}",
        "label": "Emergency Approach and Landing · Exempt",
        "ord": "Exempt",
        "item": "Emergency Approach and Landing"
      },
      {
        "tok": "{{k_f12_fSystemsAndEquipmentMalfunction_S}}",
        "label": "Systems and Equipment Malfunction · Satisfied",
        "ord": "Satisfied",
        "item": "Systems and Equipment Malfunction"
      },
      {
        "tok": "{{k_f12_fSystemsAndEquipmentMalfunction_U}}",
        "label": "Systems and Equipment Malfunction · Not satisfied",
        "ord": "Not satisfied",
        "item": "Systems and Equipment Malfunction"
      },
      {
        "tok": "{{k_f12_fSystemsAndEquipmentMalfunction_NA}}",
        "label": "Systems and Equipment Malfunction · Exempt",
        "ord": "Exempt",
        "item": "Systems and Equipment Malfunction"
      },
      {
        "tok": "{{k_f12_fNormalAndCrosswindApproach_S}}",
        "label": "Normal and Crosswind Approach and Landing · Satisfied",
        "ord": "Satisfied",
        "item": "Normal and Crosswind Approach and Landing"
      },
      {
        "tok": "{{k_f12_fNormalAndCrosswindApproach_U}}",
        "label": "Normal and Crosswind Approach and Landing · Not satisfied",
        "ord": "Not satisfied",
        "item": "Normal and Crosswind Approach and Landing"
      },
      {
        "tok": "{{k_f12_fNormalAndCrosswindApproach_NA}}",
        "label": "Normal and Crosswind Approach and Landing · Exempt",
        "ord": "Exempt",
        "item": "Normal and Crosswind Approach and Landing"
      },
      {
        "tok": "{{k_f12_fSoftFieldApproachAnd_S}}",
        "label": "Soft Field Approach and Landing · Satisfied",
        "ord": "Satisfied",
        "item": "Soft Field Approach and Landing"
      },
      {
        "tok": "{{k_f12_fSoftFieldApproachAnd_U}}",
        "label": "Soft Field Approach and Landing · Not satisfied",
        "ord": "Not satisfied",
        "item": "Soft Field Approach and Landing"
      },
      {
        "tok": "{{k_f12_fSoftFieldApproachAnd_NA}}",
        "label": "Soft Field Approach and Landing · Exempt",
        "ord": "Exempt",
        "item": "Soft Field Approach and Landing"
      },
      {
        "tok": "{{k_f12_fShortFieldApproachAnd_S}}",
        "label": "Short Field Approach and Landing · Satisfied",
        "ord": "Satisfied",
        "item": "Short Field Approach and Landing"
      },
      {
        "tok": "{{k_f12_fShortFieldApproachAnd_U}}",
        "label": "Short Field Approach and Landing · Not satisfied",
        "ord": "Not satisfied",
        "item": "Short Field Approach and Landing"
      },
      {
        "tok": "{{k_f12_fShortFieldApproachAnd_NA}}",
        "label": "Short Field Approach and Landing · Exempt",
        "ord": "Exempt",
        "item": "Short Field Approach and Landing"
      },
      {
        "tok": "{{k_f12_fLostCommunicationProcedure_S}}",
        "label": "Lost Communication & Procedure · Satisfied",
        "ord": "Satisfied",
        "item": "Lost Communication & Procedure"
      },
      {
        "tok": "{{k_f12_fLostCommunicationProcedure_U}}",
        "label": "Lost Communication & Procedure · Not satisfied",
        "ord": "Not satisfied",
        "item": "Lost Communication & Procedure"
      },
      {
        "tok": "{{k_f12_fLostCommunicationProcedure_NA}}",
        "label": "Lost Communication & Procedure · Exempt",
        "ord": "Exempt",
        "item": "Lost Communication & Procedure"
      },
      {
        "tok": "{{k_f12_fGoaround_S}}",
        "label": "Go-Around · Satisfied",
        "ord": "Satisfied",
        "item": "Go-Around"
      },
      {
        "tok": "{{k_f12_fGoaround_U}}",
        "label": "Go-Around · Not satisfied",
        "ord": "Not satisfied",
        "item": "Go-Around"
      },
      {
        "tok": "{{k_f12_fGoaround_NA}}",
        "label": "Go-Around · Exempt",
        "ord": "Exempt",
        "item": "Go-Around"
      },
      {
        "tok": "{{k_f13_fDeclarationOfResult_S}}",
        "label": "Declaration of Result · Satisfied",
        "ord": "Satisfied",
        "item": "Declaration of Result"
      },
      {
        "tok": "{{k_f13_fDeclarationOfResult_U}}",
        "label": "Declaration of Result · Not satisfied",
        "ord": "Not satisfied",
        "item": "Declaration of Result"
      },
      {
        "tok": "{{k_f13_fDeclarationOfResult_NA}}",
        "label": "Declaration of Result · Exempt",
        "ord": "Exempt",
        "item": "Declaration of Result"
      },
      {
        "tok": "{{k_f13_fReasonOfTheResult_S}}",
        "label": "Reason of the Result · Satisfied",
        "ord": "Satisfied",
        "item": "Reason of the Result"
      },
      {
        "tok": "{{k_f13_fReasonOfTheResult_U}}",
        "label": "Reason of the Result · Not satisfied",
        "ord": "Not satisfied",
        "item": "Reason of the Result"
      },
      {
        "tok": "{{k_f13_fReasonOfTheResult_NA}}",
        "label": "Reason of the Result · Exempt",
        "ord": "Exempt",
        "item": "Reason of the Result"
      },
      {
        "tok": "{{k_f13_fRatingAndPerformanceObtained_S}}",
        "label": "Rating and Performance Obtained · Satisfied",
        "ord": "Satisfied",
        "item": "Rating and Performance Obtained"
      },
      {
        "tok": "{{k_f13_fRatingAndPerformanceObtained_U}}",
        "label": "Rating and Performance Obtained · Not satisfied",
        "ord": "Not satisfied",
        "item": "Rating and Performance Obtained"
      },
      {
        "tok": "{{k_f13_fRatingAndPerformanceObtained_NA}}",
        "label": "Rating and Performance Obtained · Exempt",
        "ord": "Exempt",
        "item": "Rating and Performance Obtained"
      },
      {
        "tok": "{{k_f13_fGuidanceForTheNext_S}}",
        "label": "Guidance for the Next Step · Satisfied",
        "ord": "Satisfied",
        "item": "Guidance for the Next Step"
      },
      {
        "tok": "{{k_f13_fGuidanceForTheNext_U}}",
        "label": "Guidance for the Next Step · Not satisfied",
        "ord": "Not satisfied",
        "item": "Guidance for the Next Step"
      },
      {
        "tok": "{{k_f13_fGuidanceForTheNext_NA}}",
        "label": "Guidance for the Next Step · Exempt",
        "ord": "Exempt",
        "item": "Guidance for the Next Step"
      },
      {
        "tok": "{{k_f13_fBalancingOfDebriefGood_S}}",
        "label": "Balancing of Debrief: Good and Bad Side · Satisfied",
        "ord": "Satisfied",
        "item": "Balancing of Debrief: Good and Bad Side"
      },
      {
        "tok": "{{k_f13_fBalancingOfDebriefGood_U}}",
        "label": "Balancing of Debrief: Good and Bad Side · Not satisfied",
        "ord": "Not satisfied",
        "item": "Balancing of Debrief: Good and Bad Side"
      },
      {
        "tok": "{{k_f13_fBalancingOfDebriefGood_NA}}",
        "label": "Balancing of Debrief: Good and Bad Side · Exempt",
        "ord": "Exempt",
        "item": "Balancing of Debrief: Good and Bad Side"
      },
      {
        "tok": "{{k_f13_fPleasantDebriefAtmosphere_S}}",
        "label": "Pleasant Debrief Atmosphere · Satisfied",
        "ord": "Satisfied",
        "item": "Pleasant Debrief Atmosphere"
      },
      {
        "tok": "{{k_f13_fPleasantDebriefAtmosphere_U}}",
        "label": "Pleasant Debrief Atmosphere · Not satisfied",
        "ord": "Not satisfied",
        "item": "Pleasant Debrief Atmosphere"
      },
      {
        "tok": "{{k_f13_fPleasantDebriefAtmosphere_NA}}",
        "label": "Pleasant Debrief Atmosphere · Exempt",
        "ord": "Exempt",
        "item": "Pleasant Debrief Atmosphere"
      },
      {
        "tok": "{{k_f14_fDiscipline_S}}",
        "label": "Discipline · Satisfied",
        "ord": "Satisfied",
        "item": "Discipline"
      },
      {
        "tok": "{{k_f14_fDiscipline_U}}",
        "label": "Discipline · Not satisfied",
        "ord": "Not satisfied",
        "item": "Discipline"
      },
      {
        "tok": "{{k_f14_fDiscipline_NA}}",
        "label": "Discipline · Exempt",
        "ord": "Exempt",
        "item": "Discipline"
      },
      {
        "tok": "{{k_f14_fSkillAndProficiency_S}}",
        "label": "Skill and Proficiency · Satisfied",
        "ord": "Satisfied",
        "item": "Skill and Proficiency"
      },
      {
        "tok": "{{k_f14_fSkillAndProficiency_U}}",
        "label": "Skill and Proficiency · Not satisfied",
        "ord": "Not satisfied",
        "item": "Skill and Proficiency"
      },
      {
        "tok": "{{k_f14_fSkillAndProficiency_NA}}",
        "label": "Skill and Proficiency · Exempt",
        "ord": "Exempt",
        "item": "Skill and Proficiency"
      },
      {
        "tok": "{{k_f14_fKnowledge_S}}",
        "label": "Knowledge · Satisfied",
        "ord": "Satisfied",
        "item": "Knowledge"
      },
      {
        "tok": "{{k_f14_fKnowledge_U}}",
        "label": "Knowledge · Not satisfied",
        "ord": "Not satisfied",
        "item": "Knowledge"
      },
      {
        "tok": "{{k_f14_fKnowledge_NA}}",
        "label": "Knowledge · Exempt",
        "ord": "Exempt",
        "item": "Knowledge"
      },
      {
        "tok": "{{k_f14_fSituationalAwareness_S}}",
        "label": "Situational Awareness · Satisfied",
        "ord": "Satisfied",
        "item": "Situational Awareness"
      },
      {
        "tok": "{{k_f14_fSituationalAwareness_U}}",
        "label": "Situational Awareness · Not satisfied",
        "ord": "Not satisfied",
        "item": "Situational Awareness"
      },
      {
        "tok": "{{k_f14_fSituationalAwareness_NA}}",
        "label": "Situational Awareness · Exempt",
        "ord": "Exempt",
        "item": "Situational Awareness"
      },
      {
        "tok": "{{k_f14_fJudgment_S}}",
        "label": "Judgment · Satisfied",
        "ord": "Satisfied",
        "item": "Judgment"
      },
      {
        "tok": "{{k_f14_fJudgment_U}}",
        "label": "Judgment · Not satisfied",
        "ord": "Not satisfied",
        "item": "Judgment"
      },
      {
        "tok": "{{k_f14_fJudgment_NA}}",
        "label": "Judgment · Exempt",
        "ord": "Exempt",
        "item": "Judgment"
      },
      {
        "tok": "{{k_f15_fInstructingCommunication_S}}",
        "label": "Instructing / Communication · Satisfied",
        "ord": "Satisfied",
        "item": "Instructing / Communication"
      },
      {
        "tok": "{{k_f15_fInstructingCommunication_U}}",
        "label": "Instructing / Communication · Not satisfied",
        "ord": "Not satisfied",
        "item": "Instructing / Communication"
      },
      {
        "tok": "{{k_f15_fInstructingCommunication_NA}}",
        "label": "Instructing / Communication · Exempt",
        "ord": "Exempt",
        "item": "Instructing / Communication"
      },
      {
        "tok": "{{k_f15_fDemonstrationAndGuidanceIn_S}}",
        "label": "Demonstration and Guidance in Flight · Satisfied",
        "ord": "Satisfied",
        "item": "Demonstration and Guidance in Flight"
      },
      {
        "tok": "{{k_f15_fDemonstrationAndGuidanceIn_U}}",
        "label": "Demonstration and Guidance in Flight · Not satisfied",
        "ord": "Not satisfied",
        "item": "Demonstration and Guidance in Flight"
      },
      {
        "tok": "{{k_f15_fDemonstrationAndGuidanceIn_NA}}",
        "label": "Demonstration and Guidance in Flight · Exempt",
        "ord": "Exempt",
        "item": "Demonstration and Guidance in Flight"
      },
      {
        "tok": "{{k_f15_fDrawTheAttentionTechnique_S}}",
        "label": "Draw the Attention Technique · Satisfied",
        "ord": "Satisfied",
        "item": "Draw the Attention Technique"
      },
      {
        "tok": "{{k_f15_fDrawTheAttentionTechnique_U}}",
        "label": "Draw the Attention Technique · Not satisfied",
        "ord": "Not satisfied",
        "item": "Draw the Attention Technique"
      },
      {
        "tok": "{{k_f15_fDrawTheAttentionTechnique_NA}}",
        "label": "Draw the Attention Technique · Exempt",
        "ord": "Exempt",
        "item": "Draw the Attention Technique"
      },
      {
        "tok": "{{k_f15_fInterveneTheStudentIn_S}}",
        "label": "Intervene the Student in Flight · Satisfied",
        "ord": "Satisfied",
        "item": "Intervene the Student in Flight"
      },
      {
        "tok": "{{k_f15_fInterveneTheStudentIn_U}}",
        "label": "Intervene the Student in Flight · Not satisfied",
        "ord": "Not satisfied",
        "item": "Intervene the Student in Flight"
      },
      {
        "tok": "{{k_f15_fInterveneTheStudentIn_NA}}",
        "label": "Intervene the Student in Flight · Exempt",
        "ord": "Exempt",
        "item": "Intervene the Student in Flight"
      },
      {
        "tok": "{{k_f15_fManeuveringPlanning_S}}",
        "label": "Maneuvering Planning · Satisfied",
        "ord": "Satisfied",
        "item": "Maneuvering Planning"
      },
      {
        "tok": "{{k_f15_fManeuveringPlanning_U}}",
        "label": "Maneuvering Planning · Not satisfied",
        "ord": "Not satisfied",
        "item": "Maneuvering Planning"
      },
      {
        "tok": "{{k_f15_fManeuveringPlanning_NA}}",
        "label": "Maneuvering Planning · Exempt",
        "ord": "Exempt",
        "item": "Maneuvering Planning"
      },
      {
        "tok": "{{k_f15_fErrorDetection_S}}",
        "label": "Error Detection · Satisfied",
        "ord": "Satisfied",
        "item": "Error Detection"
      },
      {
        "tok": "{{k_f15_fErrorDetection_U}}",
        "label": "Error Detection · Not satisfied",
        "ord": "Not satisfied",
        "item": "Error Detection"
      },
      {
        "tok": "{{k_f15_fErrorDetection_NA}}",
        "label": "Error Detection · Exempt",
        "ord": "Exempt",
        "item": "Error Detection"
      },
      {
        "tok": "{{k_f15_fDistractionTechnique_S}}",
        "label": "Distraction Technique · Satisfied",
        "ord": "Satisfied",
        "item": "Distraction Technique"
      },
      {
        "tok": "{{k_f15_fDistractionTechnique_U}}",
        "label": "Distraction Technique · Not satisfied",
        "ord": "Not satisfied",
        "item": "Distraction Technique"
      },
      {
        "tok": "{{k_f15_fDistractionTechnique_NA}}",
        "label": "Distraction Technique · Exempt",
        "ord": "Exempt",
        "item": "Distraction Technique"
      },
      {
        "tok": "{{k_f15_fInflightTeachingAtmosphere_S}}",
        "label": "Inflight Teaching Atmosphere · Satisfied",
        "ord": "Satisfied",
        "item": "Inflight Teaching Atmosphere"
      },
      {
        "tok": "{{k_f15_fInflightTeachingAtmosphere_U}}",
        "label": "Inflight Teaching Atmosphere · Not satisfied",
        "ord": "Not satisfied",
        "item": "Inflight Teaching Atmosphere"
      },
      {
        "tok": "{{k_f15_fInflightTeachingAtmosphere_NA}}",
        "label": "Inflight Teaching Atmosphere · Exempt",
        "ord": "Exempt",
        "item": "Inflight Teaching Atmosphere"
      },
      {
        "tok": "{{k_f15_fGhostingControlTechnique_S}}",
        "label": "Ghosting Control Technique · Satisfied",
        "ord": "Satisfied",
        "item": "Ghosting Control Technique"
      },
      {
        "tok": "{{k_f15_fGhostingControlTechnique_U}}",
        "label": "Ghosting Control Technique · Not satisfied",
        "ord": "Not satisfied",
        "item": "Ghosting Control Technique"
      },
      {
        "tok": "{{k_f15_fGhostingControlTechnique_NA}}",
        "label": "Ghosting Control Technique · Exempt",
        "ord": "Exempt",
        "item": "Ghosting Control Technique"
      },
      {
        "tok": "{{k_f15_fImmediateChangeOfTeaching_S}}",
        "label": "Immediate Change of Teaching · Satisfied",
        "ord": "Satisfied",
        "item": "Immediate Change of Teaching"
      },
      {
        "tok": "{{k_f15_fImmediateChangeOfTeaching_U}}",
        "label": "Immediate Change of Teaching · Not satisfied",
        "ord": "Not satisfied",
        "item": "Immediate Change of Teaching"
      },
      {
        "tok": "{{k_f15_fImmediateChangeOfTeaching_NA}}",
        "label": "Immediate Change of Teaching · Exempt",
        "ord": "Exempt",
        "item": "Immediate Change of Teaching"
      },
      {
        "tok": "{{k_f15_fInflightEndOfTraining_S}}",
        "label": "Inflight 'End of Training' · Satisfied",
        "ord": "Satisfied",
        "item": "Inflight 'End of Training'"
      },
      {
        "tok": "{{k_f15_fInflightEndOfTraining_U}}",
        "label": "Inflight 'End of Training' · Not satisfied",
        "ord": "Not satisfied",
        "item": "Inflight 'End of Training'"
      },
      {
        "tok": "{{k_f15_fInflightEndOfTraining_NA}}",
        "label": "Inflight 'End of Training' · Exempt",
        "ord": "Exempt",
        "item": "Inflight 'End of Training'"
      },
      {
        "tok": "{{k_f15_fAcceptableEnvelopeOfFault_S}}",
        "label": "Acceptable Envelope of Fault · Satisfied",
        "ord": "Satisfied",
        "item": "Acceptable Envelope of Fault"
      },
      {
        "tok": "{{k_f15_fAcceptableEnvelopeOfFault_U}}",
        "label": "Acceptable Envelope of Fault · Not satisfied",
        "ord": "Not satisfied",
        "item": "Acceptable Envelope of Fault"
      },
      {
        "tok": "{{k_f15_fAcceptableEnvelopeOfFault_NA}}",
        "label": "Acceptable Envelope of Fault · Exempt",
        "ord": "Exempt",
        "item": "Acceptable Envelope of Fault"
      },
      {
        "tok": "{{k_overall_excellent}}",
        "label": "Excellent",
        "ord": "Excellent"
      },
      {
        "tok": "{{k_overall_verygood}}",
        "label": "Very good",
        "ord": "Very good"
      },
      {
        "tok": "{{k_overall_good}}",
        "label": "Good",
        "ord": "Good"
      },
      {
        "tok": "{{k_overall_fair}}",
        "label": "Fair",
        "ord": "Fair"
      },
      {
        "tok": "{{k_overall_poor}}",
        "label": "Poor",
        "ord": "Poor"
      }
    ],
    "tables": [],
    "boxesInDocx": 340,
    "approval": [
      {
        "tok": "{{htName}}",
        "label": "Head of Training name",
        "labelTh": "ชื่อหัวหน้าครูฝึก",
        "sign": false
      },
      {
        "tok": "{{htDate}}",
        "label": "Date",
        "labelTh": "วันที่",
        "sign": false
      },
      {
        "tok": "{{htComment}}",
        "label": "Comment",
        "labelTh": "ความเห็น",
        "sign": false
      },
      {
        "tok": "{{sig_htSign}}",
        "label": "Head of Training signature",
        "labelTh": "ลายเซ็นหัวหน้าครูฝึก",
        "sign": true
      }
    ],
    "manual": [
      {
        "tok": "{{evComment}}",
        "label": "Comments",
        "labelTh": "ความเห็นเพิ่มเติม",
        "sign": false
      },
      {
        "tok": "{{evDate}}",
        "label": "Date",
        "labelTh": "วันที่",
        "sign": false
      },
      {
        "tok": "{{sig_evSign}}",
        "label": "Evaluator signature",
        "labelTh": "ลายเซ็นผู้ประเมิน",
        "sign": true
      }
    ]
  },
  "FRAE": {
    "abbr": "FRAE",
    "docx": "D-0507-FRAE-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "PIC Name — First Name",
        "tok": "{{picFirst}}"
      },
      {
        "label": "Last Name",
        "tok": "{{picLast}}"
      },
      {
        "label": "Date (Evaluation Risk)",
        "tok": "{{evalDate}}"
      }
    ],
    "byLine": [],
    "boxes": [
      {
        "tok": "{{k_role_PIC}}",
        "label": "PIC — pilot in command",
        "ord": "PIC — pilot in command"
      },
      {
        "tok": "{{k_role_Student}}",
        "label": "Student — student pilot",
        "ord": "Student — student pilot"
      },
      {
        "tok": "{{k_aircraftReg_HS-VVD}}",
        "label": "HS-VVD",
        "ord": "HS-VVD"
      },
      {
        "tok": "{{k_aircraftReg_HS-VVB}}",
        "label": "HS-VVB",
        "ord": "HS-VVB"
      },
      {
        "tok": "{{k_aircraftReg_HS-CCM}}",
        "label": "HS-CCM",
        "ord": "HS-CCM"
      },
      {
        "tok": "{{k_aircraftReg_HS-VST}}",
        "label": "HS-VST",
        "ord": "HS-VST"
      },
      {
        "tok": "{{k_aircraftReg_HS-POP}}",
        "label": "HS-POP",
        "ord": "HS-POP"
      },
      {
        "tok": "{{k_aircraftReg_HS-BTM}}",
        "label": "HS-BTM",
        "ord": "HS-BTM"
      },
      {
        "tok": "{{k_flightType_VFR}}",
        "label": "VFR",
        "ord": "VFR"
      },
      {
        "tok": "{{k_flightType_IFR}}",
        "label": "IFR",
        "ord": "IFR"
      },
      {
        "tok": "{{k_s1Sigmet}}",
        "label": "Convective sigmet (red) penetration",
        "item": "Convective sigmet (red) penetration"
      },
      {
        "tok": "{{k_s1Thunder}}",
        "label": "Thunderstorm penetration",
        "item": "Thunderstorm penetration"
      },
      {
        "tok": "{{k_s1Freezing}}",
        "label": "Possible freezing rain / fog",
        "item": "Possible freezing rain / fog"
      },
      {
        "tok": "{{k_s1Autopilot}}",
        "label": "Autopilot INOPS",
        "item": "Autopilot INOPS"
      },
      {
        "tok": "{{k_s1AfterMx}}",
        "label": "First flight after maintenance",
        "item": "First flight after maintenance"
      },
      {
        "tok": "{{k_s1Icing_none}}",
        "label": "None",
        "ord": "None"
      },
      {
        "tok": "{{k_s1Icing_light}}",
        "label": "Light",
        "ord": "Light"
      },
      {
        "tok": "{{k_s1Icing_moderate}}",
        "label": "Moderate",
        "ord": "Moderate"
      },
      {
        "tok": "{{k_s1Icing_severe}}",
        "label": "Severe SLD",
        "ord": "Severe SLD"
      },
      {
        "tok": "{{k_s1PrevFlight_1st}}",
        "label": "1st",
        "ord": "1st"
      },
      {
        "tok": "{{k_s1PrevFlight_2nd}}",
        "label": "2nd",
        "ord": "2nd"
      },
      {
        "tok": "{{k_s1PrevFlight_3rd}}",
        "label": "3rd",
        "ord": "3rd"
      },
      {
        "tok": "{{k_s1PrevFlight_gt3}}",
        "label": "More than 3rd",
        "ord": "More than 3rd"
      },
      {
        "tok": "{{k_s2NotCurrent}}",
        "label": "Not 90-day current",
        "item": "Not 90-day current"
      },
      {
        "tok": "{{k_s2Fatigue}}",
        "label": "Fatigue or inadequate rest",
        "item": "Fatigue or inadequate rest"
      },
      {
        "tok": "{{k_s2AfterWork}}",
        "label": "Going to fly immediately after workday",
        "item": "Going to fly immediately after workday"
      },
      {
        "tok": "{{k_s2Illness}}",
        "label": "Illness, cold, flu",
        "item": "Illness, cold, flu"
      },
      {
        "tok": "{{k_s2Personal}}",
        "label": "Personal relationship issue",
        "item": "Personal relationship issue"
      },
      {
        "tok": "{{k_s2Business}}",
        "label": "Business issue",
        "item": "Business issue"
      },
      {
        "tok": "{{k_s2Hunger}}",
        "label": "Starving or eating less food",
        "item": "Starving or eating less food"
      },
      {
        "tok": "{{k_s3Wind}}",
        "label": "Wind / gust > 20 kt",
        "item": "Wind / gust > 20 kt"
      },
      {
        "tok": "{{k_s3Crosswind}}",
        "label": "Crosswind > 12 kt / runway width < 50 ft",
        "item": "Crosswind > 12 kt / runway width < 50 ft"
      },
      {
        "tok": "{{k_s3Night}}",
        "label": "Night operation",
        "item": "Night operation"
      },
      {
        "tok": "{{k_s3Precip}}",
        "label": "Precipitation",
        "item": "Precipitation"
      },
      {
        "tok": "{{k_s3MaxWeight}}",
        "label": "Near maximum take-off weight",
        "item": "Near maximum take-off weight"
      },
      {
        "tok": "{{k_s3Terrain}}",
        "label": "Steep terrain nearby",
        "item": "Steep terrain nearby"
      },
      {
        "tok": "{{k_s3Runway_dry}}",
        "label": "Dry",
        "ord": "Dry"
      },
      {
        "tok": "{{k_s3Runway_wet}}",
        "label": "Wet",
        "ord": "Wet"
      },
      {
        "tok": "{{k_s3Runway_standing}}",
        "label": "Standing water",
        "ord": "Standing water"
      },
      {
        "tok": "{{k_s3Runway_soft}}",
        "label": "Soft field",
        "ord": "Soft field"
      },
      {
        "tok": "{{k_s3Runway_short}}",
        "label": "Runway < 2,000 ft",
        "ord": "Runway < 2,000 ft"
      },
      {
        "tok": "{{k_s3Wx}}",
        "label": "DEP: ceilings < 500 ft and/or visibility < 1 SM",
        "item": "DEP: ceilings < 500 ft and/or visibility < 1 SM"
      },
      {
        "tok": "{{k_s4Water}}",
        "label": "Water crossing beyond glide distance",
        "item": "Water crossing beyond glide distance"
      },
      {
        "tok": "{{k_s4Mountain}}",
        "label": "Mountain range crossing beyond glide distance",
        "item": "Mountain range crossing beyond glide distance"
      },
      {
        "tok": "{{k_s4NightIMC}}",
        "label": "Night or ground-level IMC",
        "item": "Night or ground-level IMC"
      },
      {
        "tok": "{{k_s4LowPressure}}",
        "label": "Passing within 75 NM of a low-pressure system",
        "item": "Passing within 75 NM of a low-pressure system"
      },
      {
        "tok": "{{k_s5Wind}}",
        "label": "Wind / gust > 20 kt",
        "item": "Wind / gust > 20 kt"
      },
      {
        "tok": "{{k_s5Crosswind}}",
        "label": "Crosswind > 12 kt / runway width < 50 ft",
        "item": "Crosswind > 12 kt / runway width < 50 ft"
      },
      {
        "tok": "{{k_s5Night}}",
        "label": "Night operation",
        "item": "Night operation"
      },
      {
        "tok": "{{k_s5Precip}}",
        "label": "Precipitation",
        "item": "Precipitation"
      },
      {
        "tok": "{{k_s5Terrain}}",
        "label": "Steep terrain nearby",
        "item": "Steep terrain nearby"
      },
      {
        "tok": "{{k_s5Windshear}}",
        "label": "Low level windshear",
        "item": "Low level windshear"
      },
      {
        "tok": "{{k_s5Temp}}",
        "label": "Temperature < 0 °C",
        "item": "Temperature < 0 °C"
      },
      {
        "tok": "{{k_s5Spread}}",
        "label": "Temperature / dewpoint spread < 3 °C",
        "item": "Temperature / dewpoint spread < 3 °C"
      },
      {
        "tok": "{{k_s5Unfamiliar}}",
        "label": "Unfamiliar airport",
        "item": "Unfamiliar airport"
      },
      {
        "tok": "{{k_s5NoTower}}",
        "label": "No operating tower",
        "item": "No operating tower"
      },
      {
        "tok": "{{k_s5NoRadar}}",
        "label": "No radar coverage for approach",
        "item": "No radar coverage for approach"
      },
      {
        "tok": "{{k_s5Fuel}}",
        "label": "Less than 1 hr 30 min fuel at destination",
        "item": "Less than 1 hr 30 min fuel at destination"
      },
      {
        "tok": "{{k_s5Runway_dry}}",
        "label": "Dry",
        "ord": "Dry"
      },
      {
        "tok": "{{k_s5Runway_wet}}",
        "label": "Wet",
        "ord": "Wet"
      },
      {
        "tok": "{{k_s5Runway_standing}}",
        "label": "Standing water",
        "ord": "Standing water"
      },
      {
        "tok": "{{k_s5Runway_soft}}",
        "label": "Soft field",
        "ord": "Soft field"
      },
      {
        "tok": "{{k_s5Runway_short}}",
        "label": "Runway < 2,000 ft",
        "ord": "Runway < 2,000 ft"
      },
      {
        "tok": "{{k_s5Wx}}",
        "label": "ARR: ceilings < 500 ft and/or visibility < 1 SM",
        "item": "ARR: ceilings < 500 ft and/or visibility < 1 SM"
      },
      {
        "tok": "{{k_decision_GO}}",
        "label": "GO",
        "ord": "GO"
      },
      {
        "tok": "{{k_decision_NO-GO}}",
        "label": "NO-GO",
        "ord": "NO-GO"
      }
    ],
    "tables": [],
    "boxesInDocx": 64,
    "approval": [
      {
        "tok": "{{fiName}}",
        "label": "Authorising FI / HT name",
        "labelTh": "ชื่อครูการบินผู้อนุญาต",
        "sign": false
      },
      {
        "tok": "{{fiDate}}",
        "label": "Date of authorisation",
        "labelTh": "วันที่อนุญาต",
        "sign": false
      },
      {
        "tok": "{{fiComment}}",
        "label": "Instructor comment",
        "labelTh": "ความเห็นของครูการบิน",
        "sign": false
      },
      {
        "tok": "{{sig_fiSign}}",
        "label": "Authorising FI / HT signature",
        "labelTh": "ลายเซ็น Authorising FI / HT",
        "sign": true
      }
    ],
    "manual": [
      {
        "tok": "{{flightNo}}",
        "label": "Flight No.",
        "labelTh": "เลขที่เที่ยวบิน",
        "sign": false
      },
      {
        "tok": "{{mitigation}}",
        "label": "Mitigation",
        "labelTh": "มาตรการลดความเสี่ยง",
        "sign": false
      },
      {
        "tok": "{{sig_picSign}}",
        "label": "PIC / Student signature",
        "labelTh": "ลายเซ็น PIC / นักเรียน",
        "sign": true
      }
    ]
  },
  "FTR": {
    "abbr": "FTR",
    "docx": "D-0507-FTR-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "Aircraft Type:",
        "tok": "{{acType}}"
      },
      {
        "label": "Registration:",
        "tok": "{{acReg}}"
      },
      {
        "label": "Date of Test:",
        "tok": "{{testDate}}"
      },
      {
        "label": "Work Order No.:",
        "tok": "{{workOrder}}"
      },
      {
        "label": "Maintenance Performed:",
        "tok": "{{mxPerformed}}"
      },
      {
        "label": "Test Pilot:",
        "tok": "{{testPilot}}"
      },
      {
        "label": "Departure Aerodrome:",
        "tok": "{{depAd}}"
      },
      {
        "label": "Departure Time:",
        "tok": "{{depTime}}"
      },
      {
        "label": "Arrival Time:",
        "tok": "{{arrTime}}"
      },
      {
        "label": "Total Flight Time:",
        "tok": "{{totalTime}}"
      },
      {
        "label": "Test Altitude:",
        "tok": "{{testAlt}}"
      },
      {
        "label": "Licence No.:\n___________________________",
        "tok": "{{tpLicence}}"
      }
    ],
    "byLine": [],
    "boxes": [
      {
        "tok": "{{k_reason_rts}}",
        "label": "Return to service",
        "ord": "Return to service"
      },
      {
        "tok": "{{k_reason_majrepair}}",
        "label": "Post-major repair",
        "ord": "Post-major repair"
      },
      {
        "tok": "{{k_reason_component}}",
        "label": "Post-component change",
        "ord": "Post-component change"
      },
      {
        "tok": "{{k_reason_periodic}}",
        "label": "Periodic check",
        "ord": "Periodic check"
      },
      {
        "tok": "{{k_reason_other}}",
        "label": "Other",
        "ord": "Other"
      },
      {
        "tok": "{{k_checks_E1_S}}",
        "label": "Engine start · Sat",
        "ord": "Sat",
        "item": "Engine start"
      },
      {
        "tok": "{{k_checks_E1_U}}",
        "label": "Engine start · Unsat",
        "ord": "Unsat",
        "item": "Engine start"
      },
      {
        "tok": "{{k_checks_E2_S}}",
        "label": "Run-up · Sat",
        "ord": "Sat",
        "item": "Run-up"
      },
      {
        "tok": "{{k_checks_E2_U}}",
        "label": "Run-up · Unsat",
        "ord": "Unsat",
        "item": "Run-up"
      },
      {
        "tok": "{{k_checks_T1_S}}",
        "label": "Take-off performance · Sat",
        "ord": "Sat",
        "item": "Take-off performance"
      },
      {
        "tok": "{{k_checks_T1_U}}",
        "label": "Take-off performance · Unsat",
        "ord": "Unsat",
        "item": "Take-off performance"
      },
      {
        "tok": "{{k_checks_T2_S}}",
        "label": "Climb performance · Sat",
        "ord": "Sat",
        "item": "Climb performance"
      },
      {
        "tok": "{{k_checks_T2_U}}",
        "label": "Climb performance · Unsat",
        "ord": "Unsat",
        "item": "Climb performance"
      },
      {
        "tok": "{{k_checks_C1_S}}",
        "label": "Engine power (cruise) · Sat",
        "ord": "Sat",
        "item": "Engine power (cruise)"
      },
      {
        "tok": "{{k_checks_C1_U}}",
        "label": "Engine power (cruise) · Unsat",
        "ord": "Unsat",
        "item": "Engine power (cruise)"
      },
      {
        "tok": "{{k_checks_C2_S}}",
        "label": "Fuel system · Sat",
        "ord": "Sat",
        "item": "Fuel system"
      },
      {
        "tok": "{{k_checks_C2_U}}",
        "label": "Fuel system · Unsat",
        "ord": "Unsat",
        "item": "Fuel system"
      },
      {
        "tok": "{{k_checks_H1_S}}",
        "label": "Stall (if required) · Sat",
        "ord": "Sat",
        "item": "Stall (if required)"
      },
      {
        "tok": "{{k_checks_H1_U}}",
        "label": "Stall (if required) · Unsat",
        "ord": "Unsat",
        "item": "Stall (if required)"
      },
      {
        "tok": "{{k_checks_H2_S}}",
        "label": "Control response · Sat",
        "ord": "Sat",
        "item": "Control response"
      },
      {
        "tok": "{{k_checks_H2_U}}",
        "label": "Control response · Unsat",
        "ord": "Unsat",
        "item": "Control response"
      },
      {
        "tok": "{{k_checks_A1_S}}",
        "label": "Approach · Sat",
        "ord": "Sat",
        "item": "Approach"
      },
      {
        "tok": "{{k_checks_A1_U}}",
        "label": "Approach · Unsat",
        "ord": "Unsat",
        "item": "Approach"
      },
      {
        "tok": "{{k_checks_A2_S}}",
        "label": "Landing · Sat",
        "ord": "Sat",
        "item": "Landing"
      },
      {
        "tok": "{{k_checks_A2_U}}",
        "label": "Landing · Unsat",
        "ord": "Unsat",
        "item": "Landing"
      },
      {
        "tok": "{{k_checks_P1_S}}",
        "label": "Engine shutdown · Sat",
        "ord": "Sat",
        "item": "Engine shutdown"
      },
      {
        "tok": "{{k_checks_P1_U}}",
        "label": "Engine shutdown · Unsat",
        "ord": "Unsat",
        "item": "Engine shutdown"
      },
      {
        "tok": "{{k_checks_P2_S}}",
        "label": "Inspection after flight · Sat",
        "ord": "Sat",
        "item": "Inspection after flight"
      },
      {
        "tok": "{{k_checks_P2_U}}",
        "label": "Inspection after flight · Unsat",
        "ord": "Unsat",
        "item": "Inspection after flight"
      },
      {
        "tok": "{{k_verdict_serviceable}}",
        "label": "Serviceable — approved for return to service",
        "ord": "Serviceable — approved for return to service"
      },
      {
        "tok": "{{k_verdict_unserviceable}}",
        "label": "Unserviceable — defects require rectification first",
        "ord": "Unserviceable — defects require rectification first"
      }
    ],
    "tables": [],
    "boxesInDocx": 31,
    "approval": [
      {
        "tok": "{{meName}}",
        "label": "Maintenance name",
        "labelTh": "ชื่อผู้รับผิดชอบฝ่ายซ่อมบำรุง",
        "sign": false
      },
      {
        "tok": "{{meDate}}",
        "label": "Date",
        "labelTh": "วันที่",
        "sign": false
      },
      {
        "tok": "{{meComment}}",
        "label": "Comment / further action",
        "labelTh": "ความเห็น / การดำเนินการต่อ",
        "sign": false
      },
      {
        "tok": "{{sig_meSign}}",
        "label": "Maintenance signature",
        "labelTh": "ลายเซ็นฝ่ายซ่อมบำรุง",
        "sign": true
      }
    ],
    "manual": [
      {
        "tok": "{{reasonOther}}",
        "label": "Other — specify",
        "labelTh": "ระบุเหตุอื่น",
        "sign": false
      },
      {
        "tok": "{{defects}}",
        "label": "Defects found",
        "labelTh": "ข้อบกพร่องที่พบ",
        "sign": false
      },
      {
        "tok": "{{tpDate}}",
        "label": "Date",
        "labelTh": "วันที่",
        "sign": false
      },
      {
        "tok": "{{sig_tpSign}}",
        "label": "Test pilot signature",
        "labelTh": "ลายเซ็นนักบินทดสอบ",
        "sign": true
      }
    ]
  },
  "HIF": {
    "abbr": "HIF",
    "docx": "D-0507-HIF-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "Hazard Title:",
        "tok": "{{title}}"
      },
      {
        "label": "Date Identified:",
        "tok": "{{foundDate}}"
      },
      {
        "label": "Ref. No.:",
        "tok": "{{refNo}}"
      },
      {
        "label": "Identified by:",
        "tok": "{{byName}}"
      },
      {
        "label": "Department:",
        "tok": "{{dept}}"
      },
      {
        "label": "Location:",
        "tok": "{{location}}"
      },
      {
        "label": "Describe the hazard, unsafe condition, or potential source of harm:",
        "tok": "{{descr}}"
      },
      {
        "label": "Prepared by:\n___________________________",
        "tok": "{{sig_prepSign}}"
      },
      {
        "label": "Likelihood (1–5):",
        "tok": "{{lik}}"
      },
      {
        "label": "Severity (1–5):",
        "tok": "{{sev}}"
      },
      {
        "label": "Risk Score (L×S):",
        "tok": "{{riskScore}}"
      },
      {
        "label": "Risk Level:",
        "tok": "{{riskLevel}}"
      }
    ],
    "byLine": [],
    "boxes": [
      {
        "tok": "{{k_riskLevel_H}}",
        "label": ""
      },
      {
        "tok": "{{k_riskLevel_A}}",
        "label": ""
      },
      {
        "tok": "{{k_riskLevel_L}}",
        "label": ""
      },
      {
        "tok": "{{k_residualOk_yes}}",
        "label": "Yes",
        "ord": "Yes"
      },
      {
        "tok": "{{k_residualOk_no}}",
        "label": "No — requires further action",
        "ord": "No — requires further action"
      }
    ],
    "tables": [],
    "boxesInDocx": 5,
    "approval": [
      {
        "tok": "{{smName}}",
        "label": "Safety Manager name",
        "labelTh": "ชื่อผู้จัดการนิรภัย",
        "sign": false
      },
      {
        "tok": "{{smDate}}",
        "label": "Date reviewed",
        "labelTh": "วันที่พิจารณา",
        "sign": false
      },
      {
        "tok": "{{smComment}}",
        "label": "Comment",
        "labelTh": "ความเห็น",
        "sign": false
      },
      {
        "tok": "{{sig_smSign}}",
        "label": "Safety Manager signature",
        "labelTh": "ลายเซ็นผู้จัดการนิรภัย",
        "sign": true
      }
    ],
    "manual": [
      {
        "tok": "{{mitigation}}",
        "label": "Proposed mitigation",
        "labelTh": "มาตรการลดความเสี่ยงที่เสนอ",
        "sign": false
      }
    ]
  },
  "MOC": {
    "abbr": "MOC",
    "docx": "D-0507-MOC-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "MoC Reference Number",
        "tok": "{{mocRef}}"
      },
      {
        "label": "Date of Submission",
        "tok": "{{subDate}}"
      },
      {
        "label": "Submitted by (Name / Position)",
        "tok": "{{subBy}}"
      },
      {
        "label": "Proposed Effective Date",
        "tok": "{{propEff}}"
      },
      {
        "label": "Current State  (Before Change)",
        "tok": "{{beforeState}}"
      },
      {
        "label": "Proposed Change  (After Change)",
        "tok": "{{afterState}}"
      },
      {
        "label": "Reason / Justification for Change",
        "tok": "{{justification}}"
      },
      {
        "label": "Scope of Change",
        "tok": "{{scope}}"
      },
      {
        "label": "Training Description",
        "tok": "{{trainDesc}}"
      },
      {
        "label": "Target Personnel",
        "tok": "{{trainWho}}"
      },
      {
        "label": "Required Completion Date",
        "tok": "{{trainBy}}"
      }
    ],
    "byLine": [
      {
        "label": "If Yes — Date Notified",
        "und": 20,
        "tok": "{{caatDate}}"
      }
    ],
    "boxes": [
      {
        "tok": "{{k_category_personnel}}",
        "label": "Personnel",
        "ord": "Personnel"
      },
      {
        "tok": "{{k_category_equipment}}",
        "label": "Equipment / fleet",
        "ord": "Equipment / fleet"
      },
      {
        "tok": "{{k_category_procedure}}",
        "label": "Procedure / SOP",
        "ord": "Procedure / SOP"
      },
      {
        "tok": "{{k_category_regulatory}}",
        "label": "Regulatory",
        "ord": "Regulatory"
      },
      {
        "tok": "{{k_category_other}}",
        "label": "Other",
        "ord": "Other"
      },
      {
        "tok": "{{k_priority_routine}}",
        "label": "Routine",
        "ord": "Routine"
      },
      {
        "tok": "{{k_priority_urgent}}",
        "label": "Urgent",
        "ord": "Urgent"
      },
      {
        "tok": "{{k_priority_emergency}}",
        "label": "Emergency",
        "ord": "Emergency"
      },
      {
        "tok": "{{k_overallRisk_low}}",
        "label": "Low",
        "ord": "Low"
      },
      {
        "tok": "{{k_overallRisk_medium}}",
        "label": "Medium",
        "ord": "Medium"
      },
      {
        "tok": "{{k_overallRisk_high}}",
        "label": "High",
        "ord": "High"
      },
      {
        "tok": "{{k_overallRisk_rejected}}",
        "label": "Not acceptable — change rejected",
        "ord": "Not acceptable — change rejected"
      },
      {
        "tok": "{{k_caatNotify_yes}}",
        "label": "Yes",
        "ord": "Yes"
      },
      {
        "tok": "{{k_caatNotify_no}}",
        "label": "No",
        "ord": "No"
      },
      {
        "tok": "{{k_trainReq_yes}}",
        "label": "Yes",
        "ord": "Yes"
      },
      {
        "tok": "{{k_trainReq_no}}",
        "label": "No",
        "ord": "No"
      }
    ],
    "tables": [
      {
        "k": "hazards",
        "rows": 3,
        "label": "Identified hazards / risks",
        "cols": [
          {
            "k": "hazard",
            "head": "Hazard / risk"
          },
          {
            "k": "likelihood",
            "head": "Likelihood"
          },
          {
            "k": "severity",
            "head": "Severity"
          },
          {
            "k": "level",
            "head": "Risk level"
          },
          {
            "k": "mitigation",
            "head": "Mitigation measure"
          }
        ]
      },
      {
        "k": "regs",
        "rows": 3,
        "label": "Applicable regulations / standards",
        "cols": [
          {
            "k": "reg",
            "head": "Regulation / standard"
          },
          {
            "k": "ref",
            "head": "Reference"
          },
          {
            "k": "action",
            "head": "Compliance action required"
          }
        ]
      },
      {
        "k": "docsAffected",
        "rows": 4,
        "label": "Document list",
        "cols": [
          {
            "k": "code",
            "head": "Document code"
          },
          {
            "k": "title",
            "head": "Document title"
          },
          {
            "k": "action",
            "head": "Action required"
          }
        ]
      },
      {
        "k": "plan",
        "rows": 5,
        "label": "Action steps",
        "cols": [
          {
            "k": "action",
            "head": "Action / step"
          },
          {
            "k": "owner",
            "head": "Responsible person"
          },
          {
            "k": "target",
            "head": "Target date"
          },
          {
            "k": "status",
            "head": "Status"
          }
        ]
      }
    ],
    "boxesInDocx": 16,
    "approval": [
      {
        "tok": "{{smName}}",
        "label": "Safety Manager name",
        "labelTh": "ชื่อผู้จัดการนิรภัย",
        "sign": false
      },
      {
        "tok": "{{smDate}}",
        "label": "Date reviewed",
        "labelTh": "วันที่ทบทวน",
        "sign": false
      },
      {
        "tok": "{{smComment}}",
        "label": "Safety comment",
        "labelTh": "ความเห็นด้านนิรภัย",
        "sign": false
      },
      {
        "tok": "{{sig_smSign}}",
        "label": "Safety Manager signature",
        "labelTh": "ลายเซ็นผู้จัดการนิรภัย",
        "sign": true
      }
    ],
    "manual": [
      {
        "tok": "{{sig_subSign}}",
        "label": "Submitter signature",
        "labelTh": "ลายเซ็นผู้เสนอ",
        "sign": true
      },
      {
        "tok": "{{acmName}}",
        "label": "Accountable Manager name",
        "labelTh": "ชื่อผู้จัดการฝ่ายรับผิดชอบ",
        "sign": false
      },
      {
        "tok": "{{acmDate}}",
        "label": "Date approved",
        "labelTh": "วันที่อนุมัติ",
        "sign": false
      },
      {
        "tok": "{{acmComment}}",
        "label": "Comment",
        "labelTh": "ความเห็น",
        "sign": false
      },
      {
        "tok": "{{sig_acmSign}}",
        "label": "Accountable Manager signature",
        "labelTh": "ลายเซ็นผู้จัดการฝ่ายรับผิดชอบ",
        "sign": true
      }
    ]
  },
  "PCR-FI": {
    "abbr": "PCR-FI",
    "docx": "D-0507-PCR-FI-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "Instructor Name",
        "tok": "{{insName}}"
      },
      {
        "label": "CAAT Certificate No.",
        "tok": "{{certNo}}"
      },
      {
        "label": "Date of Check",
        "tok": "{{checkDate}}"
      },
      {
        "label": "Duration (hrs)",
        "tok": "{{duration}}"
      },
      {
        "label": "Conductor (HT / CFI/CTKI)",
        "tok": "{{conductor}}"
      },
      {
        "label": "Aircraft Type / Registration",
        "tok": "{{acReg}}"
      },
      {
        "label": "Venue / Airfield / Training Area",
        "tok": "{{venue}}"
      },
      {
        "label": "Conductor Remarks / Areas for Improvement:",
        "tok": "{{remarks}}"
      },
      {
        "label": "Follow-up Action Required:",
        "tok": "{{followup}}"
      },
      {
        "label": "Re-check Due Date (if applicable):",
        "tok": "{{recheckDue}}"
      }
    ],
    "byLine": [
      {
        "label": "No       Date notified to HT",
        "und": 15,
        "tok": "{{htNotified}}"
      },
      {
        "label": "Date",
        "und": 28,
        "tok": "{{conDate}}"
      },
      {
        "label": "Date",
        "und": 28,
        "tok": "{{fiAckDate}}"
      }
    ],
    "boxes": [
      {
        "tok": "{{k_tier_t1annual}}",
        "label": "Tier 1 — Annual IPC",
        "ord": "Tier 1 — Annual IPC"
      },
      {
        "tok": "{{k_tier_t1initial}}",
        "label": "Tier 1 — Initial IPC",
        "ord": "Tier 1 — Initial IPC"
      },
      {
        "tok": "{{k_tier_t1postcor}}",
        "label": "Tier 1 — Post-corrective",
        "ord": "Tier 1 — Post-corrective"
      },
      {
        "tok": "{{k_tier_t1postabs}}",
        "label": "Tier 1 — Post-absence",
        "ord": "Tier 1 — Post-absence"
      },
      {
        "tok": "{{k_tier_t1directed}}",
        "label": "Tier 1 — Directed",
        "ord": "Tier 1 — Directed"
      },
      {
        "tok": "{{k_tier_t2lpc}}",
        "label": "Tier 2 — LPC+",
        "ord": "Tier 2 — LPC+"
      },
      {
        "tok": "{{k_tier_t3aoc}}",
        "label": "Tier 3 — AoC",
        "ord": "Tier 3 — AoC"
      },
      {
        "tok": "{{k_combined_no}}",
        "label": "No",
        "ord": "No"
      },
      {
        "tok": "{{k_combined_yes}}",
        "label": "Yes",
        "ord": "Yes"
      },
      {
        "tok": "{{k_g1_1}}",
        "label": "Pre-flight briefing = 1"
      },
      {
        "tok": "{{k_g1_2}}",
        "label": "Pre-flight briefing = 2"
      },
      {
        "tok": "{{k_g1_3}}",
        "label": "Pre-flight briefing = 3"
      },
      {
        "tok": "{{k_g1_4}}",
        "label": "Pre-flight briefing = 4"
      },
      {
        "tok": "{{k_g1_5}}",
        "label": "Pre-flight briefing = 5"
      },
      {
        "tok": "{{k_g2_1}}",
        "label": "Demonstration and technique = 1"
      },
      {
        "tok": "{{k_g2_2}}",
        "label": "Demonstration and technique = 2"
      },
      {
        "tok": "{{k_g2_3}}",
        "label": "Demonstration and technique = 3"
      },
      {
        "tok": "{{k_g2_4}}",
        "label": "Demonstration and technique = 4"
      },
      {
        "tok": "{{k_g2_5}}",
        "label": "Demonstration and technique = 5"
      },
      {
        "tok": "{{k_g3_1}}",
        "label": "Instructional patter = 1"
      },
      {
        "tok": "{{k_g3_2}}",
        "label": "Instructional patter = 2"
      },
      {
        "tok": "{{k_g3_3}}",
        "label": "Instructional patter = 3"
      },
      {
        "tok": "{{k_g3_4}}",
        "label": "Instructional patter = 4"
      },
      {
        "tok": "{{k_g3_5}}",
        "label": "Instructional patter = 5"
      },
      {
        "tok": "{{k_g4_1}}",
        "label": "Student management = 1"
      },
      {
        "tok": "{{k_g4_2}}",
        "label": "Student management = 2"
      },
      {
        "tok": "{{k_g4_3}}",
        "label": "Student management = 3"
      },
      {
        "tok": "{{k_g4_4}}",
        "label": "Student management = 4"
      },
      {
        "tok": "{{k_g4_5}}",
        "label": "Student management = 5"
      },
      {
        "tok": "{{k_g5_1}}",
        "label": "Safety and airmanship = 1"
      },
      {
        "tok": "{{k_g5_2}}",
        "label": "Safety and airmanship = 2"
      },
      {
        "tok": "{{k_g5_3}}",
        "label": "Safety and airmanship = 3"
      },
      {
        "tok": "{{k_g5_4}}",
        "label": "Safety and airmanship = 4"
      },
      {
        "tok": "{{k_g5_5}}",
        "label": "Safety and airmanship = 5"
      },
      {
        "tok": "{{k_g6_1}}",
        "label": "Post-flight debrief = 1"
      },
      {
        "tok": "{{k_g6_2}}",
        "label": "Post-flight debrief = 2"
      },
      {
        "tok": "{{k_g6_3}}",
        "label": "Post-flight debrief = 3"
      },
      {
        "tok": "{{k_g6_4}}",
        "label": "Post-flight debrief = 4"
      },
      {
        "tok": "{{k_g6_5}}",
        "label": "Post-flight debrief = 5"
      },
      {
        "tok": "{{k_g7_1}}",
        "label": "Documentation = 1"
      },
      {
        "tok": "{{k_g7_2}}",
        "label": "Documentation = 2"
      },
      {
        "tok": "{{k_g7_3}}",
        "label": "Documentation = 3"
      },
      {
        "tok": "{{k_g7_4}}",
        "label": "Documentation = 4"
      },
      {
        "tok": "{{k_g7_5}}",
        "label": "Documentation = 5"
      },
      {
        "tok": "{{k_result_pass}}",
        "label": "Pass",
        "ord": "Pass"
      },
      {
        "tok": "{{k_result_marginal}}",
        "label": "Marginal pass",
        "ord": "Marginal pass"
      },
      {
        "tok": "{{k_result_fail}}",
        "label": "Fail",
        "ord": "Fail"
      },
      {
        "tok": "{{k_result_unsat}}",
        "label": "Unsatisfactory",
        "ord": "Unsatisfactory"
      },
      {
        "tok": "{{k_correctiveInit_yes}}",
        "label": "Yes",
        "ord": "Yes"
      },
      {
        "tok": "{{k_correctiveInit_no}}",
        "label": "No",
        "ord": "No"
      }
    ],
    "tables": [],
    "boxesInDocx": 50,
    "approval": [
      {
        "tok": "{{fiAckName}}",
        "label": "Flight Instructor name",
        "labelTh": "ชื่อครูการบิน",
        "sign": false
      },
      {
        "tok": "{{sig_fiSign}}",
        "label": "Flight Instructor signature",
        "labelTh": "ลายเซ็นครูการบิน",
        "sign": true
      }
    ],
    "manual": [
      {
        "tok": "{{conName}}",
        "label": "Conductor name",
        "labelTh": "ชื่อผู้ตรวจ",
        "sign": false
      },
      {
        "tok": "{{sig_conSign}}",
        "label": "Conductor signature",
        "labelTh": "ลายเซ็นผู้ตรวจ",
        "sign": true
      }
    ]
  },
  "PCR-TKI": {
    "abbr": "PCR-TKI",
    "docx": "D-0507-PCR-TKI-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "Instructor Name",
        "tok": "{{insName}}"
      },
      {
        "label": "CAAT Certificate No.",
        "tok": "{{certNo}}"
      },
      {
        "label": "Date of Check",
        "tok": "{{checkDate}}"
      },
      {
        "label": "Duration (hrs)",
        "tok": "{{duration}}"
      },
      {
        "label": "Conductor (HT / CFI/CTKI)",
        "tok": "{{conductor}}"
      },
      {
        "label": "Subject / Module Taught",
        "tok": "{{subject}}"
      },
      {
        "label": "Venue / Classroom",
        "tok": "{{venue}}"
      },
      {
        "label": "No. of Students in Class",
        "tok": "{{students}}"
      },
      {
        "label": "Conductor Remarks / Areas for Improvement:",
        "tok": "{{remarks}}"
      },
      {
        "label": "Follow-up Action Required:",
        "tok": "{{followup}}"
      },
      {
        "label": "Re-check Due Date (if applicable):",
        "tok": "{{recheckDue}}"
      }
    ],
    "byLine": [
      {
        "label": "No       Date notified to HT",
        "und": 15,
        "tok": "{{htNotified}}"
      },
      {
        "label": "Date",
        "und": 28,
        "tok": "{{conDate}}"
      },
      {
        "label": "Date",
        "und": 28,
        "tok": "{{tkiAckDate}}"
      }
    ],
    "boxes": [
      {
        "tok": "{{k_ipcType_annual}}",
        "label": "Annual IPC",
        "ord": "Annual IPC"
      },
      {
        "tok": "{{k_ipcType_initial}}",
        "label": "Initial IPC",
        "ord": "Initial IPC"
      },
      {
        "tok": "{{k_ipcType_postcor}}",
        "label": "Post-corrective IPC",
        "ord": "Post-corrective IPC"
      },
      {
        "tok": "{{k_ipcType_postabs}}",
        "label": "Post-absence IPC",
        "ord": "Post-absence IPC"
      },
      {
        "tok": "{{k_ipcType_directed}}",
        "label": "Directed IPC",
        "ord": "Directed IPC"
      },
      {
        "tok": "{{k_g1_1}}",
        "label": "Lesson planning = 1"
      },
      {
        "tok": "{{k_g1_2}}",
        "label": "Lesson planning = 2"
      },
      {
        "tok": "{{k_g1_3}}",
        "label": "Lesson planning = 3"
      },
      {
        "tok": "{{k_g1_4}}",
        "label": "Lesson planning = 4"
      },
      {
        "tok": "{{k_g1_5}}",
        "label": "Lesson planning = 5"
      },
      {
        "tok": "{{k_g2_1}}",
        "label": "Delivery (including safety-critical content) = 1"
      },
      {
        "tok": "{{k_g2_2}}",
        "label": "Delivery (including safety-critical content) = 2"
      },
      {
        "tok": "{{k_g2_3}}",
        "label": "Delivery (including safety-critical content) = 3"
      },
      {
        "tok": "{{k_g2_4}}",
        "label": "Delivery (including safety-critical content) = 4"
      },
      {
        "tok": "{{k_g2_5}}",
        "label": "Delivery (including safety-critical content) = 5"
      },
      {
        "tok": "{{k_g3_1}}",
        "label": "Student engagement = 1"
      },
      {
        "tok": "{{k_g3_2}}",
        "label": "Student engagement = 2"
      },
      {
        "tok": "{{k_g3_3}}",
        "label": "Student engagement = 3"
      },
      {
        "tok": "{{k_g3_4}}",
        "label": "Student engagement = 4"
      },
      {
        "tok": "{{k_g3_5}}",
        "label": "Student engagement = 5"
      },
      {
        "tok": "{{k_g4_1}}",
        "label": "Assessment = 1"
      },
      {
        "tok": "{{k_g4_2}}",
        "label": "Assessment = 2"
      },
      {
        "tok": "{{k_g4_3}}",
        "label": "Assessment = 3"
      },
      {
        "tok": "{{k_g4_4}}",
        "label": "Assessment = 4"
      },
      {
        "tok": "{{k_g4_5}}",
        "label": "Assessment = 5"
      },
      {
        "tok": "{{k_g5_1}}",
        "label": "Classroom management = 1"
      },
      {
        "tok": "{{k_g5_2}}",
        "label": "Classroom management = 2"
      },
      {
        "tok": "{{k_g5_3}}",
        "label": "Classroom management = 3"
      },
      {
        "tok": "{{k_g5_4}}",
        "label": "Classroom management = 4"
      },
      {
        "tok": "{{k_g5_5}}",
        "label": "Classroom management = 5"
      },
      {
        "tok": "{{k_g6_1}}",
        "label": "Documentation = 1"
      },
      {
        "tok": "{{k_g6_2}}",
        "label": "Documentation = 2"
      },
      {
        "tok": "{{k_g6_3}}",
        "label": "Documentation = 3"
      },
      {
        "tok": "{{k_g6_4}}",
        "label": "Documentation = 4"
      },
      {
        "tok": "{{k_g6_5}}",
        "label": "Documentation = 5"
      },
      {
        "tok": "{{k_result_pass}}",
        "label": "Pass",
        "ord": "Pass"
      },
      {
        "tok": "{{k_result_marginal}}",
        "label": "Marginal pass",
        "ord": "Marginal pass"
      },
      {
        "tok": "{{k_result_fail}}",
        "label": "Fail",
        "ord": "Fail"
      },
      {
        "tok": "{{k_result_unsat}}",
        "label": "Unsatisfactory",
        "ord": "Unsatisfactory"
      },
      {
        "tok": "{{k_correctiveInit_yes}}",
        "label": "Yes",
        "ord": "Yes"
      },
      {
        "tok": "{{k_correctiveInit_no}}",
        "label": "No",
        "ord": "No"
      }
    ],
    "tables": [],
    "boxesInDocx": 41,
    "approval": [
      {
        "tok": "{{tkiAckName}}",
        "label": "Instructor name",
        "labelTh": "ชื่อครูภาคทฤษฎี",
        "sign": false
      },
      {
        "tok": "{{sig_tkiSign}}",
        "label": "Instructor signature",
        "labelTh": "ลายเซ็นครูภาคทฤษฎี",
        "sign": true
      }
    ],
    "manual": [
      {
        "tok": "{{conName}}",
        "label": "Conductor name",
        "labelTh": "ชื่อผู้ตรวจ",
        "sign": false
      },
      {
        "tok": "{{sig_conSign}}",
        "label": "Conductor signature",
        "labelTh": "ลายเซ็นผู้ตรวจ",
        "sign": true
      }
    ]
  },
  "PWR": {
    "abbr": "PWR",
    "docx": "D-0507-PWR-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "Full Name",
        "tok": "{{paxName}}"
      },
      {
        "label": "Date of Birth",
        "tok": "{{paxDob}}"
      },
      {
        "label": "Age",
        "tok": "{{paxAge}}"
      },
      {
        "label": "Phone Number",
        "tok": "{{paxPhone}}"
      },
      {
        "label": "Email Address",
        "tok": "{{paxEmail}}"
      },
      {
        "label": "ID / Passport No.",
        "tok": "{{paxId}}"
      },
      {
        "label": "Address",
        "tok": "{{paxAddr}}"
      },
      {
        "label": "Parent / Legal Guardian Name",
        "tok": "{{gName}}"
      },
      {
        "label": "Relationship to Minor",
        "tok": "{{gRel}}"
      },
      {
        "label": "Phone Number",
        "tok": "{{gPhone}}"
      },
      {
        "label": "ID / Passport No. (Guardian)",
        "tok": "{{gId}}"
      }
    ],
    "byLine": [
      {
        "label": "Date Signed",
        "und": 3,
        "tok": "{{signDate}}"
      }
    ],
    "boxes": [
      {
        "tok": "{{k_isMinor}}",
        "label": "Passenger is a minor (under 18). A parent or legal guardian must sign.",
        "item": "Passenger is a minor (under 18). A parent or legal guardian must sign."
      }
    ],
    "tables": [],
    "boxesInDocx": 1,
    "approval": [
      {
        "tok": "{{htName}}",
        "label": "Head of Training name",
        "labelTh": "ชื่อหัวหน้าครูฝึก",
        "sign": false
      },
      {
        "tok": "{{htDate}}",
        "label": "Date approved",
        "labelTh": "วันที่อนุมัติ",
        "sign": false
      },
      {
        "tok": "{{sig_htSign}}",
        "label": "Head of Training signature",
        "labelTh": "ลายเซ็นหัวหน้าครูฝึก",
        "sign": true
      }
    ],
    "manual": [
      {
        "tok": "{{sig_paxSign}}",
        "label": "Passenger signature (if minor: parent / legal guardian)",
        "labelTh": "ลายเซ็นผู้โดยสาร (หากเป็นผู้เยาว์ ให้ผู้ปกครองลงนาม)",
        "sign": true
      }
    ]
  },
  "RTR": {
    "abbr": "RTR",
    "docx": "D-0507-RTR-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "Instructor Name",
        "tok": "{{insName}}"
      },
      {
        "label": "FI Certificate No.",
        "tok": "{{fiCertNo}}"
      },
      {
        "label": "Instructor Rating(s)",
        "tok": "{{ratings}}"
      },
      {
        "label": "Certificate Expiry Date",
        "tok": "{{certExpiry}}"
      },
      {
        "label": "Date of Training",
        "tok": "{{trainDate}}"
      },
      {
        "label": "Duration (hours)",
        "tok": "{{duration}}"
      },
      {
        "label": "Venue / Location",
        "tok": "{{venue}}"
      },
      {
        "label": "Trainer Name",
        "tok": "{{trainerName}}"
      },
      {
        "label": "Qualification / Role",
        "tok": "{{trainerRole}}"
      },
      {
        "label": "Comments / Follow-up Action",
        "tok": "{{comments}}"
      },
      {
        "label": "Date of Next Due Refresher",
        "tok": "{{nextDue}}"
      },
      {
        "label": "Scheduled By (ISM)",
        "tok": "{{scheduledBy}}"
      }
    ],
    "byLine": [
      {
        "label": "Date",
        "und": 32,
        "tok": "{{htDate}}"
      },
      {
        "label": "Date",
        "und": 32,
        "tok": "{{insAckDate}}"
      }
    ],
    "boxes": [
      {
        "tok": "{{k_trainType_annual}}",
        "label": "Annual seminar",
        "ord": "Annual seminar"
      },
      {
        "tok": "{{k_trainType_perf}}",
        "label": "Trigger-based (performance)",
        "ord": "Trigger-based (performance)"
      },
      {
        "tok": "{{k_trainType_regulatory}}",
        "label": "Trigger-based (regulatory)",
        "ord": "Trigger-based (regulatory)"
      },
      {
        "tok": "{{k_trainType_safety}}",
        "label": "Trigger-based (safety occurrence)",
        "ord": "Trigger-based (safety occurrence)"
      },
      {
        "tok": "{{k_trainType_renewal}}",
        "label": "Rating renewal",
        "ord": "Rating renewal"
      },
      {
        "tok": "{{k_topics_regulatory}}",
        "label": "Regulatory updates (CAAT / ICAO)",
        "ord": "Regulatory updates (CAAT / ICAO)"
      },
      {
        "tok": "{{k_topics_teaching}}",
        "label": "Teaching and learning techniques",
        "ord": "Teaching and learning techniques"
      },
      {
        "tok": "{{k_topics_humanfac}}",
        "label": "Human factors and fatigue management",
        "ord": "Human factors and fatigue management"
      },
      {
        "tok": "{{k_topics_safety}}",
        "label": "Flight safety and SMS awareness",
        "ord": "Flight safety and SMS awareness"
      },
      {
        "tok": "{{k_topics_grading}}",
        "label": "Standardisation and grading standards",
        "ord": "Standardisation and grading standards"
      },
      {
        "tok": "{{k_topics_other}}",
        "label": "Other",
        "ord": "Other"
      },
      {
        "tok": "{{k_outcome_sat}}",
        "label": "Satisfactory",
        "ord": "Satisfactory"
      },
      {
        "tok": "{{k_outcome_unsat}}",
        "label": "Unsatisfactory",
        "ord": "Unsatisfactory"
      }
    ],
    "tables": [],
    "boxesInDocx": 13,
    "approval": [
      {
        "tok": "{{insAckName}}",
        "label": "Instructor name",
        "labelTh": "ชื่อครู",
        "sign": false
      },
      {
        "tok": "{{sig_insSign}}",
        "label": "Instructor signature",
        "labelTh": "ลายเซ็นครู",
        "sign": true
      }
    ],
    "manual": [
      {
        "tok": "{{topicOther}}",
        "label": "Other — specify",
        "labelTh": "ระบุหัวข้ออื่น",
        "sign": false
      },
      {
        "tok": "{{htName}}",
        "label": "Head of Training name",
        "labelTh": "ชื่อหัวหน้าครูฝึก",
        "sign": false
      },
      {
        "tok": "{{sig_htSign}}",
        "label": "Head of Training signature",
        "labelTh": "ลายเซ็นหัวหน้าครูฝึก",
        "sign": true
      }
    ]
  },
  "SDF": {
    "abbr": "SDF",
    "docx": "D-0507-SDF-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "Name",
        "tok": "{{name}}"
      },
      {
        "label": "Licence No.",
        "tok": "{{licence}}"
      },
      {
        "label": "Email",
        "tok": "{{email}}"
      },
      {
        "label": "Date of Latest Flight",
        "tok": "{{lastFlightDate}}"
      },
      {
        "label": "Latest 24 hr Flight Hours",
        "tok": "{{last24}}"
      },
      {
        "label": "Past 7 consecutive days",
        "tok": "{{h7}}"
      },
      {
        "label": "Past 28 consecutive days",
        "tok": "{{h28}}"
      },
      {
        "label": "Past 365 consecutive days",
        "tok": "{{h365}}"
      },
      {
        "label": "Planned flight hours with D-0507 today",
        "tok": "{{planned}}"
      },
      {
        "label": "Signature",
        "tok": "{{sig_decSign}}"
      },
      {
        "label": "Date Signed",
        "tok": "{{decDate}}"
      }
    ],
    "byLine": [],
    "boxes": [
      {
        "tok": "{{k_applyFor_away2w}}",
        "label": "Flight Instructor who left the company for more than 2 weeks",
        "ord": "Flight Instructor who left the company for more than 2 weeks"
      },
      {
        "tok": "{{k_applyFor_dualDuty}}",
        "label": "Flight Instructor or Student with dual duty as air personnel",
        "ord": "Flight Instructor or Student with dual duty as air personnel"
      },
      {
        "tok": "{{k_applyFor_otherFly}}",
        "label": "Flight Instructor or Student with other flying (recreational or aviation-related)",
        "ord": "Flight Instructor or Student with other flying (recreational or aviation-related)"
      },
      {
        "tok": "{{k_youAre_instructor}}",
        "label": "Instructor",
        "ord": "Instructor"
      },
      {
        "tok": "{{k_youAre_student}}",
        "label": "Current Student",
        "ord": "Current Student"
      },
      {
        "tok": "{{k_youAre_alumni}}",
        "label": "Alumni / Recurrent",
        "ord": "Alumni / Recurrent"
      },
      {
        "tok": "{{k_ftlConfirm}}",
        "label": "FTL Compliance Confirmation: I confirm the totals above include hours from ALL operators. After today's planned duty with D-0507, my flight hours will not exceed the FTL limits: 7 days ≤ 28 hr / 28 days ≤ 100 hr / 365 days ≤ 1,000 hr. I understand that inaccurate declaration is a regulatory offence under Thai civil aviation law.",
        "item": "FTL Compliance Confirmation: I confirm the totals above include hours from ALL operators. After today's planned duty with D-0507, my flight hours will not exceed the FTL limits: 7 days ≤ 28 hr / 28 days ≤ 100 hr / 365 days ≤ 1,000 hr. I understand that inaccurate declaration is a regulatory offence under Thai civil aviation law."
      }
    ],
    "tables": [],
    "boxesInDocx": 7,
    "approval": [
      {
        "tok": "{{apName}}",
        "label": "Approver name",
        "labelTh": "ชื่อผู้อนุมัติ",
        "sign": false
      },
      {
        "tok": "{{apDate}}",
        "label": "Date approved",
        "labelTh": "วันที่อนุมัติ",
        "sign": false
      },
      {
        "tok": "{{apComment}}",
        "label": "Comment",
        "labelTh": "ความเห็น",
        "sign": false
      },
      {
        "tok": "{{sig_apSign}}",
        "label": "Approver signature",
        "labelTh": "ลายเซ็นผู้อนุมัติ",
        "sign": true
      }
    ],
    "manual": [
      {
        "tok": "{{depTime}}",
        "label": "DEP of latest flight",
        "labelTh": "เวลาออกของเที่ยวบินที่บินล่าสุด (DEP of latest flight)",
        "sign": false
      },
      {
        "tok": "{{arrTime}}",
        "label": "ARR of latest flight",
        "labelTh": "เวลาถึงของเที่ยวบินที่บินล่าสุด (ARR of latest flight)",
        "sign": false
      }
    ]
  },
  "SEF": {
    "abbr": "SEF",
    "docx": "D-0507-SEF-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "Instructor Name",
        "tok": "{{insName}}"
      },
      {
        "label": "Evaluation Date",
        "tok": "{{evalDate}}"
      },
      {
        "label": "Ground Training Class",
        "tok": "{{groundClass}}"
      },
      {
        "label": "Flight Training Class",
        "tok": "{{flightClass}}"
      },
      {
        "label": "Student Name:",
        "tok": "{{stuName}}"
      },
      {
        "label": "Signature:",
        "tok": "{{sig_cmmSign}}"
      }
    ],
    "byLine": [],
    "boxes": [
      {
        "tok": "{{k_p1_pTheCourseAsA_excellent}}",
        "label": "The course as a whole was · Excellent",
        "ord": "Excellent",
        "item": "The course as a whole was"
      },
      {
        "tok": "{{k_p1_pTheCourseAsA_good}}",
        "label": "The course as a whole was · Good",
        "ord": "Good",
        "item": "The course as a whole was"
      },
      {
        "tok": "{{k_p1_pTheCourseAsA_fair}}",
        "label": "The course as a whole was · Fair",
        "ord": "Fair",
        "item": "The course as a whole was"
      },
      {
        "tok": "{{k_p1_pTheCourseAsA_poor}}",
        "label": "The course as a whole was · Poor",
        "ord": "Poor",
        "item": "The course as a whole was"
      },
      {
        "tok": "{{k_p1_pTheCourseAsA_verypoor}}",
        "label": "The course as a whole was · Very poor",
        "ord": "Very poor",
        "item": "The course as a whole was"
      },
      {
        "tok": "{{k_p1_pTheCourseAsA_na}}",
        "label": "The course as a whole was · N/A",
        "ord": "N/A",
        "item": "The course as a whole was"
      },
      {
        "tok": "{{k_p1_pTheCourseContentWas_excellent}}",
        "label": "The course content was · Excellent",
        "ord": "Excellent",
        "item": "The course content was"
      },
      {
        "tok": "{{k_p1_pTheCourseContentWas_good}}",
        "label": "The course content was · Good",
        "ord": "Good",
        "item": "The course content was"
      },
      {
        "tok": "{{k_p1_pTheCourseContentWas_fair}}",
        "label": "The course content was · Fair",
        "ord": "Fair",
        "item": "The course content was"
      },
      {
        "tok": "{{k_p1_pTheCourseContentWas_poor}}",
        "label": "The course content was · Poor",
        "ord": "Poor",
        "item": "The course content was"
      },
      {
        "tok": "{{k_p1_pTheCourseContentWas_verypoor}}",
        "label": "The course content was · Very poor",
        "ord": "Very poor",
        "item": "The course content was"
      },
      {
        "tok": "{{k_p1_pTheCourseContentWas_na}}",
        "label": "The course content was · N/A",
        "ord": "N/A",
        "item": "The course content was"
      },
      {
        "tok": "{{k_p1_pClarityOfStudyMaterial_excellent}}",
        "label": "Clarity of study material was · Excellent",
        "ord": "Excellent",
        "item": "Clarity of study material was"
      },
      {
        "tok": "{{k_p1_pClarityOfStudyMaterial_good}}",
        "label": "Clarity of study material was · Good",
        "ord": "Good",
        "item": "Clarity of study material was"
      },
      {
        "tok": "{{k_p1_pClarityOfStudyMaterial_fair}}",
        "label": "Clarity of study material was · Fair",
        "ord": "Fair",
        "item": "Clarity of study material was"
      },
      {
        "tok": "{{k_p1_pClarityOfStudyMaterial_poor}}",
        "label": "Clarity of study material was · Poor",
        "ord": "Poor",
        "item": "Clarity of study material was"
      },
      {
        "tok": "{{k_p1_pClarityOfStudyMaterial_verypoor}}",
        "label": "Clarity of study material was · Very poor",
        "ord": "Very poor",
        "item": "Clarity of study material was"
      },
      {
        "tok": "{{k_p1_pClarityOfStudyMaterial_na}}",
        "label": "Clarity of study material was · N/A",
        "ord": "N/A",
        "item": "Clarity of study material was"
      },
      {
        "tok": "{{k_p1_pExplanationsByTheContents_excellent}}",
        "label": "Explanations by the contents were · Excellent",
        "ord": "Excellent",
        "item": "Explanations by the contents were"
      },
      {
        "tok": "{{k_p1_pExplanationsByTheContents_good}}",
        "label": "Explanations by the contents were · Good",
        "ord": "Good",
        "item": "Explanations by the contents were"
      },
      {
        "tok": "{{k_p1_pExplanationsByTheContents_fair}}",
        "label": "Explanations by the contents were · Fair",
        "ord": "Fair",
        "item": "Explanations by the contents were"
      },
      {
        "tok": "{{k_p1_pExplanationsByTheContents_poor}}",
        "label": "Explanations by the contents were · Poor",
        "ord": "Poor",
        "item": "Explanations by the contents were"
      },
      {
        "tok": "{{k_p1_pExplanationsByTheContents_verypoor}}",
        "label": "Explanations by the contents were · Very poor",
        "ord": "Very poor",
        "item": "Explanations by the contents were"
      },
      {
        "tok": "{{k_p1_pExplanationsByTheContents_na}}",
        "label": "Explanations by the contents were · N/A",
        "ord": "N/A",
        "item": "Explanations by the contents were"
      },
      {
        "tok": "{{k_p1_pTheUseOfExamples_excellent}}",
        "label": "The use of examples and illustrations was · Excellent",
        "ord": "Excellent",
        "item": "The use of examples and illustrations was"
      },
      {
        "tok": "{{k_p1_pTheUseOfExamples_good}}",
        "label": "The use of examples and illustrations was · Good",
        "ord": "Good",
        "item": "The use of examples and illustrations was"
      },
      {
        "tok": "{{k_p1_pTheUseOfExamples_fair}}",
        "label": "The use of examples and illustrations was · Fair",
        "ord": "Fair",
        "item": "The use of examples and illustrations was"
      },
      {
        "tok": "{{k_p1_pTheUseOfExamples_poor}}",
        "label": "The use of examples and illustrations was · Poor",
        "ord": "Poor",
        "item": "The use of examples and illustrations was"
      },
      {
        "tok": "{{k_p1_pTheUseOfExamples_verypoor}}",
        "label": "The use of examples and illustrations was · Very poor",
        "ord": "Very poor",
        "item": "The use of examples and illustrations was"
      },
      {
        "tok": "{{k_p1_pTheUseOfExamples_na}}",
        "label": "The use of examples and illustrations was · N/A",
        "ord": "N/A",
        "item": "The use of examples and illustrations was"
      },
      {
        "tok": "{{k_p1_pAvailabilityOfExtraHelp_excellent}}",
        "label": "Availability of extra help when needed was · Excellent",
        "ord": "Excellent",
        "item": "Availability of extra help when needed was"
      },
      {
        "tok": "{{k_p1_pAvailabilityOfExtraHelp_good}}",
        "label": "Availability of extra help when needed was · Good",
        "ord": "Good",
        "item": "Availability of extra help when needed was"
      },
      {
        "tok": "{{k_p1_pAvailabilityOfExtraHelp_fair}}",
        "label": "Availability of extra help when needed was · Fair",
        "ord": "Fair",
        "item": "Availability of extra help when needed was"
      },
      {
        "tok": "{{k_p1_pAvailabilityOfExtraHelp_poor}}",
        "label": "Availability of extra help when needed was · Poor",
        "ord": "Poor",
        "item": "Availability of extra help when needed was"
      },
      {
        "tok": "{{k_p1_pAvailabilityOfExtraHelp_verypoor}}",
        "label": "Availability of extra help when needed was · Very poor",
        "ord": "Very poor",
        "item": "Availability of extra help when needed was"
      },
      {
        "tok": "{{k_p1_pAvailabilityOfExtraHelp_na}}",
        "label": "Availability of extra help when needed was · N/A",
        "ord": "N/A",
        "item": "Availability of extra help when needed was"
      },
      {
        "tok": "{{k_p1_pUseOfTimeIn_excellent}}",
        "label": "Use of time in each subject was · Excellent",
        "ord": "Excellent",
        "item": "Use of time in each subject was"
      },
      {
        "tok": "{{k_p1_pUseOfTimeIn_good}}",
        "label": "Use of time in each subject was · Good",
        "ord": "Good",
        "item": "Use of time in each subject was"
      },
      {
        "tok": "{{k_p1_pUseOfTimeIn_fair}}",
        "label": "Use of time in each subject was · Fair",
        "ord": "Fair",
        "item": "Use of time in each subject was"
      },
      {
        "tok": "{{k_p1_pUseOfTimeIn_poor}}",
        "label": "Use of time in each subject was · Poor",
        "ord": "Poor",
        "item": "Use of time in each subject was"
      },
      {
        "tok": "{{k_p1_pUseOfTimeIn_verypoor}}",
        "label": "Use of time in each subject was · Very poor",
        "ord": "Very poor",
        "item": "Use of time in each subject was"
      },
      {
        "tok": "{{k_p1_pUseOfTimeIn_na}}",
        "label": "Use of time in each subject was · N/A",
        "ord": "N/A",
        "item": "Use of time in each subject was"
      },
      {
        "tok": "{{k_p1_pAmountYouLearnedWas_excellent}}",
        "label": "Amount you learned was · Excellent",
        "ord": "Excellent",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_p1_pAmountYouLearnedWas_good}}",
        "label": "Amount you learned was · Good",
        "ord": "Good",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_p1_pAmountYouLearnedWas_fair}}",
        "label": "Amount you learned was · Fair",
        "ord": "Fair",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_p1_pAmountYouLearnedWas_poor}}",
        "label": "Amount you learned was · Poor",
        "ord": "Poor",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_p1_pAmountYouLearnedWas_verypoor}}",
        "label": "Amount you learned was · Very poor",
        "ord": "Very poor",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_p1_pAmountYouLearnedWas_na}}",
        "label": "Amount you learned was · N/A",
        "ord": "N/A",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_p1_pRelevanceOfCourseContent_excellent}}",
        "label": "Relevance of course content was · Excellent",
        "ord": "Excellent",
        "item": "Relevance of course content was"
      },
      {
        "tok": "{{k_p1_pRelevanceOfCourseContent_good}}",
        "label": "Relevance of course content was · Good",
        "ord": "Good",
        "item": "Relevance of course content was"
      },
      {
        "tok": "{{k_p1_pRelevanceOfCourseContent_fair}}",
        "label": "Relevance of course content was · Fair",
        "ord": "Fair",
        "item": "Relevance of course content was"
      },
      {
        "tok": "{{k_p1_pRelevanceOfCourseContent_poor}}",
        "label": "Relevance of course content was · Poor",
        "ord": "Poor",
        "item": "Relevance of course content was"
      },
      {
        "tok": "{{k_p1_pRelevanceOfCourseContent_verypoor}}",
        "label": "Relevance of course content was · Very poor",
        "ord": "Very poor",
        "item": "Relevance of course content was"
      },
      {
        "tok": "{{k_p1_pRelevanceOfCourseContent_na}}",
        "label": "Relevance of course content was · N/A",
        "ord": "N/A",
        "item": "Relevance of course content was"
      },
      {
        "tok": "{{k_p2_pTheCourseAsA2_excellent}}",
        "label": "The course as a whole was · Excellent",
        "ord": "Excellent",
        "item": "The course as a whole was"
      },
      {
        "tok": "{{k_p2_pTheCourseAsA2_good}}",
        "label": "The course as a whole was · Good",
        "ord": "Good",
        "item": "The course as a whole was"
      },
      {
        "tok": "{{k_p2_pTheCourseAsA2_fair}}",
        "label": "The course as a whole was · Fair",
        "ord": "Fair",
        "item": "The course as a whole was"
      },
      {
        "tok": "{{k_p2_pTheCourseAsA2_poor}}",
        "label": "The course as a whole was · Poor",
        "ord": "Poor",
        "item": "The course as a whole was"
      },
      {
        "tok": "{{k_p2_pTheCourseAsA2_verypoor}}",
        "label": "The course as a whole was · Very poor",
        "ord": "Very poor",
        "item": "The course as a whole was"
      },
      {
        "tok": "{{k_p2_pTheCourseAsA2_na}}",
        "label": "The course as a whole was · N/A",
        "ord": "N/A",
        "item": "The course as a whole was"
      },
      {
        "tok": "{{k_p2_pTheCourseContentWas2_excellent}}",
        "label": "The course content was · Excellent",
        "ord": "Excellent",
        "item": "The course content was"
      },
      {
        "tok": "{{k_p2_pTheCourseContentWas2_good}}",
        "label": "The course content was · Good",
        "ord": "Good",
        "item": "The course content was"
      },
      {
        "tok": "{{k_p2_pTheCourseContentWas2_fair}}",
        "label": "The course content was · Fair",
        "ord": "Fair",
        "item": "The course content was"
      },
      {
        "tok": "{{k_p2_pTheCourseContentWas2_poor}}",
        "label": "The course content was · Poor",
        "ord": "Poor",
        "item": "The course content was"
      },
      {
        "tok": "{{k_p2_pTheCourseContentWas2_verypoor}}",
        "label": "The course content was · Very poor",
        "ord": "Very poor",
        "item": "The course content was"
      },
      {
        "tok": "{{k_p2_pTheCourseContentWas2_na}}",
        "label": "The course content was · N/A",
        "ord": "N/A",
        "item": "The course content was"
      },
      {
        "tok": "{{k_p2_pTheInstructorsContributionTo_excellent}}",
        "label": "The instructor's contribution to the course was · Excellent",
        "ord": "Excellent",
        "item": "The instructor's contribution to the course was"
      },
      {
        "tok": "{{k_p2_pTheInstructorsContributionTo_good}}",
        "label": "The instructor's contribution to the course was · Good",
        "ord": "Good",
        "item": "The instructor's contribution to the course was"
      },
      {
        "tok": "{{k_p2_pTheInstructorsContributionTo_fair}}",
        "label": "The instructor's contribution to the course was · Fair",
        "ord": "Fair",
        "item": "The instructor's contribution to the course was"
      },
      {
        "tok": "{{k_p2_pTheInstructorsContributionTo_poor}}",
        "label": "The instructor's contribution to the course was · Poor",
        "ord": "Poor",
        "item": "The instructor's contribution to the course was"
      },
      {
        "tok": "{{k_p2_pTheInstructorsContributionTo_verypoor}}",
        "label": "The instructor's contribution to the course was · Very poor",
        "ord": "Very poor",
        "item": "The instructor's contribution to the course was"
      },
      {
        "tok": "{{k_p2_pTheInstructorsContributionTo_na}}",
        "label": "The instructor's contribution to the course was · N/A",
        "ord": "N/A",
        "item": "The instructor's contribution to the course was"
      },
      {
        "tok": "{{k_p2_pTheInstructorsEffectivenessIn_excellent}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Excellent",
        "ord": "Excellent",
        "item": "The instructor's effectiveness in teaching the subject matter was"
      },
      {
        "tok": "{{k_p2_pTheInstructorsEffectivenessIn_good}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Good",
        "ord": "Good",
        "item": "The instructor's effectiveness in teaching the subject matter was"
      },
      {
        "tok": "{{k_p2_pTheInstructorsEffectivenessIn_fair}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Fair",
        "ord": "Fair",
        "item": "The instructor's effectiveness in teaching the subject matter was"
      },
      {
        "tok": "{{k_p2_pTheInstructorsEffectivenessIn_poor}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Poor",
        "ord": "Poor",
        "item": "The instructor's effectiveness in teaching the subject matter was"
      },
      {
        "tok": "{{k_p2_pTheInstructorsEffectivenessIn_verypoor}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Very poor",
        "ord": "Very poor",
        "item": "The instructor's effectiveness in teaching the subject matter was"
      },
      {
        "tok": "{{k_p2_pTheInstructorsEffectivenessIn_na}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · N/A",
        "ord": "N/A",
        "item": "The instructor's effectiveness in teaching the subject matter was"
      },
      {
        "tok": "{{k_p2_pCourseOrganisationWas_excellent}}",
        "label": "Course organisation was · Excellent",
        "ord": "Excellent",
        "item": "Course organisation was"
      },
      {
        "tok": "{{k_p2_pCourseOrganisationWas_good}}",
        "label": "Course organisation was · Good",
        "ord": "Good",
        "item": "Course organisation was"
      },
      {
        "tok": "{{k_p2_pCourseOrganisationWas_fair}}",
        "label": "Course organisation was · Fair",
        "ord": "Fair",
        "item": "Course organisation was"
      },
      {
        "tok": "{{k_p2_pCourseOrganisationWas_poor}}",
        "label": "Course organisation was · Poor",
        "ord": "Poor",
        "item": "Course organisation was"
      },
      {
        "tok": "{{k_p2_pCourseOrganisationWas_verypoor}}",
        "label": "Course organisation was · Very poor",
        "ord": "Very poor",
        "item": "Course organisation was"
      },
      {
        "tok": "{{k_p2_pCourseOrganisationWas_na}}",
        "label": "Course organisation was · N/A",
        "ord": "N/A",
        "item": "Course organisation was"
      },
      {
        "tok": "{{k_p2_pClarityOfInstructorsVoice_excellent}}",
        "label": "Clarity of instructor's voice was · Excellent",
        "ord": "Excellent",
        "item": "Clarity of instructor's voice was"
      },
      {
        "tok": "{{k_p2_pClarityOfInstructorsVoice_good}}",
        "label": "Clarity of instructor's voice was · Good",
        "ord": "Good",
        "item": "Clarity of instructor's voice was"
      },
      {
        "tok": "{{k_p2_pClarityOfInstructorsVoice_fair}}",
        "label": "Clarity of instructor's voice was · Fair",
        "ord": "Fair",
        "item": "Clarity of instructor's voice was"
      },
      {
        "tok": "{{k_p2_pClarityOfInstructorsVoice_poor}}",
        "label": "Clarity of instructor's voice was · Poor",
        "ord": "Poor",
        "item": "Clarity of instructor's voice was"
      },
      {
        "tok": "{{k_p2_pClarityOfInstructorsVoice_verypoor}}",
        "label": "Clarity of instructor's voice was · Very poor",
        "ord": "Very poor",
        "item": "Clarity of instructor's voice was"
      },
      {
        "tok": "{{k_p2_pClarityOfInstructorsVoice_na}}",
        "label": "Clarity of instructor's voice was · N/A",
        "ord": "N/A",
        "item": "Clarity of instructor's voice was"
      },
      {
        "tok": "{{k_p2_pExplanationsByInstructorWere_excellent}}",
        "label": "Explanations by instructor were · Excellent",
        "ord": "Excellent",
        "item": "Explanations by instructor were"
      },
      {
        "tok": "{{k_p2_pExplanationsByInstructorWere_good}}",
        "label": "Explanations by instructor were · Good",
        "ord": "Good",
        "item": "Explanations by instructor were"
      },
      {
        "tok": "{{k_p2_pExplanationsByInstructorWere_fair}}",
        "label": "Explanations by instructor were · Fair",
        "ord": "Fair",
        "item": "Explanations by instructor were"
      },
      {
        "tok": "{{k_p2_pExplanationsByInstructorWere_poor}}",
        "label": "Explanations by instructor were · Poor",
        "ord": "Poor",
        "item": "Explanations by instructor were"
      },
      {
        "tok": "{{k_p2_pExplanationsByInstructorWere_verypoor}}",
        "label": "Explanations by instructor were · Very poor",
        "ord": "Very poor",
        "item": "Explanations by instructor were"
      },
      {
        "tok": "{{k_p2_pExplanationsByInstructorWere_na}}",
        "label": "Explanations by instructor were · N/A",
        "ord": "N/A",
        "item": "Explanations by instructor were"
      },
      {
        "tok": "{{k_p2_pInstructorsUseOfExamples_excellent}}",
        "label": "Instructor's use of examples and illustrations was · Excellent",
        "ord": "Excellent",
        "item": "Instructor's use of examples and illustrations was"
      },
      {
        "tok": "{{k_p2_pInstructorsUseOfExamples_good}}",
        "label": "Instructor's use of examples and illustrations was · Good",
        "ord": "Good",
        "item": "Instructor's use of examples and illustrations was"
      },
      {
        "tok": "{{k_p2_pInstructorsUseOfExamples_fair}}",
        "label": "Instructor's use of examples and illustrations was · Fair",
        "ord": "Fair",
        "item": "Instructor's use of examples and illustrations was"
      },
      {
        "tok": "{{k_p2_pInstructorsUseOfExamples_poor}}",
        "label": "Instructor's use of examples and illustrations was · Poor",
        "ord": "Poor",
        "item": "Instructor's use of examples and illustrations was"
      },
      {
        "tok": "{{k_p2_pInstructorsUseOfExamples_verypoor}}",
        "label": "Instructor's use of examples and illustrations was · Very poor",
        "ord": "Very poor",
        "item": "Instructor's use of examples and illustrations was"
      },
      {
        "tok": "{{k_p2_pInstructorsUseOfExamples_na}}",
        "label": "Instructor's use of examples and illustrations was · N/A",
        "ord": "N/A",
        "item": "Instructor's use of examples and illustrations was"
      },
      {
        "tok": "{{k_p2_pQualityOfQuestionsOr_excellent}}",
        "label": "Quality of questions or problems raised by the instructor was · Excellent",
        "ord": "Excellent",
        "item": "Quality of questions or problems raised by the instructor was"
      },
      {
        "tok": "{{k_p2_pQualityOfQuestionsOr_good}}",
        "label": "Quality of questions or problems raised by the instructor was · Good",
        "ord": "Good",
        "item": "Quality of questions or problems raised by the instructor was"
      },
      {
        "tok": "{{k_p2_pQualityOfQuestionsOr_fair}}",
        "label": "Quality of questions or problems raised by the instructor was · Fair",
        "ord": "Fair",
        "item": "Quality of questions or problems raised by the instructor was"
      },
      {
        "tok": "{{k_p2_pQualityOfQuestionsOr_poor}}",
        "label": "Quality of questions or problems raised by the instructor was · Poor",
        "ord": "Poor",
        "item": "Quality of questions or problems raised by the instructor was"
      },
      {
        "tok": "{{k_p2_pQualityOfQuestionsOr_verypoor}}",
        "label": "Quality of questions or problems raised by the instructor was · Very poor",
        "ord": "Very poor",
        "item": "Quality of questions or problems raised by the instructor was"
      },
      {
        "tok": "{{k_p2_pQualityOfQuestionsOr_na}}",
        "label": "Quality of questions or problems raised by the instructor was · N/A",
        "ord": "N/A",
        "item": "Quality of questions or problems raised by the instructor was"
      },
      {
        "tok": "{{k_p2_pStudentsConfidenceInInstructors_excellent}}",
        "label": "Student's confidence in instructor's knowledge was · Excellent",
        "ord": "Excellent",
        "item": "Student's confidence in instructor's knowledge was"
      },
      {
        "tok": "{{k_p2_pStudentsConfidenceInInstructors_good}}",
        "label": "Student's confidence in instructor's knowledge was · Good",
        "ord": "Good",
        "item": "Student's confidence in instructor's knowledge was"
      },
      {
        "tok": "{{k_p2_pStudentsConfidenceInInstructors_fair}}",
        "label": "Student's confidence in instructor's knowledge was · Fair",
        "ord": "Fair",
        "item": "Student's confidence in instructor's knowledge was"
      },
      {
        "tok": "{{k_p2_pStudentsConfidenceInInstructors_poor}}",
        "label": "Student's confidence in instructor's knowledge was · Poor",
        "ord": "Poor",
        "item": "Student's confidence in instructor's knowledge was"
      },
      {
        "tok": "{{k_p2_pStudentsConfidenceInInstructors_verypoor}}",
        "label": "Student's confidence in instructor's knowledge was · Very poor",
        "ord": "Very poor",
        "item": "Student's confidence in instructor's knowledge was"
      },
      {
        "tok": "{{k_p2_pStudentsConfidenceInInstructors_na}}",
        "label": "Student's confidence in instructor's knowledge was · N/A",
        "ord": "N/A",
        "item": "Student's confidence in instructor's knowledge was"
      },
      {
        "tok": "{{k_p2_pInstructorsEnthusiasmWas_excellent}}",
        "label": "Instructor's enthusiasm was · Excellent",
        "ord": "Excellent",
        "item": "Instructor's enthusiasm was"
      },
      {
        "tok": "{{k_p2_pInstructorsEnthusiasmWas_good}}",
        "label": "Instructor's enthusiasm was · Good",
        "ord": "Good",
        "item": "Instructor's enthusiasm was"
      },
      {
        "tok": "{{k_p2_pInstructorsEnthusiasmWas_fair}}",
        "label": "Instructor's enthusiasm was · Fair",
        "ord": "Fair",
        "item": "Instructor's enthusiasm was"
      },
      {
        "tok": "{{k_p2_pInstructorsEnthusiasmWas_poor}}",
        "label": "Instructor's enthusiasm was · Poor",
        "ord": "Poor",
        "item": "Instructor's enthusiasm was"
      },
      {
        "tok": "{{k_p2_pInstructorsEnthusiasmWas_verypoor}}",
        "label": "Instructor's enthusiasm was · Very poor",
        "ord": "Very poor",
        "item": "Instructor's enthusiasm was"
      },
      {
        "tok": "{{k_p2_pInstructorsEnthusiasmWas_na}}",
        "label": "Instructor's enthusiasm was · N/A",
        "ord": "N/A",
        "item": "Instructor's enthusiasm was"
      },
      {
        "tok": "{{k_p2_pEncouragementGivenToStudents_excellent}}",
        "label": "Encouragement given to students to participate was · Excellent",
        "ord": "Excellent",
        "item": "Encouragement given to students to participate was"
      },
      {
        "tok": "{{k_p2_pEncouragementGivenToStudents_good}}",
        "label": "Encouragement given to students to participate was · Good",
        "ord": "Good",
        "item": "Encouragement given to students to participate was"
      },
      {
        "tok": "{{k_p2_pEncouragementGivenToStudents_fair}}",
        "label": "Encouragement given to students to participate was · Fair",
        "ord": "Fair",
        "item": "Encouragement given to students to participate was"
      },
      {
        "tok": "{{k_p2_pEncouragementGivenToStudents_poor}}",
        "label": "Encouragement given to students to participate was · Poor",
        "ord": "Poor",
        "item": "Encouragement given to students to participate was"
      },
      {
        "tok": "{{k_p2_pEncouragementGivenToStudents_verypoor}}",
        "label": "Encouragement given to students to participate was · Very poor",
        "ord": "Very poor",
        "item": "Encouragement given to students to participate was"
      },
      {
        "tok": "{{k_p2_pEncouragementGivenToStudents_na}}",
        "label": "Encouragement given to students to participate was · N/A",
        "ord": "N/A",
        "item": "Encouragement given to students to participate was"
      },
      {
        "tok": "{{k_p2_pAnswersToStudentQuestions_excellent}}",
        "label": "Answers to student questions were · Excellent",
        "ord": "Excellent",
        "item": "Answers to student questions were"
      },
      {
        "tok": "{{k_p2_pAnswersToStudentQuestions_good}}",
        "label": "Answers to student questions were · Good",
        "ord": "Good",
        "item": "Answers to student questions were"
      },
      {
        "tok": "{{k_p2_pAnswersToStudentQuestions_fair}}",
        "label": "Answers to student questions were · Fair",
        "ord": "Fair",
        "item": "Answers to student questions were"
      },
      {
        "tok": "{{k_p2_pAnswersToStudentQuestions_poor}}",
        "label": "Answers to student questions were · Poor",
        "ord": "Poor",
        "item": "Answers to student questions were"
      },
      {
        "tok": "{{k_p2_pAnswersToStudentQuestions_verypoor}}",
        "label": "Answers to student questions were · Very poor",
        "ord": "Very poor",
        "item": "Answers to student questions were"
      },
      {
        "tok": "{{k_p2_pAnswersToStudentQuestions_na}}",
        "label": "Answers to student questions were · N/A",
        "ord": "N/A",
        "item": "Answers to student questions were"
      },
      {
        "tok": "{{k_p2_pAvailabilityOfExtraHelp2_excellent}}",
        "label": "Availability of extra help when needed was · Excellent",
        "ord": "Excellent",
        "item": "Availability of extra help when needed was"
      },
      {
        "tok": "{{k_p2_pAvailabilityOfExtraHelp2_good}}",
        "label": "Availability of extra help when needed was · Good",
        "ord": "Good",
        "item": "Availability of extra help when needed was"
      },
      {
        "tok": "{{k_p2_pAvailabilityOfExtraHelp2_fair}}",
        "label": "Availability of extra help when needed was · Fair",
        "ord": "Fair",
        "item": "Availability of extra help when needed was"
      },
      {
        "tok": "{{k_p2_pAvailabilityOfExtraHelp2_poor}}",
        "label": "Availability of extra help when needed was · Poor",
        "ord": "Poor",
        "item": "Availability of extra help when needed was"
      },
      {
        "tok": "{{k_p2_pAvailabilityOfExtraHelp2_verypoor}}",
        "label": "Availability of extra help when needed was · Very poor",
        "ord": "Very poor",
        "item": "Availability of extra help when needed was"
      },
      {
        "tok": "{{k_p2_pAvailabilityOfExtraHelp2_na}}",
        "label": "Availability of extra help when needed was · N/A",
        "ord": "N/A",
        "item": "Availability of extra help when needed was"
      },
      {
        "tok": "{{k_p2_pUseOfClassTime_excellent}}",
        "label": "Use of class time was · Excellent",
        "ord": "Excellent",
        "item": "Use of class time was"
      },
      {
        "tok": "{{k_p2_pUseOfClassTime_good}}",
        "label": "Use of class time was · Good",
        "ord": "Good",
        "item": "Use of class time was"
      },
      {
        "tok": "{{k_p2_pUseOfClassTime_fair}}",
        "label": "Use of class time was · Fair",
        "ord": "Fair",
        "item": "Use of class time was"
      },
      {
        "tok": "{{k_p2_pUseOfClassTime_poor}}",
        "label": "Use of class time was · Poor",
        "ord": "Poor",
        "item": "Use of class time was"
      },
      {
        "tok": "{{k_p2_pUseOfClassTime_verypoor}}",
        "label": "Use of class time was · Very poor",
        "ord": "Very poor",
        "item": "Use of class time was"
      },
      {
        "tok": "{{k_p2_pUseOfClassTime_na}}",
        "label": "Use of class time was · N/A",
        "ord": "N/A",
        "item": "Use of class time was"
      },
      {
        "tok": "{{k_p2_pInstructorsInterestInStudents_excellent}}",
        "label": "Instructor's interest in student's progress was · Excellent",
        "ord": "Excellent",
        "item": "Instructor's interest in student's progress was"
      },
      {
        "tok": "{{k_p2_pInstructorsInterestInStudents_good}}",
        "label": "Instructor's interest in student's progress was · Good",
        "ord": "Good",
        "item": "Instructor's interest in student's progress was"
      },
      {
        "tok": "{{k_p2_pInstructorsInterestInStudents_fair}}",
        "label": "Instructor's interest in student's progress was · Fair",
        "ord": "Fair",
        "item": "Instructor's interest in student's progress was"
      },
      {
        "tok": "{{k_p2_pInstructorsInterestInStudents_poor}}",
        "label": "Instructor's interest in student's progress was · Poor",
        "ord": "Poor",
        "item": "Instructor's interest in student's progress was"
      },
      {
        "tok": "{{k_p2_pInstructorsInterestInStudents_verypoor}}",
        "label": "Instructor's interest in student's progress was · Very poor",
        "ord": "Very poor",
        "item": "Instructor's interest in student's progress was"
      },
      {
        "tok": "{{k_p2_pInstructorsInterestInStudents_na}}",
        "label": "Instructor's interest in student's progress was · N/A",
        "ord": "N/A",
        "item": "Instructor's interest in student's progress was"
      },
      {
        "tok": "{{k_p2_pAmountYouLearnedWas2_excellent}}",
        "label": "Amount you learned was · Excellent",
        "ord": "Excellent",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_p2_pAmountYouLearnedWas2_good}}",
        "label": "Amount you learned was · Good",
        "ord": "Good",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_p2_pAmountYouLearnedWas2_fair}}",
        "label": "Amount you learned was · Fair",
        "ord": "Fair",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_p2_pAmountYouLearnedWas2_poor}}",
        "label": "Amount you learned was · Poor",
        "ord": "Poor",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_p2_pAmountYouLearnedWas2_verypoor}}",
        "label": "Amount you learned was · Very poor",
        "ord": "Very poor",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_p2_pAmountYouLearnedWas2_na}}",
        "label": "Amount you learned was · N/A",
        "ord": "N/A",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_p2_pRelevanceOfCourseContent2_excellent}}",
        "label": "Relevance of course content was · Excellent",
        "ord": "Excellent",
        "item": "Relevance of course content was"
      },
      {
        "tok": "{{k_p2_pRelevanceOfCourseContent2_good}}",
        "label": "Relevance of course content was · Good",
        "ord": "Good",
        "item": "Relevance of course content was"
      },
      {
        "tok": "{{k_p2_pRelevanceOfCourseContent2_fair}}",
        "label": "Relevance of course content was · Fair",
        "ord": "Fair",
        "item": "Relevance of course content was"
      },
      {
        "tok": "{{k_p2_pRelevanceOfCourseContent2_poor}}",
        "label": "Relevance of course content was · Poor",
        "ord": "Poor",
        "item": "Relevance of course content was"
      },
      {
        "tok": "{{k_p2_pRelevanceOfCourseContent2_verypoor}}",
        "label": "Relevance of course content was · Very poor",
        "ord": "Very poor",
        "item": "Relevance of course content was"
      },
      {
        "tok": "{{k_p2_pRelevanceOfCourseContent2_na}}",
        "label": "Relevance of course content was · N/A",
        "ord": "N/A",
        "item": "Relevance of course content was"
      },
      {
        "tok": "{{k_p2_pGradingTechniquesWere_excellent}}",
        "label": "Grading techniques were · Excellent",
        "ord": "Excellent",
        "item": "Grading techniques were"
      },
      {
        "tok": "{{k_p2_pGradingTechniquesWere_good}}",
        "label": "Grading techniques were · Good",
        "ord": "Good",
        "item": "Grading techniques were"
      },
      {
        "tok": "{{k_p2_pGradingTechniquesWere_fair}}",
        "label": "Grading techniques were · Fair",
        "ord": "Fair",
        "item": "Grading techniques were"
      },
      {
        "tok": "{{k_p2_pGradingTechniquesWere_poor}}",
        "label": "Grading techniques were · Poor",
        "ord": "Poor",
        "item": "Grading techniques were"
      },
      {
        "tok": "{{k_p2_pGradingTechniquesWere_verypoor}}",
        "label": "Grading techniques were · Very poor",
        "ord": "Very poor",
        "item": "Grading techniques were"
      },
      {
        "tok": "{{k_p2_pGradingTechniquesWere_na}}",
        "label": "Grading techniques were · N/A",
        "ord": "N/A",
        "item": "Grading techniques were"
      },
      {
        "tok": "{{k_p2_pAmountOfAssignedWork_excellent}}",
        "label": "Amount of assigned work was · Excellent",
        "ord": "Excellent",
        "item": "Amount of assigned work was"
      },
      {
        "tok": "{{k_p2_pAmountOfAssignedWork_good}}",
        "label": "Amount of assigned work was · Good",
        "ord": "Good",
        "item": "Amount of assigned work was"
      },
      {
        "tok": "{{k_p2_pAmountOfAssignedWork_fair}}",
        "label": "Amount of assigned work was · Fair",
        "ord": "Fair",
        "item": "Amount of assigned work was"
      },
      {
        "tok": "{{k_p2_pAmountOfAssignedWork_poor}}",
        "label": "Amount of assigned work was · Poor",
        "ord": "Poor",
        "item": "Amount of assigned work was"
      },
      {
        "tok": "{{k_p2_pAmountOfAssignedWork_verypoor}}",
        "label": "Amount of assigned work was · Very poor",
        "ord": "Very poor",
        "item": "Amount of assigned work was"
      },
      {
        "tok": "{{k_p2_pAmountOfAssignedWork_na}}",
        "label": "Amount of assigned work was · N/A",
        "ord": "N/A",
        "item": "Amount of assigned work was"
      },
      {
        "tok": "{{k_p3_pTheTrainingAsA_excellent}}",
        "label": "The training as a whole was · Excellent",
        "ord": "Excellent",
        "item": "The training as a whole was"
      },
      {
        "tok": "{{k_p3_pTheTrainingAsA_good}}",
        "label": "The training as a whole was · Good",
        "ord": "Good",
        "item": "The training as a whole was"
      },
      {
        "tok": "{{k_p3_pTheTrainingAsA_fair}}",
        "label": "The training as a whole was · Fair",
        "ord": "Fair",
        "item": "The training as a whole was"
      },
      {
        "tok": "{{k_p3_pTheTrainingAsA_poor}}",
        "label": "The training as a whole was · Poor",
        "ord": "Poor",
        "item": "The training as a whole was"
      },
      {
        "tok": "{{k_p3_pTheTrainingAsA_verypoor}}",
        "label": "The training as a whole was · Very poor",
        "ord": "Very poor",
        "item": "The training as a whole was"
      },
      {
        "tok": "{{k_p3_pTheTrainingAsA_na}}",
        "label": "The training as a whole was · N/A",
        "ord": "N/A",
        "item": "The training as a whole was"
      },
      {
        "tok": "{{k_p3_pTheContentWas_excellent}}",
        "label": "The content was · Excellent",
        "ord": "Excellent",
        "item": "The content was"
      },
      {
        "tok": "{{k_p3_pTheContentWas_good}}",
        "label": "The content was · Good",
        "ord": "Good",
        "item": "The content was"
      },
      {
        "tok": "{{k_p3_pTheContentWas_fair}}",
        "label": "The content was · Fair",
        "ord": "Fair",
        "item": "The content was"
      },
      {
        "tok": "{{k_p3_pTheContentWas_poor}}",
        "label": "The content was · Poor",
        "ord": "Poor",
        "item": "The content was"
      },
      {
        "tok": "{{k_p3_pTheContentWas_verypoor}}",
        "label": "The content was · Very poor",
        "ord": "Very poor",
        "item": "The content was"
      },
      {
        "tok": "{{k_p3_pTheContentWas_na}}",
        "label": "The content was · N/A",
        "ord": "N/A",
        "item": "The content was"
      },
      {
        "tok": "{{k_p3_pTheInstructorsContributionTo2_excellent}}",
        "label": "The instructor's contribution to the training was · Excellent",
        "ord": "Excellent",
        "item": "The instructor's contribution to the training was"
      },
      {
        "tok": "{{k_p3_pTheInstructorsContributionTo2_good}}",
        "label": "The instructor's contribution to the training was · Good",
        "ord": "Good",
        "item": "The instructor's contribution to the training was"
      },
      {
        "tok": "{{k_p3_pTheInstructorsContributionTo2_fair}}",
        "label": "The instructor's contribution to the training was · Fair",
        "ord": "Fair",
        "item": "The instructor's contribution to the training was"
      },
      {
        "tok": "{{k_p3_pTheInstructorsContributionTo2_poor}}",
        "label": "The instructor's contribution to the training was · Poor",
        "ord": "Poor",
        "item": "The instructor's contribution to the training was"
      },
      {
        "tok": "{{k_p3_pTheInstructorsContributionTo2_verypoor}}",
        "label": "The instructor's contribution to the training was · Very poor",
        "ord": "Very poor",
        "item": "The instructor's contribution to the training was"
      },
      {
        "tok": "{{k_p3_pTheInstructorsContributionTo2_na}}",
        "label": "The instructor's contribution to the training was · N/A",
        "ord": "N/A",
        "item": "The instructor's contribution to the training was"
      },
      {
        "tok": "{{k_p3_pTheInstructorsEffectivenessIn2_excellent}}",
        "label": "The instructor's effectiveness in teaching the training matter was · Excellent",
        "ord": "Excellent",
        "item": "The instructor's effectiveness in teaching the training matter was"
      },
      {
        "tok": "{{k_p3_pTheInstructorsEffectivenessIn2_good}}",
        "label": "The instructor's effectiveness in teaching the training matter was · Good",
        "ord": "Good",
        "item": "The instructor's effectiveness in teaching the training matter was"
      },
      {
        "tok": "{{k_p3_pTheInstructorsEffectivenessIn2_fair}}",
        "label": "The instructor's effectiveness in teaching the training matter was · Fair",
        "ord": "Fair",
        "item": "The instructor's effectiveness in teaching the training matter was"
      },
      {
        "tok": "{{k_p3_pTheInstructorsEffectivenessIn2_poor}}",
        "label": "The instructor's effectiveness in teaching the training matter was · Poor",
        "ord": "Poor",
        "item": "The instructor's effectiveness in teaching the training matter was"
      },
      {
        "tok": "{{k_p3_pTheInstructorsEffectivenessIn2_verypoor}}",
        "label": "The instructor's effectiveness in teaching the training matter was · Very poor",
        "ord": "Very poor",
        "item": "The instructor's effectiveness in teaching the training matter was"
      },
      {
        "tok": "{{k_p3_pTheInstructorsEffectivenessIn2_na}}",
        "label": "The instructor's effectiveness in teaching the training matter was · N/A",
        "ord": "N/A",
        "item": "The instructor's effectiveness in teaching the training matter was"
      },
      {
        "tok": "{{k_p3_pHowWasTheTraining_excellent}}",
        "label": "How was the training conducted by instructor · Excellent",
        "ord": "Excellent",
        "item": "How was the training conducted by instructor"
      },
      {
        "tok": "{{k_p3_pHowWasTheTraining_good}}",
        "label": "How was the training conducted by instructor · Good",
        "ord": "Good",
        "item": "How was the training conducted by instructor"
      },
      {
        "tok": "{{k_p3_pHowWasTheTraining_fair}}",
        "label": "How was the training conducted by instructor · Fair",
        "ord": "Fair",
        "item": "How was the training conducted by instructor"
      },
      {
        "tok": "{{k_p3_pHowWasTheTraining_poor}}",
        "label": "How was the training conducted by instructor · Poor",
        "ord": "Poor",
        "item": "How was the training conducted by instructor"
      },
      {
        "tok": "{{k_p3_pHowWasTheTraining_verypoor}}",
        "label": "How was the training conducted by instructor · Very poor",
        "ord": "Very poor",
        "item": "How was the training conducted by instructor"
      },
      {
        "tok": "{{k_p3_pHowWasTheTraining_na}}",
        "label": "How was the training conducted by instructor · N/A",
        "ord": "N/A",
        "item": "How was the training conducted by instructor"
      },
      {
        "tok": "{{k_p3_pClarityOfInstructorsVoice2_excellent}}",
        "label": "Clarity of instructor's voice was · Excellent",
        "ord": "Excellent",
        "item": "Clarity of instructor's voice was"
      },
      {
        "tok": "{{k_p3_pClarityOfInstructorsVoice2_good}}",
        "label": "Clarity of instructor's voice was · Good",
        "ord": "Good",
        "item": "Clarity of instructor's voice was"
      },
      {
        "tok": "{{k_p3_pClarityOfInstructorsVoice2_fair}}",
        "label": "Clarity of instructor's voice was · Fair",
        "ord": "Fair",
        "item": "Clarity of instructor's voice was"
      },
      {
        "tok": "{{k_p3_pClarityOfInstructorsVoice2_poor}}",
        "label": "Clarity of instructor's voice was · Poor",
        "ord": "Poor",
        "item": "Clarity of instructor's voice was"
      },
      {
        "tok": "{{k_p3_pClarityOfInstructorsVoice2_verypoor}}",
        "label": "Clarity of instructor's voice was · Very poor",
        "ord": "Very poor",
        "item": "Clarity of instructor's voice was"
      },
      {
        "tok": "{{k_p3_pClarityOfInstructorsVoice2_na}}",
        "label": "Clarity of instructor's voice was · N/A",
        "ord": "N/A",
        "item": "Clarity of instructor's voice was"
      },
      {
        "tok": "{{k_p3_pExplanationsByInstructorWere2_excellent}}",
        "label": "Explanations by instructor were · Excellent",
        "ord": "Excellent",
        "item": "Explanations by instructor were"
      },
      {
        "tok": "{{k_p3_pExplanationsByInstructorWere2_good}}",
        "label": "Explanations by instructor were · Good",
        "ord": "Good",
        "item": "Explanations by instructor were"
      },
      {
        "tok": "{{k_p3_pExplanationsByInstructorWere2_fair}}",
        "label": "Explanations by instructor were · Fair",
        "ord": "Fair",
        "item": "Explanations by instructor were"
      },
      {
        "tok": "{{k_p3_pExplanationsByInstructorWere2_poor}}",
        "label": "Explanations by instructor were · Poor",
        "ord": "Poor",
        "item": "Explanations by instructor were"
      },
      {
        "tok": "{{k_p3_pExplanationsByInstructorWere2_verypoor}}",
        "label": "Explanations by instructor were · Very poor",
        "ord": "Very poor",
        "item": "Explanations by instructor were"
      },
      {
        "tok": "{{k_p3_pExplanationsByInstructorWere2_na}}",
        "label": "Explanations by instructor were · N/A",
        "ord": "N/A",
        "item": "Explanations by instructor were"
      },
      {
        "tok": "{{k_p3_pInstructorsUseOfExamples2_excellent}}",
        "label": "Instructor's use of examples and illustrations was · Excellent",
        "ord": "Excellent",
        "item": "Instructor's use of examples and illustrations was"
      },
      {
        "tok": "{{k_p3_pInstructorsUseOfExamples2_good}}",
        "label": "Instructor's use of examples and illustrations was · Good",
        "ord": "Good",
        "item": "Instructor's use of examples and illustrations was"
      },
      {
        "tok": "{{k_p3_pInstructorsUseOfExamples2_fair}}",
        "label": "Instructor's use of examples and illustrations was · Fair",
        "ord": "Fair",
        "item": "Instructor's use of examples and illustrations was"
      },
      {
        "tok": "{{k_p3_pInstructorsUseOfExamples2_poor}}",
        "label": "Instructor's use of examples and illustrations was · Poor",
        "ord": "Poor",
        "item": "Instructor's use of examples and illustrations was"
      },
      {
        "tok": "{{k_p3_pInstructorsUseOfExamples2_verypoor}}",
        "label": "Instructor's use of examples and illustrations was · Very poor",
        "ord": "Very poor",
        "item": "Instructor's use of examples and illustrations was"
      },
      {
        "tok": "{{k_p3_pInstructorsUseOfExamples2_na}}",
        "label": "Instructor's use of examples and illustrations was · N/A",
        "ord": "N/A",
        "item": "Instructor's use of examples and illustrations was"
      },
      {
        "tok": "{{k_p3_pQualityOfQuestionsOr2_excellent}}",
        "label": "Quality of questions or problems raised by the instructor was · Excellent",
        "ord": "Excellent",
        "item": "Quality of questions or problems raised by the instructor was"
      },
      {
        "tok": "{{k_p3_pQualityOfQuestionsOr2_good}}",
        "label": "Quality of questions or problems raised by the instructor was · Good",
        "ord": "Good",
        "item": "Quality of questions or problems raised by the instructor was"
      },
      {
        "tok": "{{k_p3_pQualityOfQuestionsOr2_fair}}",
        "label": "Quality of questions or problems raised by the instructor was · Fair",
        "ord": "Fair",
        "item": "Quality of questions or problems raised by the instructor was"
      },
      {
        "tok": "{{k_p3_pQualityOfQuestionsOr2_poor}}",
        "label": "Quality of questions or problems raised by the instructor was · Poor",
        "ord": "Poor",
        "item": "Quality of questions or problems raised by the instructor was"
      },
      {
        "tok": "{{k_p3_pQualityOfQuestionsOr2_verypoor}}",
        "label": "Quality of questions or problems raised by the instructor was · Very poor",
        "ord": "Very poor",
        "item": "Quality of questions or problems raised by the instructor was"
      },
      {
        "tok": "{{k_p3_pQualityOfQuestionsOr2_na}}",
        "label": "Quality of questions or problems raised by the instructor was · N/A",
        "ord": "N/A",
        "item": "Quality of questions or problems raised by the instructor was"
      },
      {
        "tok": "{{k_p3_pStudentsConfidenceInInstructors2_excellent}}",
        "label": "Student's confidence in instructor's knowledge was · Excellent",
        "ord": "Excellent",
        "item": "Student's confidence in instructor's knowledge was"
      },
      {
        "tok": "{{k_p3_pStudentsConfidenceInInstructors2_good}}",
        "label": "Student's confidence in instructor's knowledge was · Good",
        "ord": "Good",
        "item": "Student's confidence in instructor's knowledge was"
      },
      {
        "tok": "{{k_p3_pStudentsConfidenceInInstructors2_fair}}",
        "label": "Student's confidence in instructor's knowledge was · Fair",
        "ord": "Fair",
        "item": "Student's confidence in instructor's knowledge was"
      },
      {
        "tok": "{{k_p3_pStudentsConfidenceInInstructors2_poor}}",
        "label": "Student's confidence in instructor's knowledge was · Poor",
        "ord": "Poor",
        "item": "Student's confidence in instructor's knowledge was"
      },
      {
        "tok": "{{k_p3_pStudentsConfidenceInInstructors2_verypoor}}",
        "label": "Student's confidence in instructor's knowledge was · Very poor",
        "ord": "Very poor",
        "item": "Student's confidence in instructor's knowledge was"
      },
      {
        "tok": "{{k_p3_pStudentsConfidenceInInstructors2_na}}",
        "label": "Student's confidence in instructor's knowledge was · N/A",
        "ord": "N/A",
        "item": "Student's confidence in instructor's knowledge was"
      },
      {
        "tok": "{{k_p3_pInstructorsEnthusiasmWas2_excellent}}",
        "label": "Instructor's enthusiasm was · Excellent",
        "ord": "Excellent",
        "item": "Instructor's enthusiasm was"
      },
      {
        "tok": "{{k_p3_pInstructorsEnthusiasmWas2_good}}",
        "label": "Instructor's enthusiasm was · Good",
        "ord": "Good",
        "item": "Instructor's enthusiasm was"
      },
      {
        "tok": "{{k_p3_pInstructorsEnthusiasmWas2_fair}}",
        "label": "Instructor's enthusiasm was · Fair",
        "ord": "Fair",
        "item": "Instructor's enthusiasm was"
      },
      {
        "tok": "{{k_p3_pInstructorsEnthusiasmWas2_poor}}",
        "label": "Instructor's enthusiasm was · Poor",
        "ord": "Poor",
        "item": "Instructor's enthusiasm was"
      },
      {
        "tok": "{{k_p3_pInstructorsEnthusiasmWas2_verypoor}}",
        "label": "Instructor's enthusiasm was · Very poor",
        "ord": "Very poor",
        "item": "Instructor's enthusiasm was"
      },
      {
        "tok": "{{k_p3_pInstructorsEnthusiasmWas2_na}}",
        "label": "Instructor's enthusiasm was · N/A",
        "ord": "N/A",
        "item": "Instructor's enthusiasm was"
      },
      {
        "tok": "{{k_p3_pEncouragementGivenToStudents2_excellent}}",
        "label": "Encouragement given to students to participate was · Excellent",
        "ord": "Excellent",
        "item": "Encouragement given to students to participate was"
      },
      {
        "tok": "{{k_p3_pEncouragementGivenToStudents2_good}}",
        "label": "Encouragement given to students to participate was · Good",
        "ord": "Good",
        "item": "Encouragement given to students to participate was"
      },
      {
        "tok": "{{k_p3_pEncouragementGivenToStudents2_fair}}",
        "label": "Encouragement given to students to participate was · Fair",
        "ord": "Fair",
        "item": "Encouragement given to students to participate was"
      },
      {
        "tok": "{{k_p3_pEncouragementGivenToStudents2_poor}}",
        "label": "Encouragement given to students to participate was · Poor",
        "ord": "Poor",
        "item": "Encouragement given to students to participate was"
      },
      {
        "tok": "{{k_p3_pEncouragementGivenToStudents2_verypoor}}",
        "label": "Encouragement given to students to participate was · Very poor",
        "ord": "Very poor",
        "item": "Encouragement given to students to participate was"
      },
      {
        "tok": "{{k_p3_pEncouragementGivenToStudents2_na}}",
        "label": "Encouragement given to students to participate was · N/A",
        "ord": "N/A",
        "item": "Encouragement given to students to participate was"
      },
      {
        "tok": "{{k_p3_pAnswersToStudentQuestions2_excellent}}",
        "label": "Answers to student questions were · Excellent",
        "ord": "Excellent",
        "item": "Answers to student questions were"
      },
      {
        "tok": "{{k_p3_pAnswersToStudentQuestions2_good}}",
        "label": "Answers to student questions were · Good",
        "ord": "Good",
        "item": "Answers to student questions were"
      },
      {
        "tok": "{{k_p3_pAnswersToStudentQuestions2_fair}}",
        "label": "Answers to student questions were · Fair",
        "ord": "Fair",
        "item": "Answers to student questions were"
      },
      {
        "tok": "{{k_p3_pAnswersToStudentQuestions2_poor}}",
        "label": "Answers to student questions were · Poor",
        "ord": "Poor",
        "item": "Answers to student questions were"
      },
      {
        "tok": "{{k_p3_pAnswersToStudentQuestions2_verypoor}}",
        "label": "Answers to student questions were · Very poor",
        "ord": "Very poor",
        "item": "Answers to student questions were"
      },
      {
        "tok": "{{k_p3_pAnswersToStudentQuestions2_na}}",
        "label": "Answers to student questions were · N/A",
        "ord": "N/A",
        "item": "Answers to student questions were"
      },
      {
        "tok": "{{k_p3_pInstructorHelpWhenNeeded_excellent}}",
        "label": "Instructor help when needed was · Excellent",
        "ord": "Excellent",
        "item": "Instructor help when needed was"
      },
      {
        "tok": "{{k_p3_pInstructorHelpWhenNeeded_good}}",
        "label": "Instructor help when needed was · Good",
        "ord": "Good",
        "item": "Instructor help when needed was"
      },
      {
        "tok": "{{k_p3_pInstructorHelpWhenNeeded_fair}}",
        "label": "Instructor help when needed was · Fair",
        "ord": "Fair",
        "item": "Instructor help when needed was"
      },
      {
        "tok": "{{k_p3_pInstructorHelpWhenNeeded_poor}}",
        "label": "Instructor help when needed was · Poor",
        "ord": "Poor",
        "item": "Instructor help when needed was"
      },
      {
        "tok": "{{k_p3_pInstructorHelpWhenNeeded_verypoor}}",
        "label": "Instructor help when needed was · Very poor",
        "ord": "Very poor",
        "item": "Instructor help when needed was"
      },
      {
        "tok": "{{k_p3_pInstructorHelpWhenNeeded_na}}",
        "label": "Instructor help when needed was · N/A",
        "ord": "N/A",
        "item": "Instructor help when needed was"
      },
      {
        "tok": "{{k_p3_pUseOfTrainingTime_excellent}}",
        "label": "Use of training time was · Excellent",
        "ord": "Excellent",
        "item": "Use of training time was"
      },
      {
        "tok": "{{k_p3_pUseOfTrainingTime_good}}",
        "label": "Use of training time was · Good",
        "ord": "Good",
        "item": "Use of training time was"
      },
      {
        "tok": "{{k_p3_pUseOfTrainingTime_fair}}",
        "label": "Use of training time was · Fair",
        "ord": "Fair",
        "item": "Use of training time was"
      },
      {
        "tok": "{{k_p3_pUseOfTrainingTime_poor}}",
        "label": "Use of training time was · Poor",
        "ord": "Poor",
        "item": "Use of training time was"
      },
      {
        "tok": "{{k_p3_pUseOfTrainingTime_verypoor}}",
        "label": "Use of training time was · Very poor",
        "ord": "Very poor",
        "item": "Use of training time was"
      },
      {
        "tok": "{{k_p3_pUseOfTrainingTime_na}}",
        "label": "Use of training time was · N/A",
        "ord": "N/A",
        "item": "Use of training time was"
      },
      {
        "tok": "{{k_p3_pInstructorsInterestInStudents2_excellent}}",
        "label": "Instructor's interest in student's progress was · Excellent",
        "ord": "Excellent",
        "item": "Instructor's interest in student's progress was"
      },
      {
        "tok": "{{k_p3_pInstructorsInterestInStudents2_good}}",
        "label": "Instructor's interest in student's progress was · Good",
        "ord": "Good",
        "item": "Instructor's interest in student's progress was"
      },
      {
        "tok": "{{k_p3_pInstructorsInterestInStudents2_fair}}",
        "label": "Instructor's interest in student's progress was · Fair",
        "ord": "Fair",
        "item": "Instructor's interest in student's progress was"
      },
      {
        "tok": "{{k_p3_pInstructorsInterestInStudents2_poor}}",
        "label": "Instructor's interest in student's progress was · Poor",
        "ord": "Poor",
        "item": "Instructor's interest in student's progress was"
      },
      {
        "tok": "{{k_p3_pInstructorsInterestInStudents2_verypoor}}",
        "label": "Instructor's interest in student's progress was · Very poor",
        "ord": "Very poor",
        "item": "Instructor's interest in student's progress was"
      },
      {
        "tok": "{{k_p3_pInstructorsInterestInStudents2_na}}",
        "label": "Instructor's interest in student's progress was · N/A",
        "ord": "N/A",
        "item": "Instructor's interest in student's progress was"
      },
      {
        "tok": "{{k_p3_pAmountYouLearnedWas3_excellent}}",
        "label": "Amount you learned was · Excellent",
        "ord": "Excellent",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_p3_pAmountYouLearnedWas3_good}}",
        "label": "Amount you learned was · Good",
        "ord": "Good",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_p3_pAmountYouLearnedWas3_fair}}",
        "label": "Amount you learned was · Fair",
        "ord": "Fair",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_p3_pAmountYouLearnedWas3_poor}}",
        "label": "Amount you learned was · Poor",
        "ord": "Poor",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_p3_pAmountYouLearnedWas3_verypoor}}",
        "label": "Amount you learned was · Very poor",
        "ord": "Very poor",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_p3_pAmountYouLearnedWas3_na}}",
        "label": "Amount you learned was · N/A",
        "ord": "N/A",
        "item": "Amount you learned was"
      },
      {
        "tok": "{{k_p3_pRelevanceOfTrainingContent_excellent}}",
        "label": "Relevance of training content was · Excellent",
        "ord": "Excellent",
        "item": "Relevance of training content was"
      },
      {
        "tok": "{{k_p3_pRelevanceOfTrainingContent_good}}",
        "label": "Relevance of training content was · Good",
        "ord": "Good",
        "item": "Relevance of training content was"
      },
      {
        "tok": "{{k_p3_pRelevanceOfTrainingContent_fair}}",
        "label": "Relevance of training content was · Fair",
        "ord": "Fair",
        "item": "Relevance of training content was"
      },
      {
        "tok": "{{k_p3_pRelevanceOfTrainingContent_poor}}",
        "label": "Relevance of training content was · Poor",
        "ord": "Poor",
        "item": "Relevance of training content was"
      },
      {
        "tok": "{{k_p3_pRelevanceOfTrainingContent_verypoor}}",
        "label": "Relevance of training content was · Very poor",
        "ord": "Very poor",
        "item": "Relevance of training content was"
      },
      {
        "tok": "{{k_p3_pRelevanceOfTrainingContent_na}}",
        "label": "Relevance of training content was · N/A",
        "ord": "N/A",
        "item": "Relevance of training content was"
      },
      {
        "tok": "{{k_p3_pGradingTechniquesWere2_excellent}}",
        "label": "Grading techniques were · Excellent",
        "ord": "Excellent",
        "item": "Grading techniques were"
      },
      {
        "tok": "{{k_p3_pGradingTechniquesWere2_good}}",
        "label": "Grading techniques were · Good",
        "ord": "Good",
        "item": "Grading techniques were"
      },
      {
        "tok": "{{k_p3_pGradingTechniquesWere2_fair}}",
        "label": "Grading techniques were · Fair",
        "ord": "Fair",
        "item": "Grading techniques were"
      },
      {
        "tok": "{{k_p3_pGradingTechniquesWere2_poor}}",
        "label": "Grading techniques were · Poor",
        "ord": "Poor",
        "item": "Grading techniques were"
      },
      {
        "tok": "{{k_p3_pGradingTechniquesWere2_verypoor}}",
        "label": "Grading techniques were · Very poor",
        "ord": "Very poor",
        "item": "Grading techniques were"
      },
      {
        "tok": "{{k_p3_pGradingTechniquesWere2_na}}",
        "label": "Grading techniques were · N/A",
        "ord": "N/A",
        "item": "Grading techniques were"
      },
      {
        "tok": "{{k_p3_pAmountOfDiscussedTopics_excellent}}",
        "label": "Amount of discussed topics was · Excellent",
        "ord": "Excellent",
        "item": "Amount of discussed topics was"
      },
      {
        "tok": "{{k_p3_pAmountOfDiscussedTopics_good}}",
        "label": "Amount of discussed topics was · Good",
        "ord": "Good",
        "item": "Amount of discussed topics was"
      },
      {
        "tok": "{{k_p3_pAmountOfDiscussedTopics_fair}}",
        "label": "Amount of discussed topics was · Fair",
        "ord": "Fair",
        "item": "Amount of discussed topics was"
      },
      {
        "tok": "{{k_p3_pAmountOfDiscussedTopics_poor}}",
        "label": "Amount of discussed topics was · Poor",
        "ord": "Poor",
        "item": "Amount of discussed topics was"
      },
      {
        "tok": "{{k_p3_pAmountOfDiscussedTopics_verypoor}}",
        "label": "Amount of discussed topics was · Very poor",
        "ord": "Very poor",
        "item": "Amount of discussed topics was"
      },
      {
        "tok": "{{k_p3_pAmountOfDiscussedTopics_na}}",
        "label": "Amount of discussed topics was · N/A",
        "ord": "N/A",
        "item": "Amount of discussed topics was"
      },
      {
        "tok": "{{k_ownEffort_excellent}}",
        "label": "Excellent",
        "ord": "Excellent"
      },
      {
        "tok": "{{k_ownEffort_good}}",
        "label": "Good",
        "ord": "Good"
      },
      {
        "tok": "{{k_ownEffort_fair}}",
        "label": "Fair",
        "ord": "Fair"
      },
      {
        "tok": "{{k_ownEffort_poor}}",
        "label": "Poor",
        "ord": "Poor"
      },
      {
        "tok": "{{k_ownEffort_verypoor}}",
        "label": "Very poor",
        "ord": "Very poor"
      }
    ],
    "tables": [],
    "boxesInDocx": 299,
    "approval": [
      {
        "tok": "{{cmmName}}",
        "label": "Received by",
        "labelTh": "ผู้รับแบบประเมิน",
        "sign": false
      },
      {
        "tok": "{{cmmDate}}",
        "label": "Date received",
        "labelTh": "วันที่รับ",
        "sign": false
      },
      {
        "tok": "{{cmmAction}}",
        "label": "Action taken",
        "labelTh": "การดำเนินการ",
        "sign": false
      }
    ],
    "manual": [
      {
        "tok": "{{suggest}}",
        "label": "Additional comments",
        "labelTh": "ข้อเสนอแนะเพิ่มเติม",
        "sign": false
      },
      {
        "tok": "{{sig_stuSign}}",
        "label": "Student signature",
        "labelTh": "ลายเซ็นนักเรียน",
        "sign": true
      }
    ]
  },
  "STR": {
    "abbr": "STR",
    "docx": "D-0507-STR-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "Instructor Name",
        "tok": "{{insName}}"
      },
      {
        "label": "Certificate No.",
        "tok": "{{certNo}}"
      },
      {
        "label": "Instructor Rating(s)",
        "tok": "{{ratings}}"
      },
      {
        "label": "Date",
        "tok": "{{sesDate}}"
      },
      {
        "label": "Duration (hrs)",
        "tok": "{{duration}}"
      },
      {
        "label": "Venue / Location",
        "tok": "{{venue}}"
      },
      {
        "label": "Conducted by (HT / ISM)",
        "tok": "{{conductedBy}}"
      },
      {
        "label": "Aircraft Type (if applicable)",
        "tok": "{{acType}}"
      },
      {
        "label": "Other — specify:",
        "tok": "{{topicOther}}"
      },
      {
        "label": "Assessment Notes",
        "tok": "{{notes}}"
      },
      {
        "label": "Follow-up Action Required",
        "tok": "{{fuAction}}"
      },
      {
        "label": "Due Date for Follow-up",
        "tok": "{{fuDue}}"
      },
      {
        "label": "Responsible Person",
        "tok": "{{fuOwner}}"
      },
      {
        "label": "Follow-up Verified by",
        "tok": "{{fuVerifiedBy}}"
      },
      {
        "label": "Verification Date",
        "tok": "{{fuVerifiedDate}}"
      }
    ],
    "byLine": [
      {
        "label": "Date",
        "und": 38,
        "tok": "{{assessorDate}}"
      },
      {
        "label": "Date",
        "und": 38,
        "tok": "{{insAckDate}}"
      }
    ],
    "boxes": [
      {
        "tok": "{{k_category_FI}}",
        "label": "FI",
        "ord": "FI"
      },
      {
        "tok": "{{k_category_TKI}}",
        "label": "TKI",
        "ord": "TKI"
      },
      {
        "tok": "{{k_category_Both}}",
        "label": "Both",
        "ord": "Both"
      },
      {
        "tok": "{{k_trainType_annual}}",
        "label": "Annual",
        "ord": "Annual"
      },
      {
        "tok": "{{k_trainType_initial}}",
        "label": "Initial",
        "ord": "Initial"
      },
      {
        "tok": "{{k_trainType_triggered}}",
        "label": "Triggered",
        "ord": "Triggered"
      },
      {
        "tok": "{{k_trainType_corrective}}",
        "label": "Corrective",
        "ord": "Corrective"
      },
      {
        "tok": "{{k_topics_sop}}",
        "label": "SOPs — flight operations",
        "ord": "SOPs — flight operations"
      },
      {
        "tok": "{{k_topics_emerg}}",
        "label": "Emergency procedures",
        "ord": "Emergency procedures"
      },
      {
        "tok": "{{k_topics_brief}}",
        "label": "Pre/post-flight briefing",
        "ord": "Pre/post-flight briefing"
      },
      {
        "tok": "{{k_topics_manoeuvre}}",
        "label": "Flight manoeuvres / drills",
        "ord": "Flight manoeuvres / drills"
      },
      {
        "tok": "{{k_topics_checklist}}",
        "label": "Use of checklists",
        "ord": "Use of checklists"
      },
      {
        "tok": "{{k_topics_technique}}",
        "label": "Instructional techniques",
        "ord": "Instructional techniques"
      },
      {
        "tok": "{{k_topics_feedback}}",
        "label": "Student feedback methods",
        "ord": "Student feedback methods"
      },
      {
        "tok": "{{k_topics_classroom}}",
        "label": "Classroom management",
        "ord": "Classroom management"
      },
      {
        "tok": "{{k_topics_pedagogy}}",
        "label": "Teaching methodology",
        "ord": "Teaching methodology"
      },
      {
        "tok": "{{k_topics_assess}}",
        "label": "Student assessment methods",
        "ord": "Student assessment methods"
      },
      {
        "tok": "{{k_topics_compliance}}",
        "label": "Regulatory compliance",
        "ord": "Regulatory compliance"
      },
      {
        "tok": "{{k_topics_hpa}}",
        "label": "High-performance aeroplane (T206H)",
        "ord": "High-performance aeroplane (T206H)"
      },
      {
        "tok": "{{k_topics_avionics}}",
        "label": "Advanced avionics / G1000",
        "ord": "Advanced avionics / G1000"
      },
      {
        "tok": "{{k_topics_docs}}",
        "label": "Documentation / flight logs",
        "ord": "Documentation / flight logs"
      },
      {
        "tok": "{{k_topics_other}}",
        "label": "Other",
        "ord": "Other"
      },
      {
        "tok": "{{k_method_observation}}",
        "label": "Observation",
        "ord": "Observation"
      },
      {
        "tok": "{{k_method_oral}}",
        "label": "Oral",
        "ord": "Oral"
      },
      {
        "tok": "{{k_method_practical}}",
        "label": "Practical",
        "ord": "Practical"
      },
      {
        "tok": "{{k_outcome_standardised}}",
        "label": "Standardised",
        "ord": "Standardised"
      },
      {
        "tok": "{{k_outcome_followup}}",
        "label": "Requires follow-up",
        "ord": "Requires follow-up"
      }
    ],
    "tables": [],
    "boxesInDocx": 27,
    "approval": [
      {
        "tok": "{{insAckName}}",
        "label": "Instructor name",
        "labelTh": "ชื่อครู",
        "sign": false
      },
      {
        "tok": "{{sig_insSign}}",
        "label": "Instructor signature",
        "labelTh": "ลายเซ็นครู",
        "sign": true
      }
    ],
    "manual": [
      {
        "tok": "{{assessorName}}",
        "label": "Assessor name (HT / ISM)",
        "labelTh": "ชื่อผู้ประเมิน (HT / ISM)",
        "sign": false
      },
      {
        "tok": "{{sig_assessorSign}}",
        "label": "Assessor signature",
        "labelTh": "ลายเซ็นผู้ประเมิน",
        "sign": true
      }
    ]
  },
  "VSR": {
    "abbr": "VSR",
    "docx": "D-0507-VSR-001.docx",
    "orderWarn": [],
    "byLabel": [
      {
        "label": "Name (optional):",
        "tok": "{{repName}}"
      },
      {
        "label": "Date of Report:",
        "tok": "{{repDate}}"
      },
      {
        "label": "Position / Role:",
        "tok": "{{repRole}}"
      },
      {
        "label": "Contact (optional):",
        "tok": "{{repContact}}"
      },
      {
        "label": "Date of Event:",
        "tok": "{{evDate}}"
      },
      {
        "label": "Time:",
        "tok": "{{evTime}}"
      },
      {
        "label": "Location:",
        "tok": "{{evPlace}}"
      },
      {
        "label": "Aircraft (if applicable):",
        "tok": "{{evAircraft}}"
      },
      {
        "label": "Describe what happened, what you observed, or what could have happened if uncorrected:",
        "tok": "{{descr}}"
      }
    ],
    "byLine": [],
    "boxes": [
      {
        "tok": "{{k_evType_hazard}}",
        "label": "Safety hazard",
        "ord": "Safety hazard"
      },
      {
        "tok": "{{k_evType_incident}}",
        "label": "Incident",
        "ord": "Incident"
      },
      {
        "tok": "{{k_evType_nearmiss}}",
        "label": "Near-miss",
        "ord": "Near-miss"
      },
      {
        "tok": "{{k_evType_unsafe}}",
        "label": "Unsafe act / condition",
        "ord": "Unsafe act / condition"
      },
      {
        "tok": "{{k_evType_other}}",
        "label": "Other",
        "ord": "Other"
      }
    ],
    "tables": [],
    "boxesInDocx": 5,
    "approval": [
      {
        "tok": "{{smName}}",
        "label": "Received by",
        "labelTh": "ผู้รับรายงาน",
        "sign": false
      },
      {
        "tok": "{{smDate}}",
        "label": "Date received",
        "labelTh": "วันที่รับ",
        "sign": false
      },
      {
        "tok": "{{smLog}}",
        "label": "Log No.",
        "labelTh": "เลขทะเบียนรับ",
        "sign": false
      },
      {
        "tok": "{{smAction}}",
        "label": "Action taken",
        "labelTh": "การดำเนินการ",
        "sign": false
      },
      {
        "tok": "{{sig_smSign}}",
        "label": "Signature",
        "labelTh": "ลายเซ็นผู้รับรายงาน",
        "sign": true
      }
    ],
    "manual": [
      {
        "tok": "{{evOther}}",
        "label": "Other — specify",
        "labelTh": "ระบุประเภทอื่น",
        "sign": false
      },
      {
        "tok": "{{suggest}}",
        "label": "Suggested action (optional)",
        "labelTh": "ข้อเสนอแนะในการแก้ไข (ถ้ามี)",
        "sign": false
      }
    ]
  }
};
