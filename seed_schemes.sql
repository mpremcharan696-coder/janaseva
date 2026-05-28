-- Example script to add schemes to the Neon database
-- You can run this in the Neon SQL Editor or via your migration/seed script

INSERT INTO schemes (
    title, 
    category, 
    ministry, 
    benefits, 
    eligibility_criteria, 
    documents_required, 
    application_process, 
    deadline, 
    is_active
) VALUES 
(
    'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    'Agriculture',
    'Ministry of Agriculture and Farmers Welfare',
    'Income support of ₹6,000 per year in three equal installments to all landholding farmer families.',
    '{"occupation": ["farmer"]}',
    '{"Aadhar Card", "Bank Account Details", "Land Holding Documents"}',
    'Eligible farmers can apply through the PM-KISAN portal or via Common Service Centres (CSCs).',
    '2026-12-31 23:59:59+00',
    TRUE
),
(
    'Post Matric Scholarship Scheme for Minorities',
    'Education',
    'Ministry of Minority Affairs',
    'Financial assistance to meritorious students belonging to minority communities to pursue higher education.',
    '{"gender": ["Male", "Female", "Other"], "occupation": ["student"]}',
    '{"Aadhar Card", "Income Certificate", "Previous Year Marksheet", "Bank Passbook", "Community Certificate"}',
    'Apply online through the National Scholarship Portal (NSP).',
    '2026-10-31 23:59:59+00',
    TRUE
),
(
    'Women Entrepreneurship Program (WEP)',
    'Business & Startups',
    'Ministry of MSME',
    'Special grants and low-interest loans up to ₹5 lakh for female founders.',
    '{"gender": ["Female"], "occupation": ["business", "founder"]}',
    '{"Aadhar Card", "PAN Card", "Business Registration", "Income Certificate"}',
    'Apply through the MSME online portal.',
    NULL,
    TRUE
);
