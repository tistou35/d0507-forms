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
    "byCell": [],
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
        "label": "Instructor Signature:",
        "tok": "{{sig_insSign}}"
      }
    ],
    "byLine": [],
    "byCell": [
      {
        "cell": "Aircraft Type:  _______________________",
        "head": "Aircraft Type:",
        "tok": "{{acType}}"
      },
      {
        "cell": "Date:  ___ / ___ / ______",
        "head": "Date:",
        "tok": "{{fltDate}}"
      },
      {
        "cell": "Lesson of Flight:  ___________",
        "head": "Lesson of Flight:",
        "tok": "{{lesson}}"
      },
      {
        "cell": "Instructor Licence No.:  _______________________________",
        "head": "Instructor Licence No.:",
        "tok": "{{insLicence}}"
      },
      {
        "cell": "Aircraft Reg.:  HS-___",
        "head": "Aircraft Reg.:  ",
        "tok": "{{acReg}}"
      }
    ],
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
    "manual": []
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
    "byCell": [],
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
    "byCell": [],
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
    "byCell": [],
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
        "label": "Study From",
        "tok": "{{studyFrom}}"
      },
      {
        "label": "Study To",
        "tok": "{{studyTo}}"
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
      },
      {
        "label": "Learning / Flight Hours",
        "tok": "{{learningHours}}"
      }
    ],
    "byLine": [],
    "byCell": [],
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
      }
    ],
    "boxesPartial": false,
    "tables": [],
    "boxesInDocx": 10,
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
    "byCell": [],
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
    "byCell": [],
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
    "byCell": [],
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
    "byCell": [],
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
    "byCell": [],
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
    "boxesPartial": false,
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
    "byCell": [],
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
    "boxesPartial": false,
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
    "byLine": [],
    "byCell": [],
    "boxes": [
      {
        "tok": "{{k_isMinor}}",
        "label": "Passenger is under 18 — a parent or legal guardian must complete and sign on their behalf",
        "item": "Passenger is under 18 — a parent or legal guardian must complete and sign on their behalf"
      },
      {
        "tok": "{{k_gConsent}}",
        "label": "GUARDIAN CONSENT — I give the consent stated above",
        "item": "GUARDIAN CONSENT — I give the consent stated above",
        "ord": "GUARDIAN CONSENT — I am the parent or legal guardian of the passenger named in Section A."
      }
    ],
    "boxesPartial": false,
    "tables": [],
    "boxesInDocx": 2,
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
    "manual": []
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
    "byCell": [],
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
    "byCell": [],
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
  "STR": {
    "abbr": "STR",
    "docx": "D-0507-STR-001.docx",
    "orderWarn": [],
    "byLabel": [],
    "byLine": [
      {
        "label": "Name (Print)",
        "und": 30,
        "tok": "{{assessorName}}"
      },
      {
        "label": "Date",
        "und": 38,
        "tok": "{{assessorDate}}"
      },
      {
        "label": "Signature",
        "und": 33,
        "tok": "{{sig_assessorSign}}"
      },
      {
        "label": "Date",
        "und": 38,
        "tok": "{{insAckDate}}"
      },
      {
        "label": "Signature",
        "und": 33,
        "tok": "{{sig_insSign}}"
      }
    ],
    "byCell": [],
    "boxes": [],
    "boxesPartial": false,
    "tables": [],
    "boxesInDocx": 0,
    "approval": [
      {
        "tok": "{{insAckName}}",
        "label": "Name",
        "labelTh": "ชื่อ",
        "sign": false
      }
    ],
    "manual": []
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
    "byCell": [],
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
