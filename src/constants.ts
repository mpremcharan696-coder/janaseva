/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Scheme } from "./types";

export const MOCK_SCHEMES: Scheme[] = [
  {
    id: "scheme_1",
    name: "Farmer Support Initiative (FSI)",
    category: "Agriculture",
    shortDescription: "Direct income support and subsidy for equipment.",
    description: "The Farmer Support Initiative provides financial assistance of up to ₹50,000 annually to small-scale farmers, along with a 65% subsidy on irrigation equipment.",
    eligibility: [
      "Must be a registered farmer",
      "Annual household income below ₹3,00,000",
      "Landholding must be less than 2 hectares"
    ],
    benefits: [
      "Annual income support of ₹50,000",
      "65% subsidy on equipment",
      "Free soil testing and consultation"
    ],
    documentation: [
      "Identity Proof (Aadhaar/Voter ID)",
      "Land ownership documents (Patta/Bhu-naksha)",
      "Income Certificate",
      "Bank Account Details"
    ],
    procedures: [
      "Verify eligibility via SchemeSetu engine",
      "Upload required land and identity documents",
      "Submit application to local agriculture office",
      "Site verification by designated official",
      "Direct Benefit Transfer (DBT) to bank account"
    ],
    deadline: "2026-12-31",
    estimatedProcessingTime: "15-30 working days",
    translations: {
      hi: {
        name: "किसान सहायता पहल (FSI)",
        shortDescription: "प्रत्यक्ष आय सहायता और उपकरणों के लिए सब्सिडी।",
        description: "किसान सहायता पहल छोटे पैमाने के किसानों को सालाना ₹50,000 तक की वित्तीय सहायता प्रदान करती है, साथ ही सिंचाई उपकरणों पर 65% सब्सिडी भी देती है।",
        procedures: [
          "SchemeSetu इंजन के माध्यम से पात्रता सत्यापित करें",
          "आवश्यक भूमि और पहचान दस्तावेज अपलोड करें",
          "स्थानीय कृषि कार्यालय में आवेदन जमा करें",
          "नामित अधिकारी द्वारा साइट सत्यापन",
          "बैंक खाते में प्रत्यक्ष लाभ हस्तांतरण (DBT)"
        ]
      },
      te: {
        name: "రైతు మద్దతు చొరవ (FSI)",
        shortDescription: "నేరుగా ఆదాయ సహాయం మరియు పరికరాల కోసం సబ్సిడీ.",
        description: "రైతు మద్దతు చొరవ చిన్న తరహా రైతులకు ఏటా ₹50,000 వరకు ఆర్థిక సహాయాన్ని అందిస్తుంది, అలాగే నీటి పారుదల పరికరాలపై 65% సబ్సిడీని అందిస్తుంది.",
        procedures: [
          "SchemeSetu ఇంజిన్ ద్వారా అర్హతను ధృవీకరించండి",
          "అవసరమైన భూమి మరియు గుర్తింపు పత్రాలను అప్‌లోడ్ చేయండి",
          "స్థానిక వ్యవసాయ కార్యాలయంలో దరఖాస్తును సమర్పించండి",
          "నియమించబడిన అధికారి ద్వారా సైట్ ధృవీకరణ",
          "బ్యాంక్ ఖాతాకు నేరుగా నగదు బదిలీ (DBT)"
        ]
      }
    }
  },
  {
    id: "scheme_2",
    name: "Unified Education Scholarship",
    category: "Education",
    shortDescription: "Merit-cum-means scholarship for higher education.",
    description: "Supports students from economically backward backgrounds to pursue undergraduate and postgraduate degrees with tuition waivers and a monthly stipend.",
    eligibility: [
      "Student must be enrolled in a recognized institution",
      "Minimum 60% marks in previous qualifying exam",
      "Annual family income below ₹5,00,000"
    ],
    benefits: [
      "Full tuition fee reimbursement",
      "Monthly stipend of ₹2,500",
      "Internet data allowance for digital learning"
    ],
    documentation: [
      "Previous year academic transcripts",
      "Admission letter from institution",
      "Income Certificate",
      "Bank Passbook"
    ],
    procedures: [
      "Fill online scholarship form",
      "Attach verified digital transcripts",
      "Institution verification phase",
      "Selection based on merit and financial need",
      "Funds disbursement via institutional portal"
    ],
    deadline: "2026-08-15",
    estimatedProcessingTime: "45-60 working days",
    translations: {
      hi: {
        name: "एकीकृत शिक्षा छात्रवृत्ति",
        shortDescription: "उच्च शिक्षा के लिए योग्यता-सह-साधन छात्रवृत्ति।",
        description: "शिक्षण शुल्क छूट और मासिक वजीफे के साथ स्नातक और स्नातकोत्तर डिग्री हासिल करने के लिए आर्थिक रूप से पिछड़े छात्रों का समर्थन करता है।",
        procedures: [
          "ऑनलाइन छात्रवृत्ति फॉर्म भरें",
          "सत्यापित डिजिटल ट्रांसक्रिप्ट संलग्न करें",
          "संस्थान सत्यापन चरण",
          "योग्यता और वित्तीय आवश्यकता के आधार पर चयन",
          "संस्थागत पोर्टल के माध्यम से धन संवितरण"
        ]
      },
      te: {
        name: "ఏకీకృత విద్యా స్కాలర్‌షిప్",
        shortDescription: "ఉన్నత విద్య కోసం మెరిట్-కమ్-మీన్స్ స్కాలర్‌షిప్.",
        description: "ట్యూషన్ మినహాయింపులు మరియు నెలవారీ స్టైపెండ్‌తో అండర్ గ్రాడ్యుయేట్ మరియు పోస్ట్ గ్రాడ్యుయేట్ డిగ్రీలను అభ్యసించడానికి ఆర్థికంగా వెనుకబడిన నేపథ్యాల విద్యార్థులకు మద్దతు ఇస్తుంది.",
        procedures: [
          "ఆన్‌లైన్ స్కాలర్‌షిప్ ఫారమ్‌ను పూరించండి",
          "ధృవీకరించబడిన డిజిటల్ ట్రాన్స్‌క్రిప్ట్‌లను జోడించండి",
          "సంస్థ ధృవీకరణ దశ",
          "మెరిట్ మరియు ఆర్థిక అవసరాల ఆధారంగా ఎంపిక",
          "సంస్థాగత పోర్టల్ ద్వారా నిధుల పంపిణీ"
        ]
      }
    }
  },
  {
    id: "scheme_3",
    name: "Senior Health & Wellness Card",
    category: "Healthcare",
    shortDescription: "Comprehensive healthcare coverage for citizens above 60.",
    description: "Provides free OPD consultations, subsidized medication, and specialized geriatric care at participating network hospitals.",
    eligibility: [
      "Age must be 60 years or above",
      "Permanent resident status",
      "Not enrolled in any other government health insurance"
    ],
    benefits: [
      "Free outdoor patient (OPD) care",
      "75% discount on generic medicines",
      "Home-care nursing assistance for chronic conditions"
    ],
    documentation: [
      "Age proof (Birth Certificate/Aadhaar)",
      "Residential certificate",
      "Recent passport-sized photographs"
    ],
    procedures: [
      "Register at the nearest primary health center",
      "Receive biometric-linked Health Card",
      "Use card at network hospitals for cashless treatment"
    ],
    estimatedProcessingTime: "7-10 working days"
  },
  {
    id: "scheme_4",
    name: "Skill Up: Digital Literacy Grant",
    category: "Employment",
    shortDescription: "Funding for digital skills certification and laptop subsidy.",
    description: "Helps youth and unemployed individuals gain essential digital skills with accredited courses and financial aid for hardware.",
    eligibility: [
      "Aged 18-35 years",
      "Unemployed or currently earning below ₹2,00,000",
      "Completed secondary education (10th/12th)"
    ],
    benefits: [
      "Full fee waiver for selected tech courses",
      "₹15,000 subsidy on laptop purchase",
      "Job placement assistance"
    ],
    documentation: [
      "Educational certificates",
      "Unemployment declaration",
      "Aadhaar Card"
    ],
    procedures: [
      "Register on the SkillUp portal via SchemeSetu link",
      "Select an accredited course from the list",
      "Verify education documents with AI scanner",
      "Receive voucher for course and hardware"
    ],
    deadline: "2026-10-30",
    estimatedProcessingTime: "15 working days"
  },
  {
    id: "scheme_5",
    name: "Saksham: Women Entrepreneurship Fund",
    category: "Social Welfare",
    shortDescription: "Zero-interest loans and mentoring for women-led startups.",
    description: "Empowers women entrepreneurs by providing capital, training, and a network of mentors for small and medium businesses.",
    eligibility: [
      "Business must be 51%+ owned by a woman",
      "Annual turnover below ₹20,00,000",
      "Minimum 1 year of operation"
    ],
    benefits: [
      "Interest-free loans up to ₹5,00,000",
      "Mentorship from industry pioneers",
      "Access to government trade fairs"
    ],
    documentation: [
      "Business registration certificate",
      "Aadhaar of the primary owner",
      "Bank statement of last 12 months",
      "Project report for loan utilization"
    ],
    procedures: [
      "Submit business profile and project report",
      "AI-analysis of business viability",
      "Interview with the district review board",
      "Sanction and disbursement of funds"
    ],
    deadline: "2026-09-01",
    estimatedProcessingTime: "60-90 working days"
  }
];

