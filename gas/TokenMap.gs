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
