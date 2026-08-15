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
        "label": "Assessment result"
      },
      {
        "tok": "{{k_decCat_exam}}",
        "label": "Examination failure"
      },
      {
        "tok": "{{k_decCat_enrolment}}",
        "label": "Enrolment decision"
      },
      {
        "tok": "{{k_decCat_disciplinary}}",
        "label": "Disciplinary action"
      },
      {
        "tok": "{{k_decCat_other}}",
        "label": "Other"
      },
      {
        "tok": "{{k_outcome_upheld}}",
        "label": "Appeal upheld"
      },
      {
        "tok": "{{k_outcome_partly}}",
        "label": "Appeal partly upheld"
      },
      {
        "tok": "{{k_outcome_dismissed}}",
        "label": "Appeal dismissed"
      }
    ],
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
        "label": "Initial solo"
      },
      {
        "tok": "{{k_soloType_localxc}}",
        "label": "Solo local / cross-country"
      },
      {
        "tok": "{{k_soloType_night}}",
        "label": "Night solo local / cross-country"
      },
      {
        "tok": "{{k_c1Hours}}",
        "label": "Flight hours & landings (≥ 15 hr training | ≥ 50 take-off and landing)"
      },
      {
        "tok": "{{k_c2Night}}",
        "label": "Night hours & landings (≥ 3 hr night training | ≥ 5 night T/O and landing)"
      },
      {
        "tok": "{{k_k1Systems}}",
        "label": "Aircraft systems & flight controls"
      },
      {
        "tok": "{{k_k2Aero}}",
        "label": "Aerodynamics"
      },
      {
        "tok": "{{k_k3Emerg}}",
        "label": "Emergency procedures"
      },
      {
        "tok": "{{k_k4Law}}",
        "label": "Airspace, air laws & regulations"
      },
      {
        "tok": "{{k_k5Wx}}",
        "label": "Weather — interpretation & decision-making"
      },
      {
        "tok": "{{k_k6Preflight}}",
        "label": "Pre-flight procedures & documentation"
      },
      {
        "tok": "{{k_k7Radio}}",
        "label": "Radio communication procedures"
      },
      {
        "tok": "{{k_n1Vision}}",
        "label": "Night vision & physiology"
      },
      {
        "tok": "{{k_n2Lighting}}",
        "label": "Aircraft lighting systems"
      },
      {
        "tok": "{{k_n3Disorient}}",
        "label": "Spatial disorientation — recognition & recovery"
      },
      {
        "tok": "{{k_n4Nav}}",
        "label": "Night navigation"
      }
    ],
    "boxesInDocx": 16,
    "approval": [],
    "manual": [
      {
        "tok": "{{acReg}}",
        "label": "Aircraft registration",
        "labelTh": "ทะเบียนอากาศยาน",
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
    ]
  },
  "DAF": {
    "abbr": "DAF",
    "docx": "D-0507-DAF-001.docx",
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
        "label": "Breach of SOP / procedure"
      },
      {
        "tok": "{{k_infCat_caat}}",
        "label": "Violation of CAAT regulation"
      },
      {
        "tok": "{{k_infCat_unsafe}}",
        "label": "Unsafe act"
      },
      {
        "tok": "{{k_infCat_misconduct}}",
        "label": "Misconduct"
      },
      {
        "tok": "{{k_infCat_negligence}}",
        "label": "Negligence"
      },
      {
        "tok": "{{k_infCat_insub}}",
        "label": "Insubordination"
      },
      {
        "tok": "{{k_infCat_dishonesty}}",
        "label": "Dishonesty / falsification"
      },
      {
        "tok": "{{k_infCat_other}}",
        "label": "Other"
      },
      {
        "tok": "{{k_actLevel_verbal}}",
        "label": "Verbal warning"
      },
      {
        "tok": "{{k_actLevel_written}}",
        "label": "Written warning"
      },
      {
        "tok": "{{k_actLevel_suspend}}",
        "label": "Suspension"
      },
      {
        "tok": "{{k_actLevel_terminate}}",
        "label": "Termination / expulsion"
      },
      {
        "tok": "{{k_actLevel_training}}",
        "label": "Additional training required"
      },
      {
        "tok": "{{k_actLevel_licence}}",
        "label": "Licence suspension request to CAAT"
      },
      {
        "tok": "{{k_actLevel_other}}",
        "label": "Other"
      }
    ],
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
        "label": "Hard copy"
      },
      {
        "tok": "{{k_copyType_digital}}",
        "label": "Digital"
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
    "manual": [
      {
        "tok": "{{docs_1_title}}",
        "label": "Document list แถว 1 · Document title",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_1_code}}",
        "label": "Document list แถว 1 · Document code",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_1_rev}}",
        "label": "Document list แถว 1 · Issue / Rev.",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_1_eff}}",
        "label": "Document list แถว 1 · Eff. date",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_2_title}}",
        "label": "Document list แถว 2 · Document title",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_2_code}}",
        "label": "Document list แถว 2 · Document code",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_2_rev}}",
        "label": "Document list แถว 2 · Issue / Rev.",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_2_eff}}",
        "label": "Document list แถว 2 · Eff. date",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_3_title}}",
        "label": "Document list แถว 3 · Document title",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_3_code}}",
        "label": "Document list แถว 3 · Document code",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_3_rev}}",
        "label": "Document list แถว 3 · Issue / Rev.",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_3_eff}}",
        "label": "Document list แถว 3 · Eff. date",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_4_title}}",
        "label": "Document list แถว 4 · Document title",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_4_code}}",
        "label": "Document list แถว 4 · Document code",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_4_rev}}",
        "label": "Document list แถว 4 · Issue / Rev.",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_4_eff}}",
        "label": "Document list แถว 4 · Eff. date",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_5_title}}",
        "label": "Document list แถว 5 · Document title",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_5_code}}",
        "label": "Document list แถว 5 · Document code",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_5_rev}}",
        "label": "Document list แถว 5 · Issue / Rev.",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_5_eff}}",
        "label": "Document list แถว 5 · Eff. date",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_6_title}}",
        "label": "Document list แถว 6 · Document title",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_6_code}}",
        "label": "Document list แถว 6 · Document code",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_6_rev}}",
        "label": "Document list แถว 6 · Issue / Rev.",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_6_eff}}",
        "label": "Document list แถว 6 · Eff. date",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_7_title}}",
        "label": "Document list แถว 7 · Document title",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_7_code}}",
        "label": "Document list แถว 7 · Document code",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_7_rev}}",
        "label": "Document list แถว 7 · Issue / Rev.",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_7_eff}}",
        "label": "Document list แถว 7 · Eff. date",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_8_title}}",
        "label": "Document list แถว 8 · Document title",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_8_code}}",
        "label": "Document list แถว 8 · Document code",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_8_rev}}",
        "label": "Document list แถว 8 · Issue / Rev.",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docs_8_eff}}",
        "label": "Document list แถว 8 · Eff. date",
        "labelTh": "",
        "sign": false
      }
    ]
  },
  "DRF": {
    "abbr": "DRF",
    "docx": "D-0507-DRF-001.docx",
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
        "label": "Minor correction"
      },
      {
        "tok": "{{k_changeType_major}}",
        "label": "Major revision"
      },
      {
        "tok": "{{k_changeType_new}}",
        "label": "New section"
      },
      {
        "tok": "{{k_changeType_delete}}",
        "label": "Delete section"
      },
      {
        "tok": "{{k_changeType_regulatory}}",
        "label": "Regulatory update"
      },
      {
        "tok": "{{k_reason_regulatory}}",
        "label": "Regulatory requirement"
      },
      {
        "tok": "{{k_reason_operational}}",
        "label": "Operational need"
      },
      {
        "tok": "{{k_reason_error}}",
        "label": "Error correction"
      },
      {
        "tok": "{{k_reason_practice}}",
        "label": "Best practice update"
      },
      {
        "tok": "{{k_reason_directive}}",
        "label": "CAAT directive"
      }
    ],
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
        "label": "Ground course"
      },
      {
        "tok": "{{k_courseType_flight}}",
        "label": "Flight training"
      },
      {
        "tok": "{{k_examType_afterclass}}",
        "label": "After class"
      },
      {
        "tok": "{{k_examType_stage}}",
        "label": "Stage exam"
      },
      {
        "tok": "{{k_examType_endcourse}}",
        "label": "End-of-course"
      },
      {
        "tok": "{{k_examType_progressive}}",
        "label": "Flight progressive"
      },
      {
        "tok": "{{k_examType_endflight}}",
        "label": "End-of-course flight"
      },
      {
        "tok": "{{k_result_passed}}",
        "label": "Passed"
      },
      {
        "tok": "{{k_result_notpassed}}",
        "label": "Not passed"
      },
      {
        "tok": "{{k_result_repeat}}",
        "label": "Repeat"
      },
      {
        "tok": "{{k_s1_sIntroDiscoveringAviation_S}}",
        "label": "[Intro] Discovering Aviation · Satisfied"
      },
      {
        "tok": "{{k_s1_sIntroDiscoveringAviation_U}}",
        "label": "[Intro] Discovering Aviation · Unsatisfied"
      },
      {
        "tok": "{{k_s1_sPpl01AirplaneSystems_S}}",
        "label": "[PPL 01] Airplane Systems · Satisfied"
      },
      {
        "tok": "{{k_s1_sPpl01AirplaneSystems_U}}",
        "label": "[PPL 01] Airplane Systems · Unsatisfied"
      },
      {
        "tok": "{{k_s1_sPpl02AerodynamicPrinciples_S}}",
        "label": "[PPL 02] Aerodynamic Principles · Satisfied"
      },
      {
        "tok": "{{k_s1_sPpl02AerodynamicPrinciples_U}}",
        "label": "[PPL 02] Aerodynamic Principles · Unsatisfied"
      },
      {
        "tok": "{{k_s1_sPpl03TheFlight_S}}",
        "label": "[PPL 03] The Flight Environment · Satisfied"
      },
      {
        "tok": "{{k_s1_sPpl03TheFlight_U}}",
        "label": "[PPL 03] The Flight Environment · Unsatisfied"
      },
      {
        "tok": "{{k_s1_sPpl04CommunicationAnd_S}}",
        "label": "[PPL 04] Communication and Flight Information · Satisfied"
      },
      {
        "tok": "{{k_s1_sPpl04CommunicationAnd_U}}",
        "label": "[PPL 04] Communication and Flight Information · Unsatisfied"
      },
      {
        "tok": "{{k_s1_sPpl05MeteorologyFor_S}}",
        "label": "[PPL 05] Meteorology for Pilots and Interpreting Weather Data · Satisfied"
      },
      {
        "tok": "{{k_s1_sPpl05MeteorologyFor_U}}",
        "label": "[PPL 05] Meteorology for Pilots and Interpreting Weather Data · Unsatisfied"
      },
      {
        "tok": "{{k_s1_sPpl06AirplanePerformance_S}}",
        "label": "[PPL 06] Airplane Performance & Technical Type · Satisfied"
      },
      {
        "tok": "{{k_s1_sPpl06AirplanePerformance_U}}",
        "label": "[PPL 06] Airplane Performance & Technical Type · Unsatisfied"
      },
      {
        "tok": "{{k_s1_sPpl07Navigation_S}}",
        "label": "[PPL 07] Navigation · Satisfied"
      },
      {
        "tok": "{{k_s1_sPpl07Navigation_U}}",
        "label": "[PPL 07] Navigation · Unsatisfied"
      },
      {
        "tok": "{{k_s1_sPpl08ApplyingHuman_S}}",
        "label": "[PPL 08] Applying Human Factor Principles · Satisfied"
      },
      {
        "tok": "{{k_s1_sPpl08ApplyingHuman_U}}",
        "label": "[PPL 08] Applying Human Factor Principles · Unsatisfied"
      },
      {
        "tok": "{{k_s1_sCpl061FlyingCrosscountry_S}}",
        "label": "[CPL 06.1] Flying Cross-Country · Satisfied"
      },
      {
        "tok": "{{k_s1_sCpl061FlyingCrosscountry_U}}",
        "label": "[CPL 06.1] Flying Cross-Country · Unsatisfied"
      },
      {
        "tok": "{{k_s1_sPpl09AirLaws_S}}",
        "label": "[PPL 09] Air Laws & Rule of the Air · Satisfied"
      },
      {
        "tok": "{{k_s1_sPpl09AirLaws_U}}",
        "label": "[PPL 09] Air Laws & Rule of the Air · Unsatisfied"
      },
      {
        "tok": "{{k_s2_sDft01MathPhysics_S}}",
        "label": "[DFT 01] Math & Physics for Aviation · Satisfied"
      },
      {
        "tok": "{{k_s2_sDft01MathPhysics_U}}",
        "label": "[DFT 01] Math & Physics for Aviation · Unsatisfied"
      },
      {
        "tok": "{{k_s2_sDft02C172System_S}}",
        "label": "[DFT 02] C-172 System · Satisfied"
      },
      {
        "tok": "{{k_s2_sDft02C172System_U}}",
        "label": "[DFT 02] C-172 System · Unsatisfied"
      },
      {
        "tok": "{{k_s2_sDft03NormalEmergency_S}}",
        "label": "[DFT 03] Normal & Emergency Procedure · Satisfied"
      },
      {
        "tok": "{{k_s2_sDft03NormalEmergency_U}}",
        "label": "[DFT 03] Normal & Emergency Procedure · Unsatisfied"
      },
      {
        "tok": "{{k_s2_sDft04FundamentalOf_S}}",
        "label": "[DFT 04] Fundamental of Psychology · Satisfied"
      },
      {
        "tok": "{{k_s2_sDft04FundamentalOf_U}}",
        "label": "[DFT 04] Fundamental of Psychology · Unsatisfied"
      },
      {
        "tok": "{{k_s3_sCpl01AdvanceSystems_S}}",
        "label": "[CPL 01] Advance Systems 2 · Satisfied"
      },
      {
        "tok": "{{k_s3_sCpl01AdvanceSystems_U}}",
        "label": "[CPL 01] Advance Systems 2 · Unsatisfied"
      },
      {
        "tok": "{{k_s3_sCpl02Aerodynamic2_S}}",
        "label": "[CPL 02] Aerodynamic 2 · Satisfied"
      },
      {
        "tok": "{{k_s3_sCpl02Aerodynamic2_U}}",
        "label": "[CPL 02] Aerodynamic 2 · Unsatisfied"
      },
      {
        "tok": "{{k_s3_sCpl031CommercialFlight_S}}",
        "label": "[CPL 03.1] Commercial Flight Consideration · Satisfied"
      },
      {
        "tok": "{{k_s3_sCpl031CommercialFlight_U}}",
        "label": "[CPL 03.1] Commercial Flight Consideration · Unsatisfied"
      },
      {
        "tok": "{{k_s3_sCpl032CommercialManeuver_S}}",
        "label": "[CPL 03.2] Commercial Maneuver · Satisfied"
      },
      {
        "tok": "{{k_s3_sCpl032CommercialManeuver_U}}",
        "label": "[CPL 03.2] Commercial Maneuver · Unsatisfied"
      },
      {
        "tok": "{{k_s3_sCpl04AirplanePerformance_S}}",
        "label": "[CPL 04] Airplane Performance 2 · Satisfied"
      },
      {
        "tok": "{{k_s3_sCpl04AirplanePerformance_U}}",
        "label": "[CPL 04] Airplane Performance 2 · Unsatisfied"
      },
      {
        "tok": "{{k_s3_sCpl05Navigation2_S}}",
        "label": "[CPL 05] Navigation 2 · Satisfied"
      },
      {
        "tok": "{{k_s3_sCpl05Navigation2_U}}",
        "label": "[CPL 05] Navigation 2 · Unsatisfied"
      },
      {
        "tok": "{{k_s3_sCpl062FlyingCross_S}}",
        "label": "[CPL 06.2] Flying Cross Country · Satisfied"
      },
      {
        "tok": "{{k_s3_sCpl062FlyingCross_U}}",
        "label": "[CPL 06.2] Flying Cross Country · Unsatisfied"
      },
      {
        "tok": "{{k_s4_sIr01PrinciplesOf_S}}",
        "label": "[IR 01] Principles of Instrument Flight · Satisfied"
      },
      {
        "tok": "{{k_s4_sIr01PrinciplesOf_U}}",
        "label": "[IR 01] Principles of Instrument Flight · Unsatisfied"
      },
      {
        "tok": "{{k_s4_sIr02IfrFlight_S}}",
        "label": "[IR 02] IFR Flight Environment · Satisfied"
      },
      {
        "tok": "{{k_s4_sIr02IfrFlight_U}}",
        "label": "[IR 02] IFR Flight Environment · Unsatisfied"
      },
      {
        "tok": "{{k_s4_sIr03Departure_S}}",
        "label": "[IR 03] Departure · Satisfied"
      },
      {
        "tok": "{{k_s4_sIr03Departure_U}}",
        "label": "[IR 03] Departure · Unsatisfied"
      },
      {
        "tok": "{{k_s4_sIr04Enroute_S}}",
        "label": "[IR 04] Enroute · Satisfied"
      },
      {
        "tok": "{{k_s4_sIr04Enroute_U}}",
        "label": "[IR 04] Enroute · Unsatisfied"
      },
      {
        "tok": "{{k_s4_sIr05Arrival_S}}",
        "label": "[IR 05] Arrival · Satisfied"
      },
      {
        "tok": "{{k_s4_sIr05Arrival_U}}",
        "label": "[IR 05] Arrival · Unsatisfied"
      },
      {
        "tok": "{{k_s4_sIr061Approach_S}}",
        "label": "[IR 06.1] Approach · Satisfied"
      },
      {
        "tok": "{{k_s4_sIr061Approach_U}}",
        "label": "[IR 06.1] Approach · Unsatisfied"
      },
      {
        "tok": "{{k_s4_sIr062InstrumentApproaches_S}}",
        "label": "[IR 06.2] Instrument Approaches · Satisfied"
      },
      {
        "tok": "{{k_s4_sIr062InstrumentApproaches_U}}",
        "label": "[IR 06.2] Instrument Approaches · Unsatisfied"
      },
      {
        "tok": "{{k_s4_sIr07Meteorology_S}}",
        "label": "[IR 07] Meteorology · Satisfied"
      },
      {
        "tok": "{{k_s4_sIr07Meteorology_U}}",
        "label": "[IR 07] Meteorology · Unsatisfied"
      },
      {
        "tok": "{{k_s4_sIr08IfrFlight_S}}",
        "label": "[IR 08] IFR Flight Considerations · Satisfied"
      },
      {
        "tok": "{{k_s4_sIr08IfrFlight_U}}",
        "label": "[IR 08] IFR Flight Considerations · Unsatisfied"
      },
      {
        "tok": "{{k_s4_sIr09FlightRule_S}}",
        "label": "[IR 09] Flight Rule · Satisfied"
      },
      {
        "tok": "{{k_s4_sIr09FlightRule_U}}",
        "label": "[IR 09] Flight Rule · Unsatisfied"
      },
      {
        "tok": "{{k_s5_sIp01FoundationOf_S}}",
        "label": "[IP 01] Foundation of Learning · Satisfied"
      },
      {
        "tok": "{{k_s5_sIp01FoundationOf_U}}",
        "label": "[IP 01] Foundation of Learning · Unsatisfied"
      },
      {
        "tok": "{{k_s5_sIp02TheArt_S}}",
        "label": "[IP 02] The Art and Science of Teaching · Satisfied"
      },
      {
        "tok": "{{k_s5_sIp02TheArt_U}}",
        "label": "[IP 02] The Art and Science of Teaching · Unsatisfied"
      },
      {
        "tok": "{{k_s5_sIp03ExploringHuman_S}}",
        "label": "[IP 03] Exploring Human Factor · Satisfied"
      },
      {
        "tok": "{{k_s5_sIp03ExploringHuman_U}}",
        "label": "[IP 03] Exploring Human Factor · Unsatisfied"
      },
      {
        "tok": "{{k_s5_sIp04BecomingAn_S}}",
        "label": "[IP 04] Becoming an Instructor · Satisfied"
      },
      {
        "tok": "{{k_s5_sIp04BecomingAn_U}}",
        "label": "[IP 04] Becoming an Instructor · Unsatisfied"
      },
      {
        "tok": "{{k_s5_sIp05TheBasic_S}}",
        "label": "[IP 05] The Basic Instructor · Satisfied"
      },
      {
        "tok": "{{k_s5_sIp05TheBasic_U}}",
        "label": "[IP 05] The Basic Instructor · Unsatisfied"
      },
      {
        "tok": "{{k_s5_sIp06TheAdvanced_S}}",
        "label": "[IP 06] The Advanced Instructor · Satisfied"
      },
      {
        "tok": "{{k_s5_sIp06TheAdvanced_U}}",
        "label": "[IP 06] The Advanced Instructor · Unsatisfied"
      },
      {
        "tok": "{{k_s6_sRecurrentA_S}}",
        "label": "Recurrent A · Satisfied"
      },
      {
        "tok": "{{k_s6_sRecurrentA_U}}",
        "label": "Recurrent A · Unsatisfied"
      },
      {
        "tok": "{{k_s6_sRecurrentE_S}}",
        "label": "Recurrent E · Satisfied"
      },
      {
        "tok": "{{k_s6_sRecurrentE_U}}",
        "label": "Recurrent E · Unsatisfied"
      },
      {
        "tok": "{{k_s6_sRecurrentIr_S}}",
        "label": "Recurrent IR · Satisfied"
      },
      {
        "tok": "{{k_s6_sRecurrentIr_U}}",
        "label": "Recurrent IR · Unsatisfied"
      },
      {
        "tok": "{{k_s6_sRecurrentNight_S}}",
        "label": "Recurrent Night · Satisfied"
      },
      {
        "tok": "{{k_s6_sRecurrentNight_U}}",
        "label": "Recurrent Night · Unsatisfied"
      }
    ],
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
        "label": "Ground"
      },
      {
        "tok": "{{k_trainType_flight}}",
        "label": "Flight"
      },
      {
        "tok": "{{k_trainType_simulator}}",
        "label": "Simulator"
      },
      {
        "tok": "{{k_trainType_recurrent}}",
        "label": "Recurrent"
      },
      {
        "tok": "{{k_trainType_progressive}}",
        "label": "Progressive / standard check"
      },
      {
        "tok": "{{k_teach_tTheContentInThe_excellent}}",
        "label": "The content in the lesson was · Excellent"
      },
      {
        "tok": "{{k_teach_tTheContentInThe_verygood}}",
        "label": "The content in the lesson was · Very good"
      },
      {
        "tok": "{{k_teach_tTheContentInThe_good}}",
        "label": "The content in the lesson was · Good"
      },
      {
        "tok": "{{k_teach_tTheContentInThe_fair}}",
        "label": "The content in the lesson was · Fair"
      },
      {
        "tok": "{{k_teach_tTheContentInThe_poor}}",
        "label": "The content in the lesson was · Poor"
      },
      {
        "tok": "{{k_teach_tTheContentInThe_na}}",
        "label": "The content in the lesson was · N/A"
      },
      {
        "tok": "{{k_teach_tTheInstructorsContributionTo_excellent}}",
        "label": "The instructor's contribution to the training/course was · Excellent"
      },
      {
        "tok": "{{k_teach_tTheInstructorsContributionTo_verygood}}",
        "label": "The instructor's contribution to the training/course was · Very good"
      },
      {
        "tok": "{{k_teach_tTheInstructorsContributionTo_good}}",
        "label": "The instructor's contribution to the training/course was · Good"
      },
      {
        "tok": "{{k_teach_tTheInstructorsContributionTo_fair}}",
        "label": "The instructor's contribution to the training/course was · Fair"
      },
      {
        "tok": "{{k_teach_tTheInstructorsContributionTo_poor}}",
        "label": "The instructor's contribution to the training/course was · Poor"
      },
      {
        "tok": "{{k_teach_tTheInstructorsContributionTo_na}}",
        "label": "The instructor's contribution to the training/course was · N/A"
      },
      {
        "tok": "{{k_teach_tTheInstructorsEffectivenessIn_excellent}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Excellent"
      },
      {
        "tok": "{{k_teach_tTheInstructorsEffectivenessIn_verygood}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Very good"
      },
      {
        "tok": "{{k_teach_tTheInstructorsEffectivenessIn_good}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Good"
      },
      {
        "tok": "{{k_teach_tTheInstructorsEffectivenessIn_fair}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Fair"
      },
      {
        "tok": "{{k_teach_tTheInstructorsEffectivenessIn_poor}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Poor"
      },
      {
        "tok": "{{k_teach_tTheInstructorsEffectivenessIn_na}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · N/A"
      },
      {
        "tok": "{{k_teach_tClarityOfInstructorsVoice_excellent}}",
        "label": "Clarity of instructor's voice was · Excellent"
      },
      {
        "tok": "{{k_teach_tClarityOfInstructorsVoice_verygood}}",
        "label": "Clarity of instructor's voice was · Very good"
      },
      {
        "tok": "{{k_teach_tClarityOfInstructorsVoice_good}}",
        "label": "Clarity of instructor's voice was · Good"
      },
      {
        "tok": "{{k_teach_tClarityOfInstructorsVoice_fair}}",
        "label": "Clarity of instructor's voice was · Fair"
      },
      {
        "tok": "{{k_teach_tClarityOfInstructorsVoice_poor}}",
        "label": "Clarity of instructor's voice was · Poor"
      },
      {
        "tok": "{{k_teach_tClarityOfInstructorsVoice_na}}",
        "label": "Clarity of instructor's voice was · N/A"
      },
      {
        "tok": "{{k_teach_tExplanationsByInstructorWere_excellent}}",
        "label": "Explanations by instructor were · Excellent"
      },
      {
        "tok": "{{k_teach_tExplanationsByInstructorWere_verygood}}",
        "label": "Explanations by instructor were · Very good"
      },
      {
        "tok": "{{k_teach_tExplanationsByInstructorWere_good}}",
        "label": "Explanations by instructor were · Good"
      },
      {
        "tok": "{{k_teach_tExplanationsByInstructorWere_fair}}",
        "label": "Explanations by instructor were · Fair"
      },
      {
        "tok": "{{k_teach_tExplanationsByInstructorWere_poor}}",
        "label": "Explanations by instructor were · Poor"
      },
      {
        "tok": "{{k_teach_tExplanationsByInstructorWere_na}}",
        "label": "Explanations by instructor were · N/A"
      },
      {
        "tok": "{{k_teach_tInstructorsUseOfExamples_excellent}}",
        "label": "Instructor's use of examples and illustrations was · Excellent"
      },
      {
        "tok": "{{k_teach_tInstructorsUseOfExamples_verygood}}",
        "label": "Instructor's use of examples and illustrations was · Very good"
      },
      {
        "tok": "{{k_teach_tInstructorsUseOfExamples_good}}",
        "label": "Instructor's use of examples and illustrations was · Good"
      },
      {
        "tok": "{{k_teach_tInstructorsUseOfExamples_fair}}",
        "label": "Instructor's use of examples and illustrations was · Fair"
      },
      {
        "tok": "{{k_teach_tInstructorsUseOfExamples_poor}}",
        "label": "Instructor's use of examples and illustrations was · Poor"
      },
      {
        "tok": "{{k_teach_tInstructorsUseOfExamples_na}}",
        "label": "Instructor's use of examples and illustrations was · N/A"
      },
      {
        "tok": "{{k_teach_tQualityOfQuestionsOr_excellent}}",
        "label": "Quality of questions or problems raised by the instructor was · Excellent"
      },
      {
        "tok": "{{k_teach_tQualityOfQuestionsOr_verygood}}",
        "label": "Quality of questions or problems raised by the instructor was · Very good"
      },
      {
        "tok": "{{k_teach_tQualityOfQuestionsOr_good}}",
        "label": "Quality of questions or problems raised by the instructor was · Good"
      },
      {
        "tok": "{{k_teach_tQualityOfQuestionsOr_fair}}",
        "label": "Quality of questions or problems raised by the instructor was · Fair"
      },
      {
        "tok": "{{k_teach_tQualityOfQuestionsOr_poor}}",
        "label": "Quality of questions or problems raised by the instructor was · Poor"
      },
      {
        "tok": "{{k_teach_tQualityOfQuestionsOr_na}}",
        "label": "Quality of questions or problems raised by the instructor was · N/A"
      },
      {
        "tok": "{{k_teach_tStudentsConfidenceInInstructors_excellent}}",
        "label": "Student's confidence in instructor's knowledge was · Excellent"
      },
      {
        "tok": "{{k_teach_tStudentsConfidenceInInstructors_verygood}}",
        "label": "Student's confidence in instructor's knowledge was · Very good"
      },
      {
        "tok": "{{k_teach_tStudentsConfidenceInInstructors_good}}",
        "label": "Student's confidence in instructor's knowledge was · Good"
      },
      {
        "tok": "{{k_teach_tStudentsConfidenceInInstructors_fair}}",
        "label": "Student's confidence in instructor's knowledge was · Fair"
      },
      {
        "tok": "{{k_teach_tStudentsConfidenceInInstructors_poor}}",
        "label": "Student's confidence in instructor's knowledge was · Poor"
      },
      {
        "tok": "{{k_teach_tStudentsConfidenceInInstructors_na}}",
        "label": "Student's confidence in instructor's knowledge was · N/A"
      },
      {
        "tok": "{{k_teach_tInstructorsEnthusiasmWas_excellent}}",
        "label": "Instructor's enthusiasm was · Excellent"
      },
      {
        "tok": "{{k_teach_tInstructorsEnthusiasmWas_verygood}}",
        "label": "Instructor's enthusiasm was · Very good"
      },
      {
        "tok": "{{k_teach_tInstructorsEnthusiasmWas_good}}",
        "label": "Instructor's enthusiasm was · Good"
      },
      {
        "tok": "{{k_teach_tInstructorsEnthusiasmWas_fair}}",
        "label": "Instructor's enthusiasm was · Fair"
      },
      {
        "tok": "{{k_teach_tInstructorsEnthusiasmWas_poor}}",
        "label": "Instructor's enthusiasm was · Poor"
      },
      {
        "tok": "{{k_teach_tInstructorsEnthusiasmWas_na}}",
        "label": "Instructor's enthusiasm was · N/A"
      },
      {
        "tok": "{{k_teach_tEncouragementGivenToStudents_excellent}}",
        "label": "Encouragement given to students to express themselves was · Excellent"
      },
      {
        "tok": "{{k_teach_tEncouragementGivenToStudents_verygood}}",
        "label": "Encouragement given to students to express themselves was · Very good"
      },
      {
        "tok": "{{k_teach_tEncouragementGivenToStudents_good}}",
        "label": "Encouragement given to students to express themselves was · Good"
      },
      {
        "tok": "{{k_teach_tEncouragementGivenToStudents_fair}}",
        "label": "Encouragement given to students to express themselves was · Fair"
      },
      {
        "tok": "{{k_teach_tEncouragementGivenToStudents_poor}}",
        "label": "Encouragement given to students to express themselves was · Poor"
      },
      {
        "tok": "{{k_teach_tEncouragementGivenToStudents_na}}",
        "label": "Encouragement given to students to express themselves was · N/A"
      },
      {
        "tok": "{{k_teach_tAnswersToStudentQuestions_excellent}}",
        "label": "Answers to student questions were · Excellent"
      },
      {
        "tok": "{{k_teach_tAnswersToStudentQuestions_verygood}}",
        "label": "Answers to student questions were · Very good"
      },
      {
        "tok": "{{k_teach_tAnswersToStudentQuestions_good}}",
        "label": "Answers to student questions were · Good"
      },
      {
        "tok": "{{k_teach_tAnswersToStudentQuestions_fair}}",
        "label": "Answers to student questions were · Fair"
      },
      {
        "tok": "{{k_teach_tAnswersToStudentQuestions_poor}}",
        "label": "Answers to student questions were · Poor"
      },
      {
        "tok": "{{k_teach_tAnswersToStudentQuestions_na}}",
        "label": "Answers to student questions were · N/A"
      },
      {
        "tok": "{{k_teach_tAvailabilityOfExtraHelp_excellent}}",
        "label": "Availability of extra help when needed was · Excellent"
      },
      {
        "tok": "{{k_teach_tAvailabilityOfExtraHelp_verygood}}",
        "label": "Availability of extra help when needed was · Very good"
      },
      {
        "tok": "{{k_teach_tAvailabilityOfExtraHelp_good}}",
        "label": "Availability of extra help when needed was · Good"
      },
      {
        "tok": "{{k_teach_tAvailabilityOfExtraHelp_fair}}",
        "label": "Availability of extra help when needed was · Fair"
      },
      {
        "tok": "{{k_teach_tAvailabilityOfExtraHelp_poor}}",
        "label": "Availability of extra help when needed was · Poor"
      },
      {
        "tok": "{{k_teach_tAvailabilityOfExtraHelp_na}}",
        "label": "Availability of extra help when needed was · N/A"
      },
      {
        "tok": "{{k_teach_tUseOfClassTime_excellent}}",
        "label": "Use of class time was · Excellent"
      },
      {
        "tok": "{{k_teach_tUseOfClassTime_verygood}}",
        "label": "Use of class time was · Very good"
      },
      {
        "tok": "{{k_teach_tUseOfClassTime_good}}",
        "label": "Use of class time was · Good"
      },
      {
        "tok": "{{k_teach_tUseOfClassTime_fair}}",
        "label": "Use of class time was · Fair"
      },
      {
        "tok": "{{k_teach_tUseOfClassTime_poor}}",
        "label": "Use of class time was · Poor"
      },
      {
        "tok": "{{k_teach_tUseOfClassTime_na}}",
        "label": "Use of class time was · N/A"
      },
      {
        "tok": "{{k_teach_tInstructorsInterestInStudents_excellent}}",
        "label": "Instructor's interest in student's progress was · Excellent"
      },
      {
        "tok": "{{k_teach_tInstructorsInterestInStudents_verygood}}",
        "label": "Instructor's interest in student's progress was · Very good"
      },
      {
        "tok": "{{k_teach_tInstructorsInterestInStudents_good}}",
        "label": "Instructor's interest in student's progress was · Good"
      },
      {
        "tok": "{{k_teach_tInstructorsInterestInStudents_fair}}",
        "label": "Instructor's interest in student's progress was · Fair"
      },
      {
        "tok": "{{k_teach_tInstructorsInterestInStudents_poor}}",
        "label": "Instructor's interest in student's progress was · Poor"
      },
      {
        "tok": "{{k_teach_tInstructorsInterestInStudents_na}}",
        "label": "Instructor's interest in student's progress was · N/A"
      },
      {
        "tok": "{{k_teach_tAmountYouLearnedWas_excellent}}",
        "label": "Amount you learned was · Excellent"
      },
      {
        "tok": "{{k_teach_tAmountYouLearnedWas_verygood}}",
        "label": "Amount you learned was · Very good"
      },
      {
        "tok": "{{k_teach_tAmountYouLearnedWas_good}}",
        "label": "Amount you learned was · Good"
      },
      {
        "tok": "{{k_teach_tAmountYouLearnedWas_fair}}",
        "label": "Amount you learned was · Fair"
      },
      {
        "tok": "{{k_teach_tAmountYouLearnedWas_poor}}",
        "label": "Amount you learned was · Poor"
      },
      {
        "tok": "{{k_teach_tAmountYouLearnedWas_na}}",
        "label": "Amount you learned was · N/A"
      },
      {
        "tok": "{{k_teach_tRelevanceOfCoursetrainingContent_excellent}}",
        "label": "Relevance of course/training content was · Excellent"
      },
      {
        "tok": "{{k_teach_tRelevanceOfCoursetrainingContent_verygood}}",
        "label": "Relevance of course/training content was · Very good"
      },
      {
        "tok": "{{k_teach_tRelevanceOfCoursetrainingContent_good}}",
        "label": "Relevance of course/training content was · Good"
      },
      {
        "tok": "{{k_teach_tRelevanceOfCoursetrainingContent_fair}}",
        "label": "Relevance of course/training content was · Fair"
      },
      {
        "tok": "{{k_teach_tRelevanceOfCoursetrainingContent_poor}}",
        "label": "Relevance of course/training content was · Poor"
      },
      {
        "tok": "{{k_teach_tRelevanceOfCoursetrainingContent_na}}",
        "label": "Relevance of course/training content was · N/A"
      },
      {
        "tok": "{{k_teach_tGradingTechniquesWere_excellent}}",
        "label": "Grading techniques were · Excellent"
      },
      {
        "tok": "{{k_teach_tGradingTechniquesWere_verygood}}",
        "label": "Grading techniques were · Very good"
      },
      {
        "tok": "{{k_teach_tGradingTechniquesWere_good}}",
        "label": "Grading techniques were · Good"
      },
      {
        "tok": "{{k_teach_tGradingTechniquesWere_fair}}",
        "label": "Grading techniques were · Fair"
      },
      {
        "tok": "{{k_teach_tGradingTechniquesWere_poor}}",
        "label": "Grading techniques were · Poor"
      },
      {
        "tok": "{{k_teach_tGradingTechniquesWere_na}}",
        "label": "Grading techniques were · N/A"
      },
      {
        "tok": "{{k_teach_tReasonablenessOfAssignedWork_excellent}}",
        "label": "Reasonableness of assigned work was · Excellent"
      },
      {
        "tok": "{{k_teach_tReasonablenessOfAssignedWork_verygood}}",
        "label": "Reasonableness of assigned work was · Very good"
      },
      {
        "tok": "{{k_teach_tReasonablenessOfAssignedWork_good}}",
        "label": "Reasonableness of assigned work was · Good"
      },
      {
        "tok": "{{k_teach_tReasonablenessOfAssignedWork_fair}}",
        "label": "Reasonableness of assigned work was · Fair"
      },
      {
        "tok": "{{k_teach_tReasonablenessOfAssignedWork_poor}}",
        "label": "Reasonableness of assigned work was · Poor"
      },
      {
        "tok": "{{k_teach_tReasonablenessOfAssignedWork_na}}",
        "label": "Reasonableness of assigned work was · N/A"
      },
      {
        "tok": "{{k_teach_tClarityOfStudentRequirements_excellent}}",
        "label": "Clarity of student requirements was · Excellent"
      },
      {
        "tok": "{{k_teach_tClarityOfStudentRequirements_verygood}}",
        "label": "Clarity of student requirements was · Very good"
      },
      {
        "tok": "{{k_teach_tClarityOfStudentRequirements_good}}",
        "label": "Clarity of student requirements was · Good"
      },
      {
        "tok": "{{k_teach_tClarityOfStudentRequirements_fair}}",
        "label": "Clarity of student requirements was · Fair"
      },
      {
        "tok": "{{k_teach_tClarityOfStudentRequirements_poor}}",
        "label": "Clarity of student requirements was · Poor"
      },
      {
        "tok": "{{k_teach_tClarityOfStudentRequirements_na}}",
        "label": "Clarity of student requirements was · N/A"
      },
      {
        "tok": "{{k_f1_fRouteSelection_S}}",
        "label": "Route Selection · Satisfied"
      },
      {
        "tok": "{{k_f1_fRouteSelection_U}}",
        "label": "Route Selection · Not satisfied"
      },
      {
        "tok": "{{k_f1_fRouteSelection_NA}}",
        "label": "Route Selection · Exempt"
      },
      {
        "tok": "{{k_f1_fFuelPlanning_S}}",
        "label": "Fuel Planning · Satisfied"
      },
      {
        "tok": "{{k_f1_fFuelPlanning_U}}",
        "label": "Fuel Planning · Not satisfied"
      },
      {
        "tok": "{{k_f1_fFuelPlanning_NA}}",
        "label": "Fuel Planning · Exempt"
      },
      {
        "tok": "{{k_f1_fComplianceWithRegulations_S}}",
        "label": "Compliance with Regulations · Satisfied"
      },
      {
        "tok": "{{k_f1_fComplianceWithRegulations_U}}",
        "label": "Compliance with Regulations · Not satisfied"
      },
      {
        "tok": "{{k_f1_fComplianceWithRegulations_NA}}",
        "label": "Compliance with Regulations · Exempt"
      },
      {
        "tok": "{{k_f1_fMassAndBalance_S}}",
        "label": "Mass and Balance · Satisfied"
      },
      {
        "tok": "{{k_f1_fMassAndBalance_U}}",
        "label": "Mass and Balance · Not satisfied"
      },
      {
        "tok": "{{k_f1_fMassAndBalance_NA}}",
        "label": "Mass and Balance · Exempt"
      },
      {
        "tok": "{{k_f1_fMapVfrNavigationLog_S}}",
        "label": "Map, VFR Navigation Log, Dead Reckoning · Satisfied"
      },
      {
        "tok": "{{k_f1_fMapVfrNavigationLog_U}}",
        "label": "Map, VFR Navigation Log, Dead Reckoning · Not satisfied"
      },
      {
        "tok": "{{k_f1_fMapVfrNavigationLog_NA}}",
        "label": "Map, VFR Navigation Log, Dead Reckoning · Exempt"
      },
      {
        "tok": "{{k_f1_fPreflightInspectionAndServicing_S}}",
        "label": "Preflight Inspection and Servicing · Satisfied"
      },
      {
        "tok": "{{k_f1_fPreflightInspectionAndServicing_U}}",
        "label": "Preflight Inspection and Servicing · Not satisfied"
      },
      {
        "tok": "{{k_f1_fPreflightInspectionAndServicing_NA}}",
        "label": "Preflight Inspection and Servicing · Exempt"
      },
      {
        "tok": "{{k_f1_fCockpitManagement_S}}",
        "label": "Cockpit Management · Satisfied"
      },
      {
        "tok": "{{k_f1_fCockpitManagement_U}}",
        "label": "Cockpit Management · Not satisfied"
      },
      {
        "tok": "{{k_f1_fCockpitManagement_NA}}",
        "label": "Cockpit Management · Exempt"
      },
      {
        "tok": "{{k_f2_fKnowledgeOfAtcProcedures_S}}",
        "label": "Knowledge of ATC Procedures · Satisfied"
      },
      {
        "tok": "{{k_f2_fKnowledgeOfAtcProcedures_U}}",
        "label": "Knowledge of ATC Procedures · Not satisfied"
      },
      {
        "tok": "{{k_f2_fKnowledgeOfAtcProcedures_NA}}",
        "label": "Knowledge of ATC Procedures · Exempt"
      },
      {
        "tok": "{{k_f2_fAbilityToCommunicateAtc_S}}",
        "label": "Ability to Communicate ATC Procedures · Satisfied"
      },
      {
        "tok": "{{k_f2_fAbilityToCommunicateAtc_U}}",
        "label": "Ability to Communicate ATC Procedures · Not satisfied"
      },
      {
        "tok": "{{k_f2_fAbilityToCommunicateAtc_NA}}",
        "label": "Ability to Communicate ATC Procedures · Exempt"
      },
      {
        "tok": "{{k_f3_fExplanationOfRouteProcedures_S}}",
        "label": "Explanation of Route Procedures · Satisfied"
      },
      {
        "tok": "{{k_f3_fExplanationOfRouteProcedures_U}}",
        "label": "Explanation of Route Procedures · Not satisfied"
      },
      {
        "tok": "{{k_f3_fExplanationOfRouteProcedures_NA}}",
        "label": "Explanation of Route Procedures · Exempt"
      },
      {
        "tok": "{{k_f3_fProperUseOfRoute_S}}",
        "label": "Proper Use of Route Procedures · Satisfied"
      },
      {
        "tok": "{{k_f3_fProperUseOfRoute_U}}",
        "label": "Proper Use of Route Procedures · Not satisfied"
      },
      {
        "tok": "{{k_f3_fProperUseOfRoute_NA}}",
        "label": "Proper Use of Route Procedures · Exempt"
      },
      {
        "tok": "{{k_f4_fCommunicationWithAtc_S}}",
        "label": "Communication with ATC · Satisfied"
      },
      {
        "tok": "{{k_f4_fCommunicationWithAtc_U}}",
        "label": "Communication with ATC · Not satisfied"
      },
      {
        "tok": "{{k_f4_fCommunicationWithAtc_NA}}",
        "label": "Communication with ATC · Exempt"
      },
      {
        "tok": "{{k_f4_fCommunicationWithOtherAircraft_S}}",
        "label": "Communication with Other Aircraft · Satisfied"
      },
      {
        "tok": "{{k_f4_fCommunicationWithOtherAircraft_U}}",
        "label": "Communication with Other Aircraft · Not satisfied"
      },
      {
        "tok": "{{k_f4_fCommunicationWithOtherAircraft_NA}}",
        "label": "Communication with Other Aircraft · Exempt"
      },
      {
        "tok": "{{k_f5_fInterpretationOfWeatherReports_S}}",
        "label": "Interpretation of Weather Reports · Satisfied"
      },
      {
        "tok": "{{k_f5_fInterpretationOfWeatherReports_U}}",
        "label": "Interpretation of Weather Reports · Not satisfied"
      },
      {
        "tok": "{{k_f5_fInterpretationOfWeatherReports_NA}}",
        "label": "Interpretation of Weather Reports · Exempt"
      },
      {
        "tok": "{{k_f5_fInterpretationOfWeatherForecasts_S}}",
        "label": "Interpretation of Weather Forecasts · Satisfied"
      },
      {
        "tok": "{{k_f5_fInterpretationOfWeatherForecasts_U}}",
        "label": "Interpretation of Weather Forecasts · Not satisfied"
      },
      {
        "tok": "{{k_f5_fInterpretationOfWeatherForecasts_NA}}",
        "label": "Interpretation of Weather Forecasts · Exempt"
      },
      {
        "tok": "{{k_f6_fAbilityToAnswerTechnical_S}}",
        "label": "Ability to Answer Technical Questions · Satisfied"
      },
      {
        "tok": "{{k_f6_fAbilityToAnswerTechnical_U}}",
        "label": "Ability to Answer Technical Questions · Not satisfied"
      },
      {
        "tok": "{{k_f6_fAbilityToAnswerTechnical_NA}}",
        "label": "Ability to Answer Technical Questions · Exempt"
      },
      {
        "tok": "{{k_f6_fRelevanceOfTechnicalKnowledge_S}}",
        "label": "Relevance of Technical Knowledge · Satisfied"
      },
      {
        "tok": "{{k_f6_fRelevanceOfTechnicalKnowledge_U}}",
        "label": "Relevance of Technical Knowledge · Not satisfied"
      },
      {
        "tok": "{{k_f6_fRelevanceOfTechnicalKnowledge_NA}}",
        "label": "Relevance of Technical Knowledge · Exempt"
      },
      {
        "tok": "{{k_f7_fAdherenceToCompanyPolicies_S}}",
        "label": "Adherence to Company Policies · Satisfied"
      },
      {
        "tok": "{{k_f7_fAdherenceToCompanyPolicies_U}}",
        "label": "Adherence to Company Policies · Not satisfied"
      },
      {
        "tok": "{{k_f7_fAdherenceToCompanyPolicies_NA}}",
        "label": "Adherence to Company Policies · Exempt"
      },
      {
        "tok": "{{k_f7_fKnowledgeOfCompanyRegulations_S}}",
        "label": "Knowledge of Company Regulations · Satisfied"
      },
      {
        "tok": "{{k_f7_fKnowledgeOfCompanyRegulations_U}}",
        "label": "Knowledge of Company Regulations · Not satisfied"
      },
      {
        "tok": "{{k_f7_fKnowledgeOfCompanyRegulations_NA}}",
        "label": "Knowledge of Company Regulations · Exempt"
      },
      {
        "tok": "{{k_f8_fKnowledgeOfEmergencyEquipment_S}}",
        "label": "Knowledge of Emergency Equipment · Satisfied"
      },
      {
        "tok": "{{k_f8_fKnowledgeOfEmergencyEquipment_U}}",
        "label": "Knowledge of Emergency Equipment · Not satisfied"
      },
      {
        "tok": "{{k_f8_fKnowledgeOfEmergencyEquipment_NA}}",
        "label": "Knowledge of Emergency Equipment · Exempt"
      },
      {
        "tok": "{{k_f8_fDemonstrationOfEmergencyProcedures_S}}",
        "label": "Demonstration of Emergency Procedures · Satisfied"
      },
      {
        "tok": "{{k_f8_fDemonstrationOfEmergencyProcedures_U}}",
        "label": "Demonstration of Emergency Procedures · Not satisfied"
      },
      {
        "tok": "{{k_f8_fDemonstrationOfEmergencyProcedures_NA}}",
        "label": "Demonstration of Emergency Procedures · Exempt"
      },
      {
        "tok": "{{k_f9_fFosteringCrewCooperation_S}}",
        "label": "Fostering Crew Cooperation · Satisfied"
      },
      {
        "tok": "{{k_f9_fFosteringCrewCooperation_U}}",
        "label": "Fostering Crew Cooperation · Not satisfied"
      },
      {
        "tok": "{{k_f9_fFosteringCrewCooperation_NA}}",
        "label": "Fostering Crew Cooperation · Exempt"
      },
      {
        "tok": "{{k_f9_fCoordinationDuringFlight_S}}",
        "label": "Coordination During Flight · Satisfied"
      },
      {
        "tok": "{{k_f9_fCoordinationDuringFlight_U}}",
        "label": "Coordination During Flight · Not satisfied"
      },
      {
        "tok": "{{k_f9_fCoordinationDuringFlight_NA}}",
        "label": "Coordination During Flight · Exempt"
      },
      {
        "tok": "{{k_f10_fDecisionmakingDuringFlight_S}}",
        "label": "Decision-Making During Flight · Satisfied"
      },
      {
        "tok": "{{k_f10_fDecisionmakingDuringFlight_U}}",
        "label": "Decision-Making During Flight · Not satisfied"
      },
      {
        "tok": "{{k_f10_fDecisionmakingDuringFlight_NA}}",
        "label": "Decision-Making During Flight · Exempt"
      },
      {
        "tok": "{{k_f10_fEfficiencyInFlightOperations_S}}",
        "label": "Efficiency in Flight Operations · Satisfied"
      },
      {
        "tok": "{{k_f10_fEfficiencyInFlightOperations_U}}",
        "label": "Efficiency in Flight Operations · Not satisfied"
      },
      {
        "tok": "{{k_f10_fEfficiencyInFlightOperations_NA}}",
        "label": "Efficiency in Flight Operations · Exempt"
      },
      {
        "tok": "{{k_f11_fKnowledgeOfAircraftSystems_S}}",
        "label": "Knowledge of Aircraft Systems · Satisfied"
      },
      {
        "tok": "{{k_f11_fKnowledgeOfAircraftSystems_U}}",
        "label": "Knowledge of Aircraft Systems · Not satisfied"
      },
      {
        "tok": "{{k_f11_fKnowledgeOfAircraftSystems_NA}}",
        "label": "Knowledge of Aircraft Systems · Exempt"
      },
      {
        "tok": "{{k_f11_fApplicationOfSystemsKnowledge_S}}",
        "label": "Application of Systems Knowledge During Flight · Satisfied"
      },
      {
        "tok": "{{k_f11_fApplicationOfSystemsKnowledge_U}}",
        "label": "Application of Systems Knowledge During Flight · Not satisfied"
      },
      {
        "tok": "{{k_f11_fApplicationOfSystemsKnowledge_NA}}",
        "label": "Application of Systems Knowledge During Flight · Exempt"
      },
      {
        "tok": "{{k_f12_fEngineStarting_S}}",
        "label": "Engine Starting · Satisfied"
      },
      {
        "tok": "{{k_f12_fEngineStarting_U}}",
        "label": "Engine Starting · Not satisfied"
      },
      {
        "tok": "{{k_f12_fEngineStarting_NA}}",
        "label": "Engine Starting · Exempt"
      },
      {
        "tok": "{{k_f12_fTaxiing_S}}",
        "label": "Taxiing · Satisfied"
      },
      {
        "tok": "{{k_f12_fTaxiing_U}}",
        "label": "Taxiing · Not satisfied"
      },
      {
        "tok": "{{k_f12_fTaxiing_NA}}",
        "label": "Taxiing · Exempt"
      },
      {
        "tok": "{{k_f12_fPretakeoffCheck_S}}",
        "label": "Pre-Takeoff Check · Satisfied"
      },
      {
        "tok": "{{k_f12_fPretakeoffCheck_U}}",
        "label": "Pre-Takeoff Check · Not satisfied"
      },
      {
        "tok": "{{k_f12_fPretakeoffCheck_NA}}",
        "label": "Pre-Takeoff Check · Exempt"
      },
      {
        "tok": "{{k_f12_fNormalAndCrossWind_S}}",
        "label": "Normal and Cross Wind Takeoff and Climb · Satisfied"
      },
      {
        "tok": "{{k_f12_fNormalAndCrossWind_U}}",
        "label": "Normal and Cross Wind Takeoff and Climb · Not satisfied"
      },
      {
        "tok": "{{k_f12_fNormalAndCrossWind_NA}}",
        "label": "Normal and Cross Wind Takeoff and Climb · Exempt"
      },
      {
        "tok": "{{k_f12_fShortfieldTakeoffAndClimb_S}}",
        "label": "Short-Field Takeoff and Climb · Satisfied"
      },
      {
        "tok": "{{k_f12_fShortfieldTakeoffAndClimb_U}}",
        "label": "Short-Field Takeoff and Climb · Not satisfied"
      },
      {
        "tok": "{{k_f12_fShortfieldTakeoffAndClimb_NA}}",
        "label": "Short-Field Takeoff and Climb · Exempt"
      },
      {
        "tok": "{{k_f12_fSoftfieldTakeoffAndClimb_S}}",
        "label": "Soft-Field Takeoff and Climb · Satisfied"
      },
      {
        "tok": "{{k_f12_fSoftfieldTakeoffAndClimb_U}}",
        "label": "Soft-Field Takeoff and Climb · Not satisfied"
      },
      {
        "tok": "{{k_f12_fSoftfieldTakeoffAndClimb_NA}}",
        "label": "Soft-Field Takeoff and Climb · Exempt"
      },
      {
        "tok": "{{k_f12_fStraightAndLevelFlight_S}}",
        "label": "Straight and Level Flight · Satisfied"
      },
      {
        "tok": "{{k_f12_fStraightAndLevelFlight_U}}",
        "label": "Straight and Level Flight · Not satisfied"
      },
      {
        "tok": "{{k_f12_fStraightAndLevelFlight_NA}}",
        "label": "Straight and Level Flight · Exempt"
      },
      {
        "tok": "{{k_f12_fLevelTurns_S}}",
        "label": "Level Turns · Satisfied"
      },
      {
        "tok": "{{k_f12_fLevelTurns_U}}",
        "label": "Level Turns · Not satisfied"
      },
      {
        "tok": "{{k_f12_fLevelTurns_NA}}",
        "label": "Level Turns · Exempt"
      },
      {
        "tok": "{{k_f12_fStraightClimbsAndClimbing_S}}",
        "label": "Straight Climbs and Climbing Turns · Satisfied"
      },
      {
        "tok": "{{k_f12_fStraightClimbsAndClimbing_U}}",
        "label": "Straight Climbs and Climbing Turns · Not satisfied"
      },
      {
        "tok": "{{k_f12_fStraightClimbsAndClimbing_NA}}",
        "label": "Straight Climbs and Climbing Turns · Exempt"
      },
      {
        "tok": "{{k_f12_fStraightDescentAndDescending_S}}",
        "label": "Straight Descent and Descending Turns · Satisfied"
      },
      {
        "tok": "{{k_f12_fStraightDescentAndDescending_U}}",
        "label": "Straight Descent and Descending Turns · Not satisfied"
      },
      {
        "tok": "{{k_f12_fStraightDescentAndDescending_NA}}",
        "label": "Straight Descent and Descending Turns · Exempt"
      },
      {
        "tok": "{{k_f12_fPoweronStalls_S}}",
        "label": "Power-On Stalls · Satisfied"
      },
      {
        "tok": "{{k_f12_fPoweronStalls_U}}",
        "label": "Power-On Stalls · Not satisfied"
      },
      {
        "tok": "{{k_f12_fPoweronStalls_NA}}",
        "label": "Power-On Stalls · Exempt"
      },
      {
        "tok": "{{k_f12_fPoweroffStalls_S}}",
        "label": "Power-Off Stalls · Satisfied"
      },
      {
        "tok": "{{k_f12_fPoweroffStalls_U}}",
        "label": "Power-Off Stalls · Not satisfied"
      },
      {
        "tok": "{{k_f12_fPoweroffStalls_NA}}",
        "label": "Power-Off Stalls · Exempt"
      },
      {
        "tok": "{{k_f12_fManeuveringDuringSlowFlight_S}}",
        "label": "Maneuvering during Slow Flight · Satisfied"
      },
      {
        "tok": "{{k_f12_fManeuveringDuringSlowFlight_U}}",
        "label": "Maneuvering during Slow Flight · Not satisfied"
      },
      {
        "tok": "{{k_f12_fManeuveringDuringSlowFlight_NA}}",
        "label": "Maneuvering during Slow Flight · Exempt"
      },
      {
        "tok": "{{k_f12_fSteepTurns_S}}",
        "label": "Steep Turns · Satisfied"
      },
      {
        "tok": "{{k_f12_fSteepTurns_U}}",
        "label": "Steep Turns · Not satisfied"
      },
      {
        "tok": "{{k_f12_fSteepTurns_NA}}",
        "label": "Steep Turns · Exempt"
      },
      {
        "tok": "{{k_f12_fEmergencyDescent_S}}",
        "label": "Emergency Descent · Satisfied"
      },
      {
        "tok": "{{k_f12_fEmergencyDescent_U}}",
        "label": "Emergency Descent · Not satisfied"
      },
      {
        "tok": "{{k_f12_fEmergencyDescent_NA}}",
        "label": "Emergency Descent · Exempt"
      },
      {
        "tok": "{{k_f12_fEmergencyApproachAndLanding_S}}",
        "label": "Emergency Approach and Landing · Satisfied"
      },
      {
        "tok": "{{k_f12_fEmergencyApproachAndLanding_U}}",
        "label": "Emergency Approach and Landing · Not satisfied"
      },
      {
        "tok": "{{k_f12_fEmergencyApproachAndLanding_NA}}",
        "label": "Emergency Approach and Landing · Exempt"
      },
      {
        "tok": "{{k_f12_fSystemsAndEquipmentMalfunction_S}}",
        "label": "Systems and Equipment Malfunction · Satisfied"
      },
      {
        "tok": "{{k_f12_fSystemsAndEquipmentMalfunction_U}}",
        "label": "Systems and Equipment Malfunction · Not satisfied"
      },
      {
        "tok": "{{k_f12_fSystemsAndEquipmentMalfunction_NA}}",
        "label": "Systems and Equipment Malfunction · Exempt"
      },
      {
        "tok": "{{k_f12_fNormalAndCrosswindApproach_S}}",
        "label": "Normal and Crosswind Approach and Landing · Satisfied"
      },
      {
        "tok": "{{k_f12_fNormalAndCrosswindApproach_U}}",
        "label": "Normal and Crosswind Approach and Landing · Not satisfied"
      },
      {
        "tok": "{{k_f12_fNormalAndCrosswindApproach_NA}}",
        "label": "Normal and Crosswind Approach and Landing · Exempt"
      },
      {
        "tok": "{{k_f12_fSoftFieldApproachAnd_S}}",
        "label": "Soft Field Approach and Landing · Satisfied"
      },
      {
        "tok": "{{k_f12_fSoftFieldApproachAnd_U}}",
        "label": "Soft Field Approach and Landing · Not satisfied"
      },
      {
        "tok": "{{k_f12_fSoftFieldApproachAnd_NA}}",
        "label": "Soft Field Approach and Landing · Exempt"
      },
      {
        "tok": "{{k_f12_fShortFieldApproachAnd_S}}",
        "label": "Short Field Approach and Landing · Satisfied"
      },
      {
        "tok": "{{k_f12_fShortFieldApproachAnd_U}}",
        "label": "Short Field Approach and Landing · Not satisfied"
      },
      {
        "tok": "{{k_f12_fShortFieldApproachAnd_NA}}",
        "label": "Short Field Approach and Landing · Exempt"
      },
      {
        "tok": "{{k_f12_fLostCommunicationProcedure_S}}",
        "label": "Lost Communication & Procedure · Satisfied"
      },
      {
        "tok": "{{k_f12_fLostCommunicationProcedure_U}}",
        "label": "Lost Communication & Procedure · Not satisfied"
      },
      {
        "tok": "{{k_f12_fLostCommunicationProcedure_NA}}",
        "label": "Lost Communication & Procedure · Exempt"
      },
      {
        "tok": "{{k_f12_fGoaround_S}}",
        "label": "Go-Around · Satisfied"
      },
      {
        "tok": "{{k_f12_fGoaround_U}}",
        "label": "Go-Around · Not satisfied"
      },
      {
        "tok": "{{k_f12_fGoaround_NA}}",
        "label": "Go-Around · Exempt"
      },
      {
        "tok": "{{k_f13_fDeclarationOfResult_S}}",
        "label": "Declaration of Result · Satisfied"
      },
      {
        "tok": "{{k_f13_fDeclarationOfResult_U}}",
        "label": "Declaration of Result · Not satisfied"
      },
      {
        "tok": "{{k_f13_fDeclarationOfResult_NA}}",
        "label": "Declaration of Result · Exempt"
      },
      {
        "tok": "{{k_f13_fReasonOfTheResult_S}}",
        "label": "Reason of the Result · Satisfied"
      },
      {
        "tok": "{{k_f13_fReasonOfTheResult_U}}",
        "label": "Reason of the Result · Not satisfied"
      },
      {
        "tok": "{{k_f13_fReasonOfTheResult_NA}}",
        "label": "Reason of the Result · Exempt"
      },
      {
        "tok": "{{k_f13_fRatingAndPerformanceObtained_S}}",
        "label": "Rating and Performance Obtained · Satisfied"
      },
      {
        "tok": "{{k_f13_fRatingAndPerformanceObtained_U}}",
        "label": "Rating and Performance Obtained · Not satisfied"
      },
      {
        "tok": "{{k_f13_fRatingAndPerformanceObtained_NA}}",
        "label": "Rating and Performance Obtained · Exempt"
      },
      {
        "tok": "{{k_f13_fGuidanceForTheNext_S}}",
        "label": "Guidance for the Next Step · Satisfied"
      },
      {
        "tok": "{{k_f13_fGuidanceForTheNext_U}}",
        "label": "Guidance for the Next Step · Not satisfied"
      },
      {
        "tok": "{{k_f13_fGuidanceForTheNext_NA}}",
        "label": "Guidance for the Next Step · Exempt"
      },
      {
        "tok": "{{k_f13_fBalancingOfDebriefGood_S}}",
        "label": "Balancing of Debrief: Good and Bad Side · Satisfied"
      },
      {
        "tok": "{{k_f13_fBalancingOfDebriefGood_U}}",
        "label": "Balancing of Debrief: Good and Bad Side · Not satisfied"
      },
      {
        "tok": "{{k_f13_fBalancingOfDebriefGood_NA}}",
        "label": "Balancing of Debrief: Good and Bad Side · Exempt"
      },
      {
        "tok": "{{k_f13_fPleasantDebriefAtmosphere_S}}",
        "label": "Pleasant Debrief Atmosphere · Satisfied"
      },
      {
        "tok": "{{k_f13_fPleasantDebriefAtmosphere_U}}",
        "label": "Pleasant Debrief Atmosphere · Not satisfied"
      },
      {
        "tok": "{{k_f13_fPleasantDebriefAtmosphere_NA}}",
        "label": "Pleasant Debrief Atmosphere · Exempt"
      },
      {
        "tok": "{{k_f14_fDiscipline_S}}",
        "label": "Discipline · Satisfied"
      },
      {
        "tok": "{{k_f14_fDiscipline_U}}",
        "label": "Discipline · Not satisfied"
      },
      {
        "tok": "{{k_f14_fDiscipline_NA}}",
        "label": "Discipline · Exempt"
      },
      {
        "tok": "{{k_f14_fSkillAndProficiency_S}}",
        "label": "Skill and Proficiency · Satisfied"
      },
      {
        "tok": "{{k_f14_fSkillAndProficiency_U}}",
        "label": "Skill and Proficiency · Not satisfied"
      },
      {
        "tok": "{{k_f14_fSkillAndProficiency_NA}}",
        "label": "Skill and Proficiency · Exempt"
      },
      {
        "tok": "{{k_f14_fKnowledge_S}}",
        "label": "Knowledge · Satisfied"
      },
      {
        "tok": "{{k_f14_fKnowledge_U}}",
        "label": "Knowledge · Not satisfied"
      },
      {
        "tok": "{{k_f14_fKnowledge_NA}}",
        "label": "Knowledge · Exempt"
      },
      {
        "tok": "{{k_f14_fSituationalAwareness_S}}",
        "label": "Situational Awareness · Satisfied"
      },
      {
        "tok": "{{k_f14_fSituationalAwareness_U}}",
        "label": "Situational Awareness · Not satisfied"
      },
      {
        "tok": "{{k_f14_fSituationalAwareness_NA}}",
        "label": "Situational Awareness · Exempt"
      },
      {
        "tok": "{{k_f14_fJudgment_S}}",
        "label": "Judgment · Satisfied"
      },
      {
        "tok": "{{k_f14_fJudgment_U}}",
        "label": "Judgment · Not satisfied"
      },
      {
        "tok": "{{k_f14_fJudgment_NA}}",
        "label": "Judgment · Exempt"
      },
      {
        "tok": "{{k_f15_fInstructingCommunication_S}}",
        "label": "Instructing / Communication · Satisfied"
      },
      {
        "tok": "{{k_f15_fInstructingCommunication_U}}",
        "label": "Instructing / Communication · Not satisfied"
      },
      {
        "tok": "{{k_f15_fInstructingCommunication_NA}}",
        "label": "Instructing / Communication · Exempt"
      },
      {
        "tok": "{{k_f15_fDemonstrationAndGuidanceIn_S}}",
        "label": "Demonstration and Guidance in Flight · Satisfied"
      },
      {
        "tok": "{{k_f15_fDemonstrationAndGuidanceIn_U}}",
        "label": "Demonstration and Guidance in Flight · Not satisfied"
      },
      {
        "tok": "{{k_f15_fDemonstrationAndGuidanceIn_NA}}",
        "label": "Demonstration and Guidance in Flight · Exempt"
      },
      {
        "tok": "{{k_f15_fDrawTheAttentionTechnique_S}}",
        "label": "Draw the Attention Technique · Satisfied"
      },
      {
        "tok": "{{k_f15_fDrawTheAttentionTechnique_U}}",
        "label": "Draw the Attention Technique · Not satisfied"
      },
      {
        "tok": "{{k_f15_fDrawTheAttentionTechnique_NA}}",
        "label": "Draw the Attention Technique · Exempt"
      },
      {
        "tok": "{{k_f15_fInterveneTheStudentIn_S}}",
        "label": "Intervene the Student in Flight · Satisfied"
      },
      {
        "tok": "{{k_f15_fInterveneTheStudentIn_U}}",
        "label": "Intervene the Student in Flight · Not satisfied"
      },
      {
        "tok": "{{k_f15_fInterveneTheStudentIn_NA}}",
        "label": "Intervene the Student in Flight · Exempt"
      },
      {
        "tok": "{{k_f15_fManeuveringPlanning_S}}",
        "label": "Maneuvering Planning · Satisfied"
      },
      {
        "tok": "{{k_f15_fManeuveringPlanning_U}}",
        "label": "Maneuvering Planning · Not satisfied"
      },
      {
        "tok": "{{k_f15_fManeuveringPlanning_NA}}",
        "label": "Maneuvering Planning · Exempt"
      },
      {
        "tok": "{{k_f15_fErrorDetection_S}}",
        "label": "Error Detection · Satisfied"
      },
      {
        "tok": "{{k_f15_fErrorDetection_U}}",
        "label": "Error Detection · Not satisfied"
      },
      {
        "tok": "{{k_f15_fErrorDetection_NA}}",
        "label": "Error Detection · Exempt"
      },
      {
        "tok": "{{k_f15_fDistractionTechnique_S}}",
        "label": "Distraction Technique · Satisfied"
      },
      {
        "tok": "{{k_f15_fDistractionTechnique_U}}",
        "label": "Distraction Technique · Not satisfied"
      },
      {
        "tok": "{{k_f15_fDistractionTechnique_NA}}",
        "label": "Distraction Technique · Exempt"
      },
      {
        "tok": "{{k_f15_fInflightTeachingAtmosphere_S}}",
        "label": "Inflight Teaching Atmosphere · Satisfied"
      },
      {
        "tok": "{{k_f15_fInflightTeachingAtmosphere_U}}",
        "label": "Inflight Teaching Atmosphere · Not satisfied"
      },
      {
        "tok": "{{k_f15_fInflightTeachingAtmosphere_NA}}",
        "label": "Inflight Teaching Atmosphere · Exempt"
      },
      {
        "tok": "{{k_f15_fGhostingControlTechnique_S}}",
        "label": "Ghosting Control Technique · Satisfied"
      },
      {
        "tok": "{{k_f15_fGhostingControlTechnique_U}}",
        "label": "Ghosting Control Technique · Not satisfied"
      },
      {
        "tok": "{{k_f15_fGhostingControlTechnique_NA}}",
        "label": "Ghosting Control Technique · Exempt"
      },
      {
        "tok": "{{k_f15_fImmediateChangeOfTeaching_S}}",
        "label": "Immediate Change of Teaching · Satisfied"
      },
      {
        "tok": "{{k_f15_fImmediateChangeOfTeaching_U}}",
        "label": "Immediate Change of Teaching · Not satisfied"
      },
      {
        "tok": "{{k_f15_fImmediateChangeOfTeaching_NA}}",
        "label": "Immediate Change of Teaching · Exempt"
      },
      {
        "tok": "{{k_f15_fInflightEndOfTraining_S}}",
        "label": "Inflight 'End of Training' · Satisfied"
      },
      {
        "tok": "{{k_f15_fInflightEndOfTraining_U}}",
        "label": "Inflight 'End of Training' · Not satisfied"
      },
      {
        "tok": "{{k_f15_fInflightEndOfTraining_NA}}",
        "label": "Inflight 'End of Training' · Exempt"
      },
      {
        "tok": "{{k_f15_fAcceptableEnvelopeOfFault_S}}",
        "label": "Acceptable Envelope of Fault · Satisfied"
      },
      {
        "tok": "{{k_f15_fAcceptableEnvelopeOfFault_U}}",
        "label": "Acceptable Envelope of Fault · Not satisfied"
      },
      {
        "tok": "{{k_f15_fAcceptableEnvelopeOfFault_NA}}",
        "label": "Acceptable Envelope of Fault · Exempt"
      },
      {
        "tok": "{{k_overall_excellent}}",
        "label": "Excellent"
      },
      {
        "tok": "{{k_overall_verygood}}",
        "label": "Very good"
      },
      {
        "tok": "{{k_overall_good}}",
        "label": "Good"
      },
      {
        "tok": "{{k_overall_fair}}",
        "label": "Fair"
      },
      {
        "tok": "{{k_overall_poor}}",
        "label": "Poor"
      }
    ],
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
        "label": "PIC — pilot in command"
      },
      {
        "tok": "{{k_role_Student}}",
        "label": "Student — student pilot"
      },
      {
        "tok": "{{k_aircraftReg_HS-VVD}}",
        "label": "HS-VVD"
      },
      {
        "tok": "{{k_aircraftReg_HS-VVB}}",
        "label": "HS-VVB"
      },
      {
        "tok": "{{k_aircraftReg_HS-CCM}}",
        "label": "HS-CCM"
      },
      {
        "tok": "{{k_aircraftReg_HS-VST}}",
        "label": "HS-VST"
      },
      {
        "tok": "{{k_aircraftReg_HS-POP}}",
        "label": "HS-POP"
      },
      {
        "tok": "{{k_aircraftReg_HS-BTM}}",
        "label": "HS-BTM"
      },
      {
        "tok": "{{k_flightType_VFR}}",
        "label": "VFR"
      },
      {
        "tok": "{{k_flightType_IFR}}",
        "label": "IFR"
      },
      {
        "tok": "{{k_s1Sigmet}}",
        "label": "Convective sigmet (red) penetration"
      },
      {
        "tok": "{{k_s1Thunder}}",
        "label": "Thunderstorm penetration"
      },
      {
        "tok": "{{k_s1Freezing}}",
        "label": "Possible freezing rain / fog"
      },
      {
        "tok": "{{k_s1Autopilot}}",
        "label": "Autopilot INOPS"
      },
      {
        "tok": "{{k_s1AfterMx}}",
        "label": "First flight after maintenance"
      },
      {
        "tok": "{{k_s1Icing_none}}",
        "label": "None"
      },
      {
        "tok": "{{k_s1Icing_light}}",
        "label": "Light"
      },
      {
        "tok": "{{k_s1Icing_moderate}}",
        "label": "Moderate"
      },
      {
        "tok": "{{k_s1Icing_severe}}",
        "label": "Severe SLD"
      },
      {
        "tok": "{{k_s1PrevFlight_1st}}",
        "label": "1st"
      },
      {
        "tok": "{{k_s1PrevFlight_2nd}}",
        "label": "2nd"
      },
      {
        "tok": "{{k_s1PrevFlight_3rd}}",
        "label": "3rd"
      },
      {
        "tok": "{{k_s1PrevFlight_gt3}}",
        "label": "More than 3rd"
      },
      {
        "tok": "{{k_s2NotCurrent}}",
        "label": "Not 90-day current"
      },
      {
        "tok": "{{k_s2Fatigue}}",
        "label": "Fatigue or inadequate rest"
      },
      {
        "tok": "{{k_s2AfterWork}}",
        "label": "Going to fly immediately after workday"
      },
      {
        "tok": "{{k_s2Illness}}",
        "label": "Illness, cold, flu"
      },
      {
        "tok": "{{k_s2Personal}}",
        "label": "Personal relationship issue"
      },
      {
        "tok": "{{k_s2Business}}",
        "label": "Business issue"
      },
      {
        "tok": "{{k_s2Hunger}}",
        "label": "Starving or eating less food"
      },
      {
        "tok": "{{k_s3Wind}}",
        "label": "Wind / gust > 20 kt"
      },
      {
        "tok": "{{k_s3Crosswind}}",
        "label": "Crosswind > 12 kt / runway width < 50 ft"
      },
      {
        "tok": "{{k_s3Night}}",
        "label": "Night operation"
      },
      {
        "tok": "{{k_s3Precip}}",
        "label": "Precipitation"
      },
      {
        "tok": "{{k_s3MaxWeight}}",
        "label": "Near maximum take-off weight"
      },
      {
        "tok": "{{k_s3Terrain}}",
        "label": "Steep terrain nearby"
      },
      {
        "tok": "{{k_s3Runway_dry}}",
        "label": "Dry"
      },
      {
        "tok": "{{k_s3Runway_wet}}",
        "label": "Wet"
      },
      {
        "tok": "{{k_s3Runway_standing}}",
        "label": "Standing water"
      },
      {
        "tok": "{{k_s3Runway_soft}}",
        "label": "Soft field"
      },
      {
        "tok": "{{k_s3Runway_short}}",
        "label": "Runway < 2,000 ft"
      },
      {
        "tok": "{{k_s3Wx}}",
        "label": "DEP: ceilings < 500 ft and/or visibility < 1 SM"
      },
      {
        "tok": "{{k_s4Water}}",
        "label": "Water crossing beyond glide distance"
      },
      {
        "tok": "{{k_s4Mountain}}",
        "label": "Mountain range crossing beyond glide distance"
      },
      {
        "tok": "{{k_s4NightIMC}}",
        "label": "Night or ground-level IMC"
      },
      {
        "tok": "{{k_s4LowPressure}}",
        "label": "Passing within 75 NM of a low-pressure system"
      },
      {
        "tok": "{{k_s5Wind}}",
        "label": "Wind / gust > 20 kt"
      },
      {
        "tok": "{{k_s5Crosswind}}",
        "label": "Crosswind > 12 kt / runway width < 50 ft"
      },
      {
        "tok": "{{k_s5Night}}",
        "label": "Night operation"
      },
      {
        "tok": "{{k_s5Precip}}",
        "label": "Precipitation"
      },
      {
        "tok": "{{k_s5Terrain}}",
        "label": "Steep terrain nearby"
      },
      {
        "tok": "{{k_s5Windshear}}",
        "label": "Low level windshear"
      },
      {
        "tok": "{{k_s5Temp}}",
        "label": "Temperature < 0 °C"
      },
      {
        "tok": "{{k_s5Spread}}",
        "label": "Temperature / dewpoint spread < 3 °C"
      },
      {
        "tok": "{{k_s5Unfamiliar}}",
        "label": "Unfamiliar airport"
      },
      {
        "tok": "{{k_s5NoTower}}",
        "label": "No operating tower"
      },
      {
        "tok": "{{k_s5NoRadar}}",
        "label": "No radar coverage for approach"
      },
      {
        "tok": "{{k_s5Fuel}}",
        "label": "Less than 1 hr 30 min fuel at destination"
      },
      {
        "tok": "{{k_s5Runway_dry}}",
        "label": "Dry"
      },
      {
        "tok": "{{k_s5Runway_wet}}",
        "label": "Wet"
      },
      {
        "tok": "{{k_s5Runway_standing}}",
        "label": "Standing water"
      },
      {
        "tok": "{{k_s5Runway_soft}}",
        "label": "Soft field"
      },
      {
        "tok": "{{k_s5Runway_short}}",
        "label": "Runway < 2,000 ft"
      },
      {
        "tok": "{{k_s5Wx}}",
        "label": "ARR: ceilings < 500 ft and/or visibility < 1 SM"
      },
      {
        "tok": "{{k_decision_GO}}",
        "label": "GO"
      },
      {
        "tok": "{{k_decision_NO-GO}}",
        "label": "NO-GO"
      }
    ],
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
        "label": "Return to service"
      },
      {
        "tok": "{{k_reason_majrepair}}",
        "label": "Post-major repair"
      },
      {
        "tok": "{{k_reason_component}}",
        "label": "Post-component change"
      },
      {
        "tok": "{{k_reason_periodic}}",
        "label": "Periodic check"
      },
      {
        "tok": "{{k_reason_other}}",
        "label": "Other"
      },
      {
        "tok": "{{k_checks_E1_S}}",
        "label": "Engine start · Sat"
      },
      {
        "tok": "{{k_checks_E1_U}}",
        "label": "Engine start · Unsat"
      },
      {
        "tok": "{{k_checks_E2_S}}",
        "label": "Run-up · Sat"
      },
      {
        "tok": "{{k_checks_E2_U}}",
        "label": "Run-up · Unsat"
      },
      {
        "tok": "{{k_checks_T1_S}}",
        "label": "Take-off performance · Sat"
      },
      {
        "tok": "{{k_checks_T1_U}}",
        "label": "Take-off performance · Unsat"
      },
      {
        "tok": "{{k_checks_T2_S}}",
        "label": "Climb performance · Sat"
      },
      {
        "tok": "{{k_checks_T2_U}}",
        "label": "Climb performance · Unsat"
      },
      {
        "tok": "{{k_checks_C1_S}}",
        "label": "Engine power (cruise) · Sat"
      },
      {
        "tok": "{{k_checks_C1_U}}",
        "label": "Engine power (cruise) · Unsat"
      },
      {
        "tok": "{{k_checks_C2_S}}",
        "label": "Fuel system · Sat"
      },
      {
        "tok": "{{k_checks_C2_U}}",
        "label": "Fuel system · Unsat"
      },
      {
        "tok": "{{k_checks_H1_S}}",
        "label": "Stall (if required) · Sat"
      },
      {
        "tok": "{{k_checks_H1_U}}",
        "label": "Stall (if required) · Unsat"
      },
      {
        "tok": "{{k_checks_H2_S}}",
        "label": "Control response · Sat"
      },
      {
        "tok": "{{k_checks_H2_U}}",
        "label": "Control response · Unsat"
      },
      {
        "tok": "{{k_checks_A1_S}}",
        "label": "Approach · Sat"
      },
      {
        "tok": "{{k_checks_A1_U}}",
        "label": "Approach · Unsat"
      },
      {
        "tok": "{{k_checks_A2_S}}",
        "label": "Landing · Sat"
      },
      {
        "tok": "{{k_checks_A2_U}}",
        "label": "Landing · Unsat"
      },
      {
        "tok": "{{k_checks_P1_S}}",
        "label": "Engine shutdown · Sat"
      },
      {
        "tok": "{{k_checks_P1_U}}",
        "label": "Engine shutdown · Unsat"
      },
      {
        "tok": "{{k_checks_P2_S}}",
        "label": "Inspection after flight · Sat"
      },
      {
        "tok": "{{k_checks_P2_U}}",
        "label": "Inspection after flight · Unsat"
      },
      {
        "tok": "{{k_verdict_serviceable}}",
        "label": "Serviceable — approved for return to service"
      },
      {
        "tok": "{{k_verdict_unserviceable}}",
        "label": "Unserviceable — defects require rectification first"
      }
    ],
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
        "label": "Yes"
      },
      {
        "tok": "{{k_residualOk_no}}",
        "label": "No — requires further action"
      }
    ],
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
        "label": "Personnel"
      },
      {
        "tok": "{{k_category_equipment}}",
        "label": "Equipment / fleet"
      },
      {
        "tok": "{{k_category_procedure}}",
        "label": "Procedure / SOP"
      },
      {
        "tok": "{{k_category_regulatory}}",
        "label": "Regulatory"
      },
      {
        "tok": "{{k_category_other}}",
        "label": "Other"
      },
      {
        "tok": "{{k_priority_routine}}",
        "label": "Routine"
      },
      {
        "tok": "{{k_priority_urgent}}",
        "label": "Urgent"
      },
      {
        "tok": "{{k_priority_emergency}}",
        "label": "Emergency"
      },
      {
        "tok": "{{k_overallRisk_low}}",
        "label": "Low"
      },
      {
        "tok": "{{k_overallRisk_medium}}",
        "label": "Medium"
      },
      {
        "tok": "{{k_overallRisk_high}}",
        "label": "High"
      },
      {
        "tok": "{{k_overallRisk_rejected}}",
        "label": "Not acceptable — change rejected"
      },
      {
        "tok": "{{k_caatNotify_yes}}",
        "label": "Yes"
      },
      {
        "tok": "{{k_caatNotify_no}}",
        "label": "No"
      },
      {
        "tok": "{{k_trainReq_yes}}",
        "label": "Yes"
      },
      {
        "tok": "{{k_trainReq_no}}",
        "label": "No"
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
        "tok": "{{hazards_1_hazard}}",
        "label": "Identified hazards / risks แถว 1 · Hazard / risk",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{hazards_1_likelihood}}",
        "label": "Identified hazards / risks แถว 1 · Likelihood",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{hazards_1_severity}}",
        "label": "Identified hazards / risks แถว 1 · Severity",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{hazards_1_level}}",
        "label": "Identified hazards / risks แถว 1 · Risk level",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{hazards_1_mitigation}}",
        "label": "Identified hazards / risks แถว 1 · Mitigation measure",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{hazards_2_hazard}}",
        "label": "Identified hazards / risks แถว 2 · Hazard / risk",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{hazards_2_likelihood}}",
        "label": "Identified hazards / risks แถว 2 · Likelihood",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{hazards_2_severity}}",
        "label": "Identified hazards / risks แถว 2 · Severity",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{hazards_2_level}}",
        "label": "Identified hazards / risks แถว 2 · Risk level",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{hazards_2_mitigation}}",
        "label": "Identified hazards / risks แถว 2 · Mitigation measure",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{hazards_3_hazard}}",
        "label": "Identified hazards / risks แถว 3 · Hazard / risk",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{hazards_3_likelihood}}",
        "label": "Identified hazards / risks แถว 3 · Likelihood",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{hazards_3_severity}}",
        "label": "Identified hazards / risks แถว 3 · Severity",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{hazards_3_level}}",
        "label": "Identified hazards / risks แถว 3 · Risk level",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{hazards_3_mitigation}}",
        "label": "Identified hazards / risks แถว 3 · Mitigation measure",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{regs_1_reg}}",
        "label": "Applicable regulations / standards แถว 1 · Regulation / standard",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{regs_1_ref}}",
        "label": "Applicable regulations / standards แถว 1 · Reference",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{regs_1_action}}",
        "label": "Applicable regulations / standards แถว 1 · Compliance action required",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{regs_2_reg}}",
        "label": "Applicable regulations / standards แถว 2 · Regulation / standard",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{regs_2_ref}}",
        "label": "Applicable regulations / standards แถว 2 · Reference",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{regs_2_action}}",
        "label": "Applicable regulations / standards แถว 2 · Compliance action required",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{regs_3_reg}}",
        "label": "Applicable regulations / standards แถว 3 · Regulation / standard",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{regs_3_ref}}",
        "label": "Applicable regulations / standards แถว 3 · Reference",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{regs_3_action}}",
        "label": "Applicable regulations / standards แถว 3 · Compliance action required",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docsAffected_1_code}}",
        "label": "Document list แถว 1 · Document code",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docsAffected_1_title}}",
        "label": "Document list แถว 1 · Document title",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docsAffected_1_action}}",
        "label": "Document list แถว 1 · Action required",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docsAffected_2_code}}",
        "label": "Document list แถว 2 · Document code",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docsAffected_2_title}}",
        "label": "Document list แถว 2 · Document title",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docsAffected_2_action}}",
        "label": "Document list แถว 2 · Action required",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docsAffected_3_code}}",
        "label": "Document list แถว 3 · Document code",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docsAffected_3_title}}",
        "label": "Document list แถว 3 · Document title",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docsAffected_3_action}}",
        "label": "Document list แถว 3 · Action required",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docsAffected_4_code}}",
        "label": "Document list แถว 4 · Document code",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docsAffected_4_title}}",
        "label": "Document list แถว 4 · Document title",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{docsAffected_4_action}}",
        "label": "Document list แถว 4 · Action required",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_1_action}}",
        "label": "Action steps แถว 1 · Action / step",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_1_owner}}",
        "label": "Action steps แถว 1 · Responsible person",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_1_target}}",
        "label": "Action steps แถว 1 · Target date",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_1_status}}",
        "label": "Action steps แถว 1 · Status",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_2_action}}",
        "label": "Action steps แถว 2 · Action / step",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_2_owner}}",
        "label": "Action steps แถว 2 · Responsible person",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_2_target}}",
        "label": "Action steps แถว 2 · Target date",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_2_status}}",
        "label": "Action steps แถว 2 · Status",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_3_action}}",
        "label": "Action steps แถว 3 · Action / step",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_3_owner}}",
        "label": "Action steps แถว 3 · Responsible person",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_3_target}}",
        "label": "Action steps แถว 3 · Target date",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_3_status}}",
        "label": "Action steps แถว 3 · Status",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_4_action}}",
        "label": "Action steps แถว 4 · Action / step",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_4_owner}}",
        "label": "Action steps แถว 4 · Responsible person",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_4_target}}",
        "label": "Action steps แถว 4 · Target date",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_4_status}}",
        "label": "Action steps แถว 4 · Status",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_5_action}}",
        "label": "Action steps แถว 5 · Action / step",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_5_owner}}",
        "label": "Action steps แถว 5 · Responsible person",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_5_target}}",
        "label": "Action steps แถว 5 · Target date",
        "labelTh": "",
        "sign": false
      },
      {
        "tok": "{{plan_5_status}}",
        "label": "Action steps แถว 5 · Status",
        "labelTh": "",
        "sign": false
      },
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
        "label": "Tier 1 — Annual IPC"
      },
      {
        "tok": "{{k_tier_t1initial}}",
        "label": "Tier 1 — Initial IPC"
      },
      {
        "tok": "{{k_tier_t1postcor}}",
        "label": "Tier 1 — Post-corrective"
      },
      {
        "tok": "{{k_tier_t1postabs}}",
        "label": "Tier 1 — Post-absence"
      },
      {
        "tok": "{{k_tier_t1directed}}",
        "label": "Tier 1 — Directed"
      },
      {
        "tok": "{{k_tier_t2lpc}}",
        "label": "Tier 2 — LPC+"
      },
      {
        "tok": "{{k_tier_t3aoc}}",
        "label": "Tier 3 — AoC"
      },
      {
        "tok": "{{k_combined_yes}}",
        "label": "Yes"
      },
      {
        "tok": "{{k_combined_no}}",
        "label": "No"
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
        "label": "Pass"
      },
      {
        "tok": "{{k_result_marginal}}",
        "label": "Marginal pass"
      },
      {
        "tok": "{{k_result_fail}}",
        "label": "Fail"
      },
      {
        "tok": "{{k_result_unsat}}",
        "label": "Unsatisfactory"
      },
      {
        "tok": "{{k_correctiveInit_yes}}",
        "label": "Yes"
      },
      {
        "tok": "{{k_correctiveInit_no}}",
        "label": "No"
      }
    ],
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
        "label": "Annual IPC"
      },
      {
        "tok": "{{k_ipcType_initial}}",
        "label": "Initial IPC"
      },
      {
        "tok": "{{k_ipcType_postcor}}",
        "label": "Post-corrective IPC"
      },
      {
        "tok": "{{k_ipcType_postabs}}",
        "label": "Post-absence IPC"
      },
      {
        "tok": "{{k_ipcType_directed}}",
        "label": "Directed IPC"
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
        "label": "Pass"
      },
      {
        "tok": "{{k_result_marginal}}",
        "label": "Marginal pass"
      },
      {
        "tok": "{{k_result_fail}}",
        "label": "Fail"
      },
      {
        "tok": "{{k_result_unsat}}",
        "label": "Unsatisfactory"
      },
      {
        "tok": "{{k_correctiveInit_yes}}",
        "label": "Yes"
      },
      {
        "tok": "{{k_correctiveInit_no}}",
        "label": "No"
      }
    ],
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
        "label": "Passenger is a minor (under 18). A parent or legal guardian must sign."
      }
    ],
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
        "label": "Annual seminar"
      },
      {
        "tok": "{{k_trainType_perf}}",
        "label": "Trigger-based (performance)"
      },
      {
        "tok": "{{k_trainType_regulatory}}",
        "label": "Trigger-based (regulatory)"
      },
      {
        "tok": "{{k_trainType_safety}}",
        "label": "Trigger-based (safety occurrence)"
      },
      {
        "tok": "{{k_trainType_renewal}}",
        "label": "Rating renewal"
      },
      {
        "tok": "{{k_topics_regulatory}}",
        "label": "Regulatory updates (CAAT / ICAO)"
      },
      {
        "tok": "{{k_topics_teaching}}",
        "label": "Teaching and learning techniques"
      },
      {
        "tok": "{{k_topics_humanfac}}",
        "label": "Human factors and fatigue management"
      },
      {
        "tok": "{{k_topics_safety}}",
        "label": "Flight safety and SMS awareness"
      },
      {
        "tok": "{{k_topics_grading}}",
        "label": "Standardisation and grading standards"
      },
      {
        "tok": "{{k_topics_other}}",
        "label": "Other"
      },
      {
        "tok": "{{k_outcome_sat}}",
        "label": "Satisfactory"
      },
      {
        "tok": "{{k_outcome_unsat}}",
        "label": "Unsatisfactory"
      }
    ],
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
        "label": "Flight Instructor who left the company for more than 2 weeks"
      },
      {
        "tok": "{{k_applyFor_dualDuty}}",
        "label": "Flight Instructor or Student with dual duty as air personnel"
      },
      {
        "tok": "{{k_applyFor_otherFly}}",
        "label": "Flight Instructor or Student with other flying (recreational or aviation-related)"
      },
      {
        "tok": "{{k_youAre_instructor}}",
        "label": "Instructor"
      },
      {
        "tok": "{{k_youAre_student}}",
        "label": "Current Student"
      },
      {
        "tok": "{{k_youAre_alumni}}",
        "label": "Alumni / Recurrent"
      },
      {
        "tok": "{{k_ftlConfirm}}",
        "label": "FTL Compliance Confirmation: I confirm the totals above include hours from ALL operators. After today's planned duty with D-0507, my flight hours will not exceed the FTL limits: 7 days ≤ 28 hr / 28 days ≤ 100 hr / 365 days ≤ 1,000 hr. I understand that inaccurate declaration is a regulatory offence under Thai civil aviation law."
      }
    ],
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
        "label": "The course as a whole was · Excellent"
      },
      {
        "tok": "{{k_p1_pTheCourseAsA_good}}",
        "label": "The course as a whole was · Good"
      },
      {
        "tok": "{{k_p1_pTheCourseAsA_fair}}",
        "label": "The course as a whole was · Fair"
      },
      {
        "tok": "{{k_p1_pTheCourseAsA_poor}}",
        "label": "The course as a whole was · Poor"
      },
      {
        "tok": "{{k_p1_pTheCourseAsA_verypoor}}",
        "label": "The course as a whole was · Very poor"
      },
      {
        "tok": "{{k_p1_pTheCourseAsA_na}}",
        "label": "The course as a whole was · N/A"
      },
      {
        "tok": "{{k_p1_pTheCourseContentWas_excellent}}",
        "label": "The course content was · Excellent"
      },
      {
        "tok": "{{k_p1_pTheCourseContentWas_good}}",
        "label": "The course content was · Good"
      },
      {
        "tok": "{{k_p1_pTheCourseContentWas_fair}}",
        "label": "The course content was · Fair"
      },
      {
        "tok": "{{k_p1_pTheCourseContentWas_poor}}",
        "label": "The course content was · Poor"
      },
      {
        "tok": "{{k_p1_pTheCourseContentWas_verypoor}}",
        "label": "The course content was · Very poor"
      },
      {
        "tok": "{{k_p1_pTheCourseContentWas_na}}",
        "label": "The course content was · N/A"
      },
      {
        "tok": "{{k_p1_pClarityOfStudyMaterial_excellent}}",
        "label": "Clarity of study material was · Excellent"
      },
      {
        "tok": "{{k_p1_pClarityOfStudyMaterial_good}}",
        "label": "Clarity of study material was · Good"
      },
      {
        "tok": "{{k_p1_pClarityOfStudyMaterial_fair}}",
        "label": "Clarity of study material was · Fair"
      },
      {
        "tok": "{{k_p1_pClarityOfStudyMaterial_poor}}",
        "label": "Clarity of study material was · Poor"
      },
      {
        "tok": "{{k_p1_pClarityOfStudyMaterial_verypoor}}",
        "label": "Clarity of study material was · Very poor"
      },
      {
        "tok": "{{k_p1_pClarityOfStudyMaterial_na}}",
        "label": "Clarity of study material was · N/A"
      },
      {
        "tok": "{{k_p1_pExplanationsByTheContents_excellent}}",
        "label": "Explanations by the contents were · Excellent"
      },
      {
        "tok": "{{k_p1_pExplanationsByTheContents_good}}",
        "label": "Explanations by the contents were · Good"
      },
      {
        "tok": "{{k_p1_pExplanationsByTheContents_fair}}",
        "label": "Explanations by the contents were · Fair"
      },
      {
        "tok": "{{k_p1_pExplanationsByTheContents_poor}}",
        "label": "Explanations by the contents were · Poor"
      },
      {
        "tok": "{{k_p1_pExplanationsByTheContents_verypoor}}",
        "label": "Explanations by the contents were · Very poor"
      },
      {
        "tok": "{{k_p1_pExplanationsByTheContents_na}}",
        "label": "Explanations by the contents were · N/A"
      },
      {
        "tok": "{{k_p1_pTheUseOfExamples_excellent}}",
        "label": "The use of examples and illustrations was · Excellent"
      },
      {
        "tok": "{{k_p1_pTheUseOfExamples_good}}",
        "label": "The use of examples and illustrations was · Good"
      },
      {
        "tok": "{{k_p1_pTheUseOfExamples_fair}}",
        "label": "The use of examples and illustrations was · Fair"
      },
      {
        "tok": "{{k_p1_pTheUseOfExamples_poor}}",
        "label": "The use of examples and illustrations was · Poor"
      },
      {
        "tok": "{{k_p1_pTheUseOfExamples_verypoor}}",
        "label": "The use of examples and illustrations was · Very poor"
      },
      {
        "tok": "{{k_p1_pTheUseOfExamples_na}}",
        "label": "The use of examples and illustrations was · N/A"
      },
      {
        "tok": "{{k_p1_pAvailabilityOfExtraHelp_excellent}}",
        "label": "Availability of extra help when needed was · Excellent"
      },
      {
        "tok": "{{k_p1_pAvailabilityOfExtraHelp_good}}",
        "label": "Availability of extra help when needed was · Good"
      },
      {
        "tok": "{{k_p1_pAvailabilityOfExtraHelp_fair}}",
        "label": "Availability of extra help when needed was · Fair"
      },
      {
        "tok": "{{k_p1_pAvailabilityOfExtraHelp_poor}}",
        "label": "Availability of extra help when needed was · Poor"
      },
      {
        "tok": "{{k_p1_pAvailabilityOfExtraHelp_verypoor}}",
        "label": "Availability of extra help when needed was · Very poor"
      },
      {
        "tok": "{{k_p1_pAvailabilityOfExtraHelp_na}}",
        "label": "Availability of extra help when needed was · N/A"
      },
      {
        "tok": "{{k_p1_pUseOfTimeIn_excellent}}",
        "label": "Use of time in each subject was · Excellent"
      },
      {
        "tok": "{{k_p1_pUseOfTimeIn_good}}",
        "label": "Use of time in each subject was · Good"
      },
      {
        "tok": "{{k_p1_pUseOfTimeIn_fair}}",
        "label": "Use of time in each subject was · Fair"
      },
      {
        "tok": "{{k_p1_pUseOfTimeIn_poor}}",
        "label": "Use of time in each subject was · Poor"
      },
      {
        "tok": "{{k_p1_pUseOfTimeIn_verypoor}}",
        "label": "Use of time in each subject was · Very poor"
      },
      {
        "tok": "{{k_p1_pUseOfTimeIn_na}}",
        "label": "Use of time in each subject was · N/A"
      },
      {
        "tok": "{{k_p1_pAmountYouLearnedWas_excellent}}",
        "label": "Amount you learned was · Excellent"
      },
      {
        "tok": "{{k_p1_pAmountYouLearnedWas_good}}",
        "label": "Amount you learned was · Good"
      },
      {
        "tok": "{{k_p1_pAmountYouLearnedWas_fair}}",
        "label": "Amount you learned was · Fair"
      },
      {
        "tok": "{{k_p1_pAmountYouLearnedWas_poor}}",
        "label": "Amount you learned was · Poor"
      },
      {
        "tok": "{{k_p1_pAmountYouLearnedWas_verypoor}}",
        "label": "Amount you learned was · Very poor"
      },
      {
        "tok": "{{k_p1_pAmountYouLearnedWas_na}}",
        "label": "Amount you learned was · N/A"
      },
      {
        "tok": "{{k_p1_pRelevanceOfCourseContent_excellent}}",
        "label": "Relevance of course content was · Excellent"
      },
      {
        "tok": "{{k_p1_pRelevanceOfCourseContent_good}}",
        "label": "Relevance of course content was · Good"
      },
      {
        "tok": "{{k_p1_pRelevanceOfCourseContent_fair}}",
        "label": "Relevance of course content was · Fair"
      },
      {
        "tok": "{{k_p1_pRelevanceOfCourseContent_poor}}",
        "label": "Relevance of course content was · Poor"
      },
      {
        "tok": "{{k_p1_pRelevanceOfCourseContent_verypoor}}",
        "label": "Relevance of course content was · Very poor"
      },
      {
        "tok": "{{k_p1_pRelevanceOfCourseContent_na}}",
        "label": "Relevance of course content was · N/A"
      },
      {
        "tok": "{{k_p2_pTheCourseAsA2_excellent}}",
        "label": "The course as a whole was · Excellent"
      },
      {
        "tok": "{{k_p2_pTheCourseAsA2_good}}",
        "label": "The course as a whole was · Good"
      },
      {
        "tok": "{{k_p2_pTheCourseAsA2_fair}}",
        "label": "The course as a whole was · Fair"
      },
      {
        "tok": "{{k_p2_pTheCourseAsA2_poor}}",
        "label": "The course as a whole was · Poor"
      },
      {
        "tok": "{{k_p2_pTheCourseAsA2_verypoor}}",
        "label": "The course as a whole was · Very poor"
      },
      {
        "tok": "{{k_p2_pTheCourseAsA2_na}}",
        "label": "The course as a whole was · N/A"
      },
      {
        "tok": "{{k_p2_pTheCourseContentWas2_excellent}}",
        "label": "The course content was · Excellent"
      },
      {
        "tok": "{{k_p2_pTheCourseContentWas2_good}}",
        "label": "The course content was · Good"
      },
      {
        "tok": "{{k_p2_pTheCourseContentWas2_fair}}",
        "label": "The course content was · Fair"
      },
      {
        "tok": "{{k_p2_pTheCourseContentWas2_poor}}",
        "label": "The course content was · Poor"
      },
      {
        "tok": "{{k_p2_pTheCourseContentWas2_verypoor}}",
        "label": "The course content was · Very poor"
      },
      {
        "tok": "{{k_p2_pTheCourseContentWas2_na}}",
        "label": "The course content was · N/A"
      },
      {
        "tok": "{{k_p2_pTheInstructorsContributionTo_excellent}}",
        "label": "The instructor's contribution to the course was · Excellent"
      },
      {
        "tok": "{{k_p2_pTheInstructorsContributionTo_good}}",
        "label": "The instructor's contribution to the course was · Good"
      },
      {
        "tok": "{{k_p2_pTheInstructorsContributionTo_fair}}",
        "label": "The instructor's contribution to the course was · Fair"
      },
      {
        "tok": "{{k_p2_pTheInstructorsContributionTo_poor}}",
        "label": "The instructor's contribution to the course was · Poor"
      },
      {
        "tok": "{{k_p2_pTheInstructorsContributionTo_verypoor}}",
        "label": "The instructor's contribution to the course was · Very poor"
      },
      {
        "tok": "{{k_p2_pTheInstructorsContributionTo_na}}",
        "label": "The instructor's contribution to the course was · N/A"
      },
      {
        "tok": "{{k_p2_pTheInstructorsEffectivenessIn_excellent}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Excellent"
      },
      {
        "tok": "{{k_p2_pTheInstructorsEffectivenessIn_good}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Good"
      },
      {
        "tok": "{{k_p2_pTheInstructorsEffectivenessIn_fair}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Fair"
      },
      {
        "tok": "{{k_p2_pTheInstructorsEffectivenessIn_poor}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Poor"
      },
      {
        "tok": "{{k_p2_pTheInstructorsEffectivenessIn_verypoor}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · Very poor"
      },
      {
        "tok": "{{k_p2_pTheInstructorsEffectivenessIn_na}}",
        "label": "The instructor's effectiveness in teaching the subject matter was · N/A"
      },
      {
        "tok": "{{k_p2_pCourseOrganisationWas_excellent}}",
        "label": "Course organisation was · Excellent"
      },
      {
        "tok": "{{k_p2_pCourseOrganisationWas_good}}",
        "label": "Course organisation was · Good"
      },
      {
        "tok": "{{k_p2_pCourseOrganisationWas_fair}}",
        "label": "Course organisation was · Fair"
      },
      {
        "tok": "{{k_p2_pCourseOrganisationWas_poor}}",
        "label": "Course organisation was · Poor"
      },
      {
        "tok": "{{k_p2_pCourseOrganisationWas_verypoor}}",
        "label": "Course organisation was · Very poor"
      },
      {
        "tok": "{{k_p2_pCourseOrganisationWas_na}}",
        "label": "Course organisation was · N/A"
      },
      {
        "tok": "{{k_p2_pClarityOfInstructorsVoice_excellent}}",
        "label": "Clarity of instructor's voice was · Excellent"
      },
      {
        "tok": "{{k_p2_pClarityOfInstructorsVoice_good}}",
        "label": "Clarity of instructor's voice was · Good"
      },
      {
        "tok": "{{k_p2_pClarityOfInstructorsVoice_fair}}",
        "label": "Clarity of instructor's voice was · Fair"
      },
      {
        "tok": "{{k_p2_pClarityOfInstructorsVoice_poor}}",
        "label": "Clarity of instructor's voice was · Poor"
      },
      {
        "tok": "{{k_p2_pClarityOfInstructorsVoice_verypoor}}",
        "label": "Clarity of instructor's voice was · Very poor"
      },
      {
        "tok": "{{k_p2_pClarityOfInstructorsVoice_na}}",
        "label": "Clarity of instructor's voice was · N/A"
      },
      {
        "tok": "{{k_p2_pExplanationsByInstructorWere_excellent}}",
        "label": "Explanations by instructor were · Excellent"
      },
      {
        "tok": "{{k_p2_pExplanationsByInstructorWere_good}}",
        "label": "Explanations by instructor were · Good"
      },
      {
        "tok": "{{k_p2_pExplanationsByInstructorWere_fair}}",
        "label": "Explanations by instructor were · Fair"
      },
      {
        "tok": "{{k_p2_pExplanationsByInstructorWere_poor}}",
        "label": "Explanations by instructor were · Poor"
      },
      {
        "tok": "{{k_p2_pExplanationsByInstructorWere_verypoor}}",
        "label": "Explanations by instructor were · Very poor"
      },
      {
        "tok": "{{k_p2_pExplanationsByInstructorWere_na}}",
        "label": "Explanations by instructor were · N/A"
      },
      {
        "tok": "{{k_p2_pInstructorsUseOfExamples_excellent}}",
        "label": "Instructor's use of examples and illustrations was · Excellent"
      },
      {
        "tok": "{{k_p2_pInstructorsUseOfExamples_good}}",
        "label": "Instructor's use of examples and illustrations was · Good"
      },
      {
        "tok": "{{k_p2_pInstructorsUseOfExamples_fair}}",
        "label": "Instructor's use of examples and illustrations was · Fair"
      },
      {
        "tok": "{{k_p2_pInstructorsUseOfExamples_poor}}",
        "label": "Instructor's use of examples and illustrations was · Poor"
      },
      {
        "tok": "{{k_p2_pInstructorsUseOfExamples_verypoor}}",
        "label": "Instructor's use of examples and illustrations was · Very poor"
      },
      {
        "tok": "{{k_p2_pInstructorsUseOfExamples_na}}",
        "label": "Instructor's use of examples and illustrations was · N/A"
      },
      {
        "tok": "{{k_p2_pQualityOfQuestionsOr_excellent}}",
        "label": "Quality of questions or problems raised by the instructor was · Excellent"
      },
      {
        "tok": "{{k_p2_pQualityOfQuestionsOr_good}}",
        "label": "Quality of questions or problems raised by the instructor was · Good"
      },
      {
        "tok": "{{k_p2_pQualityOfQuestionsOr_fair}}",
        "label": "Quality of questions or problems raised by the instructor was · Fair"
      },
      {
        "tok": "{{k_p2_pQualityOfQuestionsOr_poor}}",
        "label": "Quality of questions or problems raised by the instructor was · Poor"
      },
      {
        "tok": "{{k_p2_pQualityOfQuestionsOr_verypoor}}",
        "label": "Quality of questions or problems raised by the instructor was · Very poor"
      },
      {
        "tok": "{{k_p2_pQualityOfQuestionsOr_na}}",
        "label": "Quality of questions or problems raised by the instructor was · N/A"
      },
      {
        "tok": "{{k_p2_pStudentsConfidenceInInstructors_excellent}}",
        "label": "Student's confidence in instructor's knowledge was · Excellent"
      },
      {
        "tok": "{{k_p2_pStudentsConfidenceInInstructors_good}}",
        "label": "Student's confidence in instructor's knowledge was · Good"
      },
      {
        "tok": "{{k_p2_pStudentsConfidenceInInstructors_fair}}",
        "label": "Student's confidence in instructor's knowledge was · Fair"
      },
      {
        "tok": "{{k_p2_pStudentsConfidenceInInstructors_poor}}",
        "label": "Student's confidence in instructor's knowledge was · Poor"
      },
      {
        "tok": "{{k_p2_pStudentsConfidenceInInstructors_verypoor}}",
        "label": "Student's confidence in instructor's knowledge was · Very poor"
      },
      {
        "tok": "{{k_p2_pStudentsConfidenceInInstructors_na}}",
        "label": "Student's confidence in instructor's knowledge was · N/A"
      },
      {
        "tok": "{{k_p2_pInstructorsEnthusiasmWas_excellent}}",
        "label": "Instructor's enthusiasm was · Excellent"
      },
      {
        "tok": "{{k_p2_pInstructorsEnthusiasmWas_good}}",
        "label": "Instructor's enthusiasm was · Good"
      },
      {
        "tok": "{{k_p2_pInstructorsEnthusiasmWas_fair}}",
        "label": "Instructor's enthusiasm was · Fair"
      },
      {
        "tok": "{{k_p2_pInstructorsEnthusiasmWas_poor}}",
        "label": "Instructor's enthusiasm was · Poor"
      },
      {
        "tok": "{{k_p2_pInstructorsEnthusiasmWas_verypoor}}",
        "label": "Instructor's enthusiasm was · Very poor"
      },
      {
        "tok": "{{k_p2_pInstructorsEnthusiasmWas_na}}",
        "label": "Instructor's enthusiasm was · N/A"
      },
      {
        "tok": "{{k_p2_pEncouragementGivenToStudents_excellent}}",
        "label": "Encouragement given to students to participate was · Excellent"
      },
      {
        "tok": "{{k_p2_pEncouragementGivenToStudents_good}}",
        "label": "Encouragement given to students to participate was · Good"
      },
      {
        "tok": "{{k_p2_pEncouragementGivenToStudents_fair}}",
        "label": "Encouragement given to students to participate was · Fair"
      },
      {
        "tok": "{{k_p2_pEncouragementGivenToStudents_poor}}",
        "label": "Encouragement given to students to participate was · Poor"
      },
      {
        "tok": "{{k_p2_pEncouragementGivenToStudents_verypoor}}",
        "label": "Encouragement given to students to participate was · Very poor"
      },
      {
        "tok": "{{k_p2_pEncouragementGivenToStudents_na}}",
        "label": "Encouragement given to students to participate was · N/A"
      },
      {
        "tok": "{{k_p2_pAnswersToStudentQuestions_excellent}}",
        "label": "Answers to student questions were · Excellent"
      },
      {
        "tok": "{{k_p2_pAnswersToStudentQuestions_good}}",
        "label": "Answers to student questions were · Good"
      },
      {
        "tok": "{{k_p2_pAnswersToStudentQuestions_fair}}",
        "label": "Answers to student questions were · Fair"
      },
      {
        "tok": "{{k_p2_pAnswersToStudentQuestions_poor}}",
        "label": "Answers to student questions were · Poor"
      },
      {
        "tok": "{{k_p2_pAnswersToStudentQuestions_verypoor}}",
        "label": "Answers to student questions were · Very poor"
      },
      {
        "tok": "{{k_p2_pAnswersToStudentQuestions_na}}",
        "label": "Answers to student questions were · N/A"
      },
      {
        "tok": "{{k_p2_pAvailabilityOfExtraHelp2_excellent}}",
        "label": "Availability of extra help when needed was · Excellent"
      },
      {
        "tok": "{{k_p2_pAvailabilityOfExtraHelp2_good}}",
        "label": "Availability of extra help when needed was · Good"
      },
      {
        "tok": "{{k_p2_pAvailabilityOfExtraHelp2_fair}}",
        "label": "Availability of extra help when needed was · Fair"
      },
      {
        "tok": "{{k_p2_pAvailabilityOfExtraHelp2_poor}}",
        "label": "Availability of extra help when needed was · Poor"
      },
      {
        "tok": "{{k_p2_pAvailabilityOfExtraHelp2_verypoor}}",
        "label": "Availability of extra help when needed was · Very poor"
      },
      {
        "tok": "{{k_p2_pAvailabilityOfExtraHelp2_na}}",
        "label": "Availability of extra help when needed was · N/A"
      },
      {
        "tok": "{{k_p2_pUseOfClassTime_excellent}}",
        "label": "Use of class time was · Excellent"
      },
      {
        "tok": "{{k_p2_pUseOfClassTime_good}}",
        "label": "Use of class time was · Good"
      },
      {
        "tok": "{{k_p2_pUseOfClassTime_fair}}",
        "label": "Use of class time was · Fair"
      },
      {
        "tok": "{{k_p2_pUseOfClassTime_poor}}",
        "label": "Use of class time was · Poor"
      },
      {
        "tok": "{{k_p2_pUseOfClassTime_verypoor}}",
        "label": "Use of class time was · Very poor"
      },
      {
        "tok": "{{k_p2_pUseOfClassTime_na}}",
        "label": "Use of class time was · N/A"
      },
      {
        "tok": "{{k_p2_pInstructorsInterestInStudents_excellent}}",
        "label": "Instructor's interest in student's progress was · Excellent"
      },
      {
        "tok": "{{k_p2_pInstructorsInterestInStudents_good}}",
        "label": "Instructor's interest in student's progress was · Good"
      },
      {
        "tok": "{{k_p2_pInstructorsInterestInStudents_fair}}",
        "label": "Instructor's interest in student's progress was · Fair"
      },
      {
        "tok": "{{k_p2_pInstructorsInterestInStudents_poor}}",
        "label": "Instructor's interest in student's progress was · Poor"
      },
      {
        "tok": "{{k_p2_pInstructorsInterestInStudents_verypoor}}",
        "label": "Instructor's interest in student's progress was · Very poor"
      },
      {
        "tok": "{{k_p2_pInstructorsInterestInStudents_na}}",
        "label": "Instructor's interest in student's progress was · N/A"
      },
      {
        "tok": "{{k_p2_pAmountYouLearnedWas2_excellent}}",
        "label": "Amount you learned was · Excellent"
      },
      {
        "tok": "{{k_p2_pAmountYouLearnedWas2_good}}",
        "label": "Amount you learned was · Good"
      },
      {
        "tok": "{{k_p2_pAmountYouLearnedWas2_fair}}",
        "label": "Amount you learned was · Fair"
      },
      {
        "tok": "{{k_p2_pAmountYouLearnedWas2_poor}}",
        "label": "Amount you learned was · Poor"
      },
      {
        "tok": "{{k_p2_pAmountYouLearnedWas2_verypoor}}",
        "label": "Amount you learned was · Very poor"
      },
      {
        "tok": "{{k_p2_pAmountYouLearnedWas2_na}}",
        "label": "Amount you learned was · N/A"
      },
      {
        "tok": "{{k_p2_pRelevanceOfCourseContent2_excellent}}",
        "label": "Relevance of course content was · Excellent"
      },
      {
        "tok": "{{k_p2_pRelevanceOfCourseContent2_good}}",
        "label": "Relevance of course content was · Good"
      },
      {
        "tok": "{{k_p2_pRelevanceOfCourseContent2_fair}}",
        "label": "Relevance of course content was · Fair"
      },
      {
        "tok": "{{k_p2_pRelevanceOfCourseContent2_poor}}",
        "label": "Relevance of course content was · Poor"
      },
      {
        "tok": "{{k_p2_pRelevanceOfCourseContent2_verypoor}}",
        "label": "Relevance of course content was · Very poor"
      },
      {
        "tok": "{{k_p2_pRelevanceOfCourseContent2_na}}",
        "label": "Relevance of course content was · N/A"
      },
      {
        "tok": "{{k_p2_pGradingTechniquesWere_excellent}}",
        "label": "Grading techniques were · Excellent"
      },
      {
        "tok": "{{k_p2_pGradingTechniquesWere_good}}",
        "label": "Grading techniques were · Good"
      },
      {
        "tok": "{{k_p2_pGradingTechniquesWere_fair}}",
        "label": "Grading techniques were · Fair"
      },
      {
        "tok": "{{k_p2_pGradingTechniquesWere_poor}}",
        "label": "Grading techniques were · Poor"
      },
      {
        "tok": "{{k_p2_pGradingTechniquesWere_verypoor}}",
        "label": "Grading techniques were · Very poor"
      },
      {
        "tok": "{{k_p2_pGradingTechniquesWere_na}}",
        "label": "Grading techniques were · N/A"
      },
      {
        "tok": "{{k_p2_pAmountOfAssignedWork_excellent}}",
        "label": "Amount of assigned work was · Excellent"
      },
      {
        "tok": "{{k_p2_pAmountOfAssignedWork_good}}",
        "label": "Amount of assigned work was · Good"
      },
      {
        "tok": "{{k_p2_pAmountOfAssignedWork_fair}}",
        "label": "Amount of assigned work was · Fair"
      },
      {
        "tok": "{{k_p2_pAmountOfAssignedWork_poor}}",
        "label": "Amount of assigned work was · Poor"
      },
      {
        "tok": "{{k_p2_pAmountOfAssignedWork_verypoor}}",
        "label": "Amount of assigned work was · Very poor"
      },
      {
        "tok": "{{k_p2_pAmountOfAssignedWork_na}}",
        "label": "Amount of assigned work was · N/A"
      },
      {
        "tok": "{{k_p3_pTheTrainingAsA_excellent}}",
        "label": "The training as a whole was · Excellent"
      },
      {
        "tok": "{{k_p3_pTheTrainingAsA_good}}",
        "label": "The training as a whole was · Good"
      },
      {
        "tok": "{{k_p3_pTheTrainingAsA_fair}}",
        "label": "The training as a whole was · Fair"
      },
      {
        "tok": "{{k_p3_pTheTrainingAsA_poor}}",
        "label": "The training as a whole was · Poor"
      },
      {
        "tok": "{{k_p3_pTheTrainingAsA_verypoor}}",
        "label": "The training as a whole was · Very poor"
      },
      {
        "tok": "{{k_p3_pTheTrainingAsA_na}}",
        "label": "The training as a whole was · N/A"
      },
      {
        "tok": "{{k_p3_pTheContentWas_excellent}}",
        "label": "The content was · Excellent"
      },
      {
        "tok": "{{k_p3_pTheContentWas_good}}",
        "label": "The content was · Good"
      },
      {
        "tok": "{{k_p3_pTheContentWas_fair}}",
        "label": "The content was · Fair"
      },
      {
        "tok": "{{k_p3_pTheContentWas_poor}}",
        "label": "The content was · Poor"
      },
      {
        "tok": "{{k_p3_pTheContentWas_verypoor}}",
        "label": "The content was · Very poor"
      },
      {
        "tok": "{{k_p3_pTheContentWas_na}}",
        "label": "The content was · N/A"
      },
      {
        "tok": "{{k_p3_pTheInstructorsContributionTo2_excellent}}",
        "label": "The instructor's contribution to the training was · Excellent"
      },
      {
        "tok": "{{k_p3_pTheInstructorsContributionTo2_good}}",
        "label": "The instructor's contribution to the training was · Good"
      },
      {
        "tok": "{{k_p3_pTheInstructorsContributionTo2_fair}}",
        "label": "The instructor's contribution to the training was · Fair"
      },
      {
        "tok": "{{k_p3_pTheInstructorsContributionTo2_poor}}",
        "label": "The instructor's contribution to the training was · Poor"
      },
      {
        "tok": "{{k_p3_pTheInstructorsContributionTo2_verypoor}}",
        "label": "The instructor's contribution to the training was · Very poor"
      },
      {
        "tok": "{{k_p3_pTheInstructorsContributionTo2_na}}",
        "label": "The instructor's contribution to the training was · N/A"
      },
      {
        "tok": "{{k_p3_pTheInstructorsEffectivenessIn2_excellent}}",
        "label": "The instructor's effectiveness in teaching the training matter was · Excellent"
      },
      {
        "tok": "{{k_p3_pTheInstructorsEffectivenessIn2_good}}",
        "label": "The instructor's effectiveness in teaching the training matter was · Good"
      },
      {
        "tok": "{{k_p3_pTheInstructorsEffectivenessIn2_fair}}",
        "label": "The instructor's effectiveness in teaching the training matter was · Fair"
      },
      {
        "tok": "{{k_p3_pTheInstructorsEffectivenessIn2_poor}}",
        "label": "The instructor's effectiveness in teaching the training matter was · Poor"
      },
      {
        "tok": "{{k_p3_pTheInstructorsEffectivenessIn2_verypoor}}",
        "label": "The instructor's effectiveness in teaching the training matter was · Very poor"
      },
      {
        "tok": "{{k_p3_pTheInstructorsEffectivenessIn2_na}}",
        "label": "The instructor's effectiveness in teaching the training matter was · N/A"
      },
      {
        "tok": "{{k_p3_pHowWasTheTraining_excellent}}",
        "label": "How was the training conducted by instructor · Excellent"
      },
      {
        "tok": "{{k_p3_pHowWasTheTraining_good}}",
        "label": "How was the training conducted by instructor · Good"
      },
      {
        "tok": "{{k_p3_pHowWasTheTraining_fair}}",
        "label": "How was the training conducted by instructor · Fair"
      },
      {
        "tok": "{{k_p3_pHowWasTheTraining_poor}}",
        "label": "How was the training conducted by instructor · Poor"
      },
      {
        "tok": "{{k_p3_pHowWasTheTraining_verypoor}}",
        "label": "How was the training conducted by instructor · Very poor"
      },
      {
        "tok": "{{k_p3_pHowWasTheTraining_na}}",
        "label": "How was the training conducted by instructor · N/A"
      },
      {
        "tok": "{{k_p3_pClarityOfInstructorsVoice2_excellent}}",
        "label": "Clarity of instructor's voice was · Excellent"
      },
      {
        "tok": "{{k_p3_pClarityOfInstructorsVoice2_good}}",
        "label": "Clarity of instructor's voice was · Good"
      },
      {
        "tok": "{{k_p3_pClarityOfInstructorsVoice2_fair}}",
        "label": "Clarity of instructor's voice was · Fair"
      },
      {
        "tok": "{{k_p3_pClarityOfInstructorsVoice2_poor}}",
        "label": "Clarity of instructor's voice was · Poor"
      },
      {
        "tok": "{{k_p3_pClarityOfInstructorsVoice2_verypoor}}",
        "label": "Clarity of instructor's voice was · Very poor"
      },
      {
        "tok": "{{k_p3_pClarityOfInstructorsVoice2_na}}",
        "label": "Clarity of instructor's voice was · N/A"
      },
      {
        "tok": "{{k_p3_pExplanationsByInstructorWere2_excellent}}",
        "label": "Explanations by instructor were · Excellent"
      },
      {
        "tok": "{{k_p3_pExplanationsByInstructorWere2_good}}",
        "label": "Explanations by instructor were · Good"
      },
      {
        "tok": "{{k_p3_pExplanationsByInstructorWere2_fair}}",
        "label": "Explanations by instructor were · Fair"
      },
      {
        "tok": "{{k_p3_pExplanationsByInstructorWere2_poor}}",
        "label": "Explanations by instructor were · Poor"
      },
      {
        "tok": "{{k_p3_pExplanationsByInstructorWere2_verypoor}}",
        "label": "Explanations by instructor were · Very poor"
      },
      {
        "tok": "{{k_p3_pExplanationsByInstructorWere2_na}}",
        "label": "Explanations by instructor were · N/A"
      },
      {
        "tok": "{{k_p3_pInstructorsUseOfExamples2_excellent}}",
        "label": "Instructor's use of examples and illustrations was · Excellent"
      },
      {
        "tok": "{{k_p3_pInstructorsUseOfExamples2_good}}",
        "label": "Instructor's use of examples and illustrations was · Good"
      },
      {
        "tok": "{{k_p3_pInstructorsUseOfExamples2_fair}}",
        "label": "Instructor's use of examples and illustrations was · Fair"
      },
      {
        "tok": "{{k_p3_pInstructorsUseOfExamples2_poor}}",
        "label": "Instructor's use of examples and illustrations was · Poor"
      },
      {
        "tok": "{{k_p3_pInstructorsUseOfExamples2_verypoor}}",
        "label": "Instructor's use of examples and illustrations was · Very poor"
      },
      {
        "tok": "{{k_p3_pInstructorsUseOfExamples2_na}}",
        "label": "Instructor's use of examples and illustrations was · N/A"
      },
      {
        "tok": "{{k_p3_pQualityOfQuestionsOr2_excellent}}",
        "label": "Quality of questions or problems raised by the instructor was · Excellent"
      },
      {
        "tok": "{{k_p3_pQualityOfQuestionsOr2_good}}",
        "label": "Quality of questions or problems raised by the instructor was · Good"
      },
      {
        "tok": "{{k_p3_pQualityOfQuestionsOr2_fair}}",
        "label": "Quality of questions or problems raised by the instructor was · Fair"
      },
      {
        "tok": "{{k_p3_pQualityOfQuestionsOr2_poor}}",
        "label": "Quality of questions or problems raised by the instructor was · Poor"
      },
      {
        "tok": "{{k_p3_pQualityOfQuestionsOr2_verypoor}}",
        "label": "Quality of questions or problems raised by the instructor was · Very poor"
      },
      {
        "tok": "{{k_p3_pQualityOfQuestionsOr2_na}}",
        "label": "Quality of questions or problems raised by the instructor was · N/A"
      },
      {
        "tok": "{{k_p3_pStudentsConfidenceInInstructors2_excellent}}",
        "label": "Student's confidence in instructor's knowledge was · Excellent"
      },
      {
        "tok": "{{k_p3_pStudentsConfidenceInInstructors2_good}}",
        "label": "Student's confidence in instructor's knowledge was · Good"
      },
      {
        "tok": "{{k_p3_pStudentsConfidenceInInstructors2_fair}}",
        "label": "Student's confidence in instructor's knowledge was · Fair"
      },
      {
        "tok": "{{k_p3_pStudentsConfidenceInInstructors2_poor}}",
        "label": "Student's confidence in instructor's knowledge was · Poor"
      },
      {
        "tok": "{{k_p3_pStudentsConfidenceInInstructors2_verypoor}}",
        "label": "Student's confidence in instructor's knowledge was · Very poor"
      },
      {
        "tok": "{{k_p3_pStudentsConfidenceInInstructors2_na}}",
        "label": "Student's confidence in instructor's knowledge was · N/A"
      },
      {
        "tok": "{{k_p3_pInstructorsEnthusiasmWas2_excellent}}",
        "label": "Instructor's enthusiasm was · Excellent"
      },
      {
        "tok": "{{k_p3_pInstructorsEnthusiasmWas2_good}}",
        "label": "Instructor's enthusiasm was · Good"
      },
      {
        "tok": "{{k_p3_pInstructorsEnthusiasmWas2_fair}}",
        "label": "Instructor's enthusiasm was · Fair"
      },
      {
        "tok": "{{k_p3_pInstructorsEnthusiasmWas2_poor}}",
        "label": "Instructor's enthusiasm was · Poor"
      },
      {
        "tok": "{{k_p3_pInstructorsEnthusiasmWas2_verypoor}}",
        "label": "Instructor's enthusiasm was · Very poor"
      },
      {
        "tok": "{{k_p3_pInstructorsEnthusiasmWas2_na}}",
        "label": "Instructor's enthusiasm was · N/A"
      },
      {
        "tok": "{{k_p3_pEncouragementGivenToStudents2_excellent}}",
        "label": "Encouragement given to students to participate was · Excellent"
      },
      {
        "tok": "{{k_p3_pEncouragementGivenToStudents2_good}}",
        "label": "Encouragement given to students to participate was · Good"
      },
      {
        "tok": "{{k_p3_pEncouragementGivenToStudents2_fair}}",
        "label": "Encouragement given to students to participate was · Fair"
      },
      {
        "tok": "{{k_p3_pEncouragementGivenToStudents2_poor}}",
        "label": "Encouragement given to students to participate was · Poor"
      },
      {
        "tok": "{{k_p3_pEncouragementGivenToStudents2_verypoor}}",
        "label": "Encouragement given to students to participate was · Very poor"
      },
      {
        "tok": "{{k_p3_pEncouragementGivenToStudents2_na}}",
        "label": "Encouragement given to students to participate was · N/A"
      },
      {
        "tok": "{{k_p3_pAnswersToStudentQuestions2_excellent}}",
        "label": "Answers to student questions were · Excellent"
      },
      {
        "tok": "{{k_p3_pAnswersToStudentQuestions2_good}}",
        "label": "Answers to student questions were · Good"
      },
      {
        "tok": "{{k_p3_pAnswersToStudentQuestions2_fair}}",
        "label": "Answers to student questions were · Fair"
      },
      {
        "tok": "{{k_p3_pAnswersToStudentQuestions2_poor}}",
        "label": "Answers to student questions were · Poor"
      },
      {
        "tok": "{{k_p3_pAnswersToStudentQuestions2_verypoor}}",
        "label": "Answers to student questions were · Very poor"
      },
      {
        "tok": "{{k_p3_pAnswersToStudentQuestions2_na}}",
        "label": "Answers to student questions were · N/A"
      },
      {
        "tok": "{{k_p3_pInstructorHelpWhenNeeded_excellent}}",
        "label": "Instructor help when needed was · Excellent"
      },
      {
        "tok": "{{k_p3_pInstructorHelpWhenNeeded_good}}",
        "label": "Instructor help when needed was · Good"
      },
      {
        "tok": "{{k_p3_pInstructorHelpWhenNeeded_fair}}",
        "label": "Instructor help when needed was · Fair"
      },
      {
        "tok": "{{k_p3_pInstructorHelpWhenNeeded_poor}}",
        "label": "Instructor help when needed was · Poor"
      },
      {
        "tok": "{{k_p3_pInstructorHelpWhenNeeded_verypoor}}",
        "label": "Instructor help when needed was · Very poor"
      },
      {
        "tok": "{{k_p3_pInstructorHelpWhenNeeded_na}}",
        "label": "Instructor help when needed was · N/A"
      },
      {
        "tok": "{{k_p3_pUseOfTrainingTime_excellent}}",
        "label": "Use of training time was · Excellent"
      },
      {
        "tok": "{{k_p3_pUseOfTrainingTime_good}}",
        "label": "Use of training time was · Good"
      },
      {
        "tok": "{{k_p3_pUseOfTrainingTime_fair}}",
        "label": "Use of training time was · Fair"
      },
      {
        "tok": "{{k_p3_pUseOfTrainingTime_poor}}",
        "label": "Use of training time was · Poor"
      },
      {
        "tok": "{{k_p3_pUseOfTrainingTime_verypoor}}",
        "label": "Use of training time was · Very poor"
      },
      {
        "tok": "{{k_p3_pUseOfTrainingTime_na}}",
        "label": "Use of training time was · N/A"
      },
      {
        "tok": "{{k_p3_pInstructorsInterestInStudents2_excellent}}",
        "label": "Instructor's interest in student's progress was · Excellent"
      },
      {
        "tok": "{{k_p3_pInstructorsInterestInStudents2_good}}",
        "label": "Instructor's interest in student's progress was · Good"
      },
      {
        "tok": "{{k_p3_pInstructorsInterestInStudents2_fair}}",
        "label": "Instructor's interest in student's progress was · Fair"
      },
      {
        "tok": "{{k_p3_pInstructorsInterestInStudents2_poor}}",
        "label": "Instructor's interest in student's progress was · Poor"
      },
      {
        "tok": "{{k_p3_pInstructorsInterestInStudents2_verypoor}}",
        "label": "Instructor's interest in student's progress was · Very poor"
      },
      {
        "tok": "{{k_p3_pInstructorsInterestInStudents2_na}}",
        "label": "Instructor's interest in student's progress was · N/A"
      },
      {
        "tok": "{{k_p3_pAmountYouLearnedWas3_excellent}}",
        "label": "Amount you learned was · Excellent"
      },
      {
        "tok": "{{k_p3_pAmountYouLearnedWas3_good}}",
        "label": "Amount you learned was · Good"
      },
      {
        "tok": "{{k_p3_pAmountYouLearnedWas3_fair}}",
        "label": "Amount you learned was · Fair"
      },
      {
        "tok": "{{k_p3_pAmountYouLearnedWas3_poor}}",
        "label": "Amount you learned was · Poor"
      },
      {
        "tok": "{{k_p3_pAmountYouLearnedWas3_verypoor}}",
        "label": "Amount you learned was · Very poor"
      },
      {
        "tok": "{{k_p3_pAmountYouLearnedWas3_na}}",
        "label": "Amount you learned was · N/A"
      },
      {
        "tok": "{{k_p3_pRelevanceOfTrainingContent_excellent}}",
        "label": "Relevance of training content was · Excellent"
      },
      {
        "tok": "{{k_p3_pRelevanceOfTrainingContent_good}}",
        "label": "Relevance of training content was · Good"
      },
      {
        "tok": "{{k_p3_pRelevanceOfTrainingContent_fair}}",
        "label": "Relevance of training content was · Fair"
      },
      {
        "tok": "{{k_p3_pRelevanceOfTrainingContent_poor}}",
        "label": "Relevance of training content was · Poor"
      },
      {
        "tok": "{{k_p3_pRelevanceOfTrainingContent_verypoor}}",
        "label": "Relevance of training content was · Very poor"
      },
      {
        "tok": "{{k_p3_pRelevanceOfTrainingContent_na}}",
        "label": "Relevance of training content was · N/A"
      },
      {
        "tok": "{{k_p3_pGradingTechniquesWere2_excellent}}",
        "label": "Grading techniques were · Excellent"
      },
      {
        "tok": "{{k_p3_pGradingTechniquesWere2_good}}",
        "label": "Grading techniques were · Good"
      },
      {
        "tok": "{{k_p3_pGradingTechniquesWere2_fair}}",
        "label": "Grading techniques were · Fair"
      },
      {
        "tok": "{{k_p3_pGradingTechniquesWere2_poor}}",
        "label": "Grading techniques were · Poor"
      },
      {
        "tok": "{{k_p3_pGradingTechniquesWere2_verypoor}}",
        "label": "Grading techniques were · Very poor"
      },
      {
        "tok": "{{k_p3_pGradingTechniquesWere2_na}}",
        "label": "Grading techniques were · N/A"
      },
      {
        "tok": "{{k_p3_pAmountOfDiscussedTopics_excellent}}",
        "label": "Amount of discussed topics was · Excellent"
      },
      {
        "tok": "{{k_p3_pAmountOfDiscussedTopics_good}}",
        "label": "Amount of discussed topics was · Good"
      },
      {
        "tok": "{{k_p3_pAmountOfDiscussedTopics_fair}}",
        "label": "Amount of discussed topics was · Fair"
      },
      {
        "tok": "{{k_p3_pAmountOfDiscussedTopics_poor}}",
        "label": "Amount of discussed topics was · Poor"
      },
      {
        "tok": "{{k_p3_pAmountOfDiscussedTopics_verypoor}}",
        "label": "Amount of discussed topics was · Very poor"
      },
      {
        "tok": "{{k_p3_pAmountOfDiscussedTopics_na}}",
        "label": "Amount of discussed topics was · N/A"
      },
      {
        "tok": "{{k_ownEffort_excellent}}",
        "label": "Excellent"
      },
      {
        "tok": "{{k_ownEffort_good}}",
        "label": "Good"
      },
      {
        "tok": "{{k_ownEffort_fair}}",
        "label": "Fair"
      },
      {
        "tok": "{{k_ownEffort_poor}}",
        "label": "Poor"
      },
      {
        "tok": "{{k_ownEffort_verypoor}}",
        "label": "Very poor"
      }
    ],
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
        "label": "FI"
      },
      {
        "tok": "{{k_category_TKI}}",
        "label": "TKI"
      },
      {
        "tok": "{{k_category_Both}}",
        "label": "Both"
      },
      {
        "tok": "{{k_trainType_annual}}",
        "label": "Annual"
      },
      {
        "tok": "{{k_trainType_initial}}",
        "label": "Initial"
      },
      {
        "tok": "{{k_trainType_triggered}}",
        "label": "Triggered"
      },
      {
        "tok": "{{k_trainType_corrective}}",
        "label": "Corrective"
      },
      {
        "tok": "{{k_topics_sop}}",
        "label": "SOPs — flight operations"
      },
      {
        "tok": "{{k_topics_emerg}}",
        "label": "Emergency procedures"
      },
      {
        "tok": "{{k_topics_brief}}",
        "label": "Pre/post-flight briefing"
      },
      {
        "tok": "{{k_topics_manoeuvre}}",
        "label": "Flight manoeuvres / drills"
      },
      {
        "tok": "{{k_topics_checklist}}",
        "label": "Use of checklists"
      },
      {
        "tok": "{{k_topics_technique}}",
        "label": "Instructional techniques"
      },
      {
        "tok": "{{k_topics_feedback}}",
        "label": "Student feedback methods"
      },
      {
        "tok": "{{k_topics_classroom}}",
        "label": "Classroom management"
      },
      {
        "tok": "{{k_topics_pedagogy}}",
        "label": "Teaching methodology"
      },
      {
        "tok": "{{k_topics_assess}}",
        "label": "Student assessment methods"
      },
      {
        "tok": "{{k_topics_compliance}}",
        "label": "Regulatory compliance"
      },
      {
        "tok": "{{k_topics_hpa}}",
        "label": "High-performance aeroplane (T206H)"
      },
      {
        "tok": "{{k_topics_avionics}}",
        "label": "Advanced avionics / G1000"
      },
      {
        "tok": "{{k_topics_docs}}",
        "label": "Documentation / flight logs"
      },
      {
        "tok": "{{k_topics_other}}",
        "label": "Other"
      },
      {
        "tok": "{{k_method_observation}}",
        "label": "Observation"
      },
      {
        "tok": "{{k_method_oral}}",
        "label": "Oral"
      },
      {
        "tok": "{{k_method_practical}}",
        "label": "Practical"
      },
      {
        "tok": "{{k_outcome_standardised}}",
        "label": "Standardised"
      },
      {
        "tok": "{{k_outcome_followup}}",
        "label": "Requires follow-up"
      }
    ],
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
        "label": "Safety hazard"
      },
      {
        "tok": "{{k_evType_incident}}",
        "label": "Incident"
      },
      {
        "tok": "{{k_evType_nearmiss}}",
        "label": "Near-miss"
      },
      {
        "tok": "{{k_evType_unsafe}}",
        "label": "Unsafe act / condition"
      },
      {
        "tok": "{{k_evType_other}}",
        "label": "Other"
      }
    ],
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
