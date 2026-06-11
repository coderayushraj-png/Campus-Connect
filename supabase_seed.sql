-- ==============================================================================
-- CAMPUS CONNECT - SUPABASE SEED DATA
-- College: Maharishi Markandeshwar University (MMDU), Ambala, Haryana
-- ==============================================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SECTION 1: EVENTS SEED DATA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO public.events (
  id, title, description, event_type, date, venue, registration_link, 
  is_paid, fee, is_pinned, is_active, created_by
) VALUES 
(
  gen_random_uuid(),
  'Tech Workshop: Web Dev Bootcamp',
  'Hands-on session covering HTML, CSS, JavaScript, React and Vercel deployment. Certificates will be provided to all participants.',
  'workshop',
  NOW() + INTERVAL '2 days',
  'CS Lab, Block B, MMDU',
  'https://forms.google.com/campus-connect',
  false,
  0,
  true,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Annual Cultural Fest – Utsav 2026',
  'Annual cultural extravaganza featuring music, dance, drama and art competitions. Open for all branches and semesters.',
  'cultural',
  NOW() + INTERVAL '5 days',
  'Main Auditorium, MMDU',
  'https://forms.google.com/utsav2026',
  true,
  99,
  false,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'National Coding Competition – CodeStorm',
  'Compete in Data Structures and Algorithms challenges. Win exciting cash prizes worth ₹50,000. Individual and team participation allowed.',
  'tech',
  NOW() + INTERVAL '7 days',
  'Exam Hall, Block A, MMDU',
  'https://forms.google.com/codestorm',
  false,
  0,
  false,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Inter-College Sports Tournament',
  'Annual sports tournament featuring cricket, football, basketball and athletics events. Represent your college and win!',
  'sports',
  NOW() + INTERVAL '10 days',
  'Sports Complex, MMDU',
  'https://forms.google.com/sports2026',
  false,
  0,
  false,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'AI & Machine Learning Career Seminar',
  'Industry experts from Google and Microsoft will discuss AI career paths, required skills and future opportunities in tech.',
  'seminar',
  NOW() + INTERVAL '4 days',
  'Seminar Hall, Admin Block',
  'https://forms.google.com/aiml-seminar',
  true,
  50,
  false,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Robotics Workshop for Beginners',
  'Build your first robot from scratch with step-by-step guidance from faculty experts. Components provided.',
  'workshop',
  NOW() + INTERVAL '14 days',
  'Robotics Lab, Block C',
  'https://forms.google.com/robotics',
  true,
  200,
  false,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Hackathon 2026 – Build for Bharat',
  '24-hour hackathon to build solutions for real Indian problems. Teams of 3-4 students. First prize: ₹1,00,000.',
  'tech',
  NOW() + INTERVAL '20 days',
  'Innovation Center, MMDU',
  'https://forms.google.com/hackathon2026',
  false,
  0,
  true,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Personality Development Workshop',
  'Improve your communication, leadership and interview skills with expert trainers from industry. Highly recommended for final year students.',
  'seminar',
  NOW() + INTERVAL '8 days',
  'Conference Room, Admin Block',
  'https://forms.google.com/pdw2026',
  false,
  0,
  false,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SECTION 2: NOTICES SEED DATA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO public.notices (
  id, title, content, notice_type, target_audience, is_important, expires_at, created_by
) VALUES 
(
  gen_random_uuid(),
  'Examination Form Submission – End Semester May 2026',
  'All students of Semester 2, 4, 6 and 8 are hereby informed that the examination forms for End Semester Examination May 2026 are available on the student portal. Last date for submission without late fee is 20 May 2026. Late fee of ₹500 will be applicable after 20 May 2026. Students must verify their subject registrations before submitting the form. Contact the examination section for any queries.',
  'exam',
  'all',
  true,
  NOW() + INTERVAL '15 days',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'TCS Campus Recruitment Drive 2026 – Eligibility and Process',
  'Tata Consultancy Services (TCS) will be conducting campus recruitment at MMDU on 25 May 2026. Eligible students from CSE, ECE and IT branches with minimum 7.0 CGPA and no active backlogs can apply. Online assessment will be followed by technical and HR interviews. Package offered: ₹3.36 LPA to ₹7 LPA based on performance. Registration deadline: 18 May 2026. Contact the Placement Cell for details.',
  'placement',
  'all',
  true,
  NOW() + INTERVAL '20 days',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Summer Vacation Schedule 2026 – College Closure Dates',
  'This is to inform all students and faculty that the college will remain closed for Summer Vacation from 1 June 2026 to 30 June 2026. The college will reopen on 1 July 2026. All pending assignments and projects must be submitted before 30 May 2026. Hostel students may contact the hostel warden for accommodation during vacation period.',
  'holiday',
  'all',
  false,
  NOW() + INTERVAL '40 days',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Fee Payment Deadline – Annual Tuition Fee 2026-27',
  'Students who have not yet paid their annual tuition fee for the academic year 2026-27 are requested to clear their dues immediately. Last date for payment without penalty is 25 May 2026. A fine of ₹100 per day will be charged after the due date. Payment can be made online via the student portal or at the accounts section from 9 AM to 4 PM on all working days.',
  'fee',
  'all',
  true,
  NOW() + INTERVAL '10 days',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Library Book Return Notice – End of Semester',
  'All students are requested to return borrowed library books before 25 May 2026. Books not returned by the due date will attract a fine of ₹5 per day per book. Students with pending library dues will not be issued their hall tickets for the upcoming examinations. Library will remain open from 8 AM to 8 PM on all working days.',
  'general',
  'all',
  false,
  NOW() + INTERVAL '12 days',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'NPTEL Online Certification Course Enrollment Open',
  'Students interested in pursuing NPTEL online certification courses for the July-October 2026 semester can now register on the NPTEL portal. These courses offer academic credits as per UGC guidelines. Last date for enrollment: 31 May 2026. Courses available in CSE, ECE, Management and other domains. Visit swayam.gov.in for details.',
  'general',
  'all',
  false,
  NOW() + INTERVAL '25 days',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Result Declaration – Mid Semester Examination March 2026',
  'Results for Mid Semester Examination held in March 2026 have been declared and are available on the student portal. Students may login to view their marks. Any discrepancy in marks should be reported to the respective subject teacher within 7 days of result declaration. No complaints will be entertained after the specified period.',
  'result',
  'all',
  false,
  NOW() + INTERVAL '30 days',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Anti-Ragging Committee – Student Awareness Notice',
  'This is to inform all students that ragging in any form is strictly prohibited as per UGC regulations and Supreme Court directions. Any incident of ragging should be immediately reported to the Anti-Ragging Committee or call helpline: 1800-180-5522. Strict disciplinary action will be taken against offenders including suspension and rustication.',
  'general',
  'all',
  false,
  NOW() + INTERVAL '365 days',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SECTION 3: PLACEMENTS SEED DATA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO public.placement_drives (
  id, company, role, job_type, description, eligibility_cgpa, eligible_branches, 
  package, deadline, apply_link, is_active, created_by
) VALUES 
(
  gen_random_uuid(),
  'Tata Consultancy Services',
  'Software Engineer',
  'full_time',
  'TCS is hiring fresh graduates for their Digital and Cognitive Business Operations unit. Selected candidates will undergo initial training at TCS facilities before being deployed on projects.',
  7.0,
  ARRAY['CSE','ECE','IT'],
  '₹3.36 LPA - ₹7 LPA',
  NOW() + INTERVAL '3 days',
  'https://nextstep.tcs.com',
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Wipro Technologies',
  'Project Engineer',
  'full_time',
  'Wipro is looking for talented engineers to join their growing technology services team. Role involves working on enterprise software solutions for global clients.',
  6.5,
  ARRAY['CSE','ECE','ME','IT','EE'],
  '₹3.5 LPA',
  NOW() + INTERVAL '7 days',
  'https://careers.wipro.com',
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Infosys Limited',
  'Systems Engineer',
  'full_time',
  'Infosys Systems Engineer role involves developing, testing and maintaining software applications. Training provided at Infosys Mysore campus before project assignment.',
  6.0,
  ARRAY['CSE','ECE','ME','CE','EE','IT'],
  '₹3.6 LPA',
  NOW() + INTERVAL '12 days',
  'https://career.infosys.com',
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Accenture India',
  'Associate Software Engineer',
  'full_time',
  'Accenture is hiring Associate Software Engineers to work on cutting-edge technology projects for global Fortune 500 clients across various industry verticals.',
  6.5,
  ARRAY['CSE','ECE','IT'],
  '₹4.5 LPA',
  NOW() + INTERVAL '18 days',
  'https://www.accenture.com/careers',
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Amazon India',
  'SDE Intern',
  'internship',
  'Amazon is offering a 6-month paid internship for pre-final year students. Interns will work on real Amazon products alongside experienced engineers. PPO opportunity for top performers.',
  8.0,
  ARRAY['CSE','IT'],
  '₹80,000/month',
  NOW() + INTERVAL '5 days',
  'https://amazon.jobs/internship',
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'HCL Technologies',
  'Graduate Engineer Trainee',
  'full_time',
  'HCL Technologies is recruiting Graduate Engineer Trainees for their IT infrastructure and software development divisions. Comprehensive training program included.',
  6.0,
  ARRAY['CSE','ECE','ME','EE','CE','IT'],
  '₹3.22 LPA',
  NOW() + INTERVAL '15 days',
  'https://careers.hcltech.com',
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Capgemini India',
  'Analyst',
  'full_time',
  'Capgemini is looking for fresh graduates to join as Analysts in their technology and consulting divisions. Roles available in multiple service lines including cloud, AI and cybersecurity.',
  6.0,
  ARRAY['CSE','ECE','IT','ME'],
  '₹3.8 LPA',
  NOW() + INTERVAL '22 days',
  'https://www.capgemini.com/careers',
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Microsoft India',
  'Software Development Engineer',
  'full_time',
  'Microsoft is hiring exceptional engineers to work on Azure, Office 365 and other Microsoft products. Candidates must have strong DSA and system design skills.',
  8.5,
  ARRAY['CSE','IT'],
  '₹40 LPA',
  NOW() + INTERVAL '30 days',
  'https://careers.microsoft.com',
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SECTION 4: NOTES SEED DATA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO public.notes (
  id, title, description, subject, semester, branch, file_url, file_type, 
  file_size, download_count, uploaded_by
) VALUES 
(
  gen_random_uuid(),
  'Data Structures & Algorithms – Complete Unit 3 Notes',
  'Covers trees, graphs, heap, hashing with diagrams and solved examples',
  'Data Structures & Algorithms',
  4,
  'CSE',
  'https://example.com/dsa-unit3.pdf',
  'pdf',
  2457600,
  145,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Object Oriented Programming – Full Semester Notes with Examples',
  'Complete OOP notes covering inheritance, polymorphism, encapsulation and abstraction with Java examples',
  'Object Oriented Programming',
  3,
  'CSE',
  'https://example.com/oop-full.pdf',
  'pdf',
  3145728,
  203,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Computer Networks – OSI Model, TCP/IP and Protocols',
  'Detailed notes on network layers, protocols, IP addressing, routing and subnetting with diagrams',
  'Computer Networks',
  4,
  'CSE',
  'https://example.com/cn-notes.pdf',
  'pdf',
  1887436,
  178,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'DBMS Complete Notes with SQL Queries and Normalization',
  'ER diagrams, normalization up to BCNF, transactions, concurrency control and complete SQL reference',
  'Database Management System',
  4,
  'CSE',
  'https://example.com/dbms.pdf',
  'pdf',
  2621440,
  267,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Operating Systems – Process Management and Memory',
  'Process scheduling algorithms, deadlock, memory management, paging, segmentation and virtual memory explained',
  'Operating Systems',
  5,
  'CSE',
  'https://example.com/os-notes.pdf',
  'pdf',
  2097152,
  156,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Mathematics – Calculus and Linear Algebra Unit 1-4',
  'Differential calculus, integral calculus, matrices, eigenvalues and eigenvectors with practice problems',
  'Engineering Mathematics',
  2,
  NULL,
  'https://example.com/maths.pdf',
  'pdf',
  3670016,
  312,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Software Engineering – SDLC Models and Agile Notes',
  'Waterfall, Spiral, Agile, Scrum framework, UML diagrams and software testing methodologies PYQ included',
  'Software Engineering',
  5,
  'CSE',
  'https://example.com/se-notes.pdf',
  'pdf',
  1572864,
  134,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Digital Electronics – Logic Gates and Boolean Algebra',
  'Logic gates, Boolean algebra, Karnaugh maps, flip-flops, counters and combinational circuits with diagrams',
  'Digital Electronics',
  3,
  'ECE',
  'https://example.com/de-notes.pdf',
  'pdf',
  2359296,
  89,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SECTION 5: FORUM POSTS SEED DATA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO public.forum_posts (
  id, title, content, subject, tags, upvotes, views, is_solved, is_pinned, posted_by
) VALUES 
(
  gen_random_uuid(),
  'How to solve Dynamic Programming problems in exams?',
  'I always struggle with DP problems in exams. I understand the concept but cannot identify when to apply DP and how to form the recurrence relation. Can someone share tips and approach for solving DP problems step by step?',
  'Data Structures & Algorithms',
  ARRAY['dp','recursion','exam-prep','algorithms'],
  24,
  156,
  true,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Best resources for Computer Networks exam preparation?',
  'Our CN exam is next week and I need good resources to study. Which chapters are most important for the exam? Any good YouTube channels or books you recommend?',
  'Computer Networks',
  ARRAY['cn','exam','resources','networking'],
  18,
  203,
  false,
  false,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'TCS NQT preparation tips and important topics?',
  'TCS campus drive is coming soon. I need guidance on how to prepare for TCS NQT. What are the important sections? How much time to spend on each? What is the cutoff marks usually?',
  'Placement Preparation',
  ARRAY['tcs','nqt','placement','interview'],
  31,
  412,
  true,
  false,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Difference between TCP and UDP with examples?',
  'I understand the theoretical difference between TCP and UDP but I cannot explain it with proper examples in exams. Can someone explain in simple terms with real-world use cases for both?',
  'Computer Networks',
  ARRAY['tcp','udp','networking','protocols'],
  15,
  178,
  true,
  false,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'DBMS normalization 1NF 2NF 3NF BCNF confused?',
  'I keep getting confused between different normal forms. What is the exact difference and when do we apply each? Can someone explain with a simple example table showing each normalization step?',
  'Database Management System',
  ARRAY['dbms','normalization','3nf','bcnf'],
  22,
  289,
  true,
  false,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'How to prepare for Amazon internship interview?',
  'I got shortlisted for Amazon internship and have the online assessment next week. What topics should I focus on? How hard is the DSA round? Any tips from people who have already given Amazon interviews?',
  'Placement Preparation',
  ARRAY['amazon','internship','dsa','interview'],
  45,
  567,
  false,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Operating System deadlock conditions and prevention?',
  'Can someone explain the 4 necessary conditions for deadlock in a simple way? Also what are the different deadlock handling strategies and when to use each one?',
  'Operating Systems',
  ARRAY['os','deadlock','prevention','exam'],
  19,
  234,
  true,
  false,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Which programming language to learn first for placements?',
  'I am in 3rd semester and want to start preparing for placements early. Should I focus on C++, Java or Python for DSA practice? Which is preferred by companies like TCS, Infosys and Wipro?',
  'General',
  ARRAY['programming','career','placement','dsa'],
  38,
  445,
  false,
  false,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SECTION 6: LOST & FOUND SEED DATA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO public.lost_found_items (
  id, title, description, category, image_url, location_found, status, contact_info, posted_by
) VALUES 
(
  gen_random_uuid(),
  'Blue Dell Laptop Bag – Contains Important Notes',
  'Lost a blue Dell laptop bag containing a laptop, charger and handwritten notes. Last seen near Library entrance. Please contact if found. Reward will be given.',
  'bag',
  NULL,
  'Library Entrance, MMDU',
  'lost',
  '9876543210',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'iPhone 13 – Black Color with Cracked Screen',
  'Found an iPhone 13 in black color with cracked screen near the canteen area. Phone is locked. Owner can collect by verifying phone number and lock screen details.',
  'phone',
  NULL,
  'Canteen, Block D',
  'found',
  '9812345678',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Honda Bike Keys with Red Keychain',
  'Lost Honda bike keys with a distinctive red heart keychain. Keys were lost somewhere between Gate 3 and the CS Department. Please contact if found.',
  'keys',
  NULL,
  'Between Gate 3 and CS Department',
  'lost',
  '9988776655',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'College ID Card – Rahul Sharma CSE 4th Sem',
  'Lost my college ID card near the examination hall. ID card belongs to Rahul Sharma, Roll No: 2024CSE045, 4th Semester CSE. Please deposit at Admin Office or contact directly.',
  'id_card',
  NULL,
  'Examination Hall, Block A',
  'lost',
  'rahul2024@mmdu.ac.in',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Black JBL Earphones Found in Library',
  'Found a pair of black JBL wireless earphones on Table 12 of the library reading room. Earphones are in good condition and are kept with the librarian. Owner can collect with ID proof.',
  'earphones',
  NULL,
  'Library Reading Room, Table 12',
  'found',
  'library@mmdu.ac.in',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Brown Leather Wallet Near Parking Area',
  'Found a brown leather wallet containing some cash and cards near the two-wheeler parking area. Wallet has been submitted to the security guard at Gate 1. Owner can collect with ID proof.',
  'wallet',
  NULL,
  'Two-Wheeler Parking, Gate 1',
  'found',
  'security@mmdu.ac.in',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SECTION 7: CLUBS SEED DATA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO public.clubs (
  id, name, description, category, instagram_link, member_count, is_active, created_by
) VALUES 
(
  gen_random_uuid(),
  'Google Developer Student Club – MMDU',
  'GDSC MMDU is a student community group supported by Google Developers. We organize workshops, hackathons and study jams on Google technologies including Android, Cloud, Web and AI/ML. Open to all branches.',
  'technical',
  '@gdsc_mmdu',
  142,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Cultural Society – Rang Manch MMDU',
  'Rang Manch is the official cultural club of MMDU. We organize dance, music, drama, art and literary events throughout the year including the Annual Cultural Fest Utsav. All creative talents welcome.',
  'cultural',
  '@rangmanch_mmdu',
  198,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Sports Club – Champions MMDU',
  'Champions Sports Club promotes physical fitness and sporting culture at MMDU. We manage cricket, football, basketball and athletics teams representing MMDU in inter-college competitions.',
  'sports',
  '@champions_mmdu',
  234,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Coding Club – ByteForce MMDU',
  'ByteForce is MMDU coding club focused on competitive programming, DSA practice and placement preparation. We host weekly coding contests, mock interviews and DSA workshops.',
  'technical',
  '@byteforce_mmdu',
  167,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Photography Club – Lens & Light MMDU',
  'Lens & Light captures the beautiful moments of MMDU campus life. We organize photo walks, exhibitions and photography workshops. DSLR and mobile photographers both welcome.',
  'creative',
  '@lenslight_mmdu',
  89,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'NSS Unit – National Service Scheme MMDU',
  'NSS MMDU unit is dedicated to community service and social welfare activities. We organize blood donation camps, tree plantation drives, cleanliness campaigns and awareness programs.',
  'social',
  '@nss_mmdu',
  312,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SECTION 8: DEADLINES SEED DATA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO public.deadlines (
  id, title, date, type, target_branches, is_active, created_by
) VALUES 
(
  gen_random_uuid(),
  'TCS Campus Drive Application Deadline',
  NOW() + INTERVAL '3 days',
  'placement',
  ARRAY['CSE','ECE','IT'],
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Examination Form Submission Last Date',
  NOW() + INTERVAL '5 days',
  'exam',
  ARRAY[]::text[],
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Amazon Internship Online Assessment',
  NOW() + INTERVAL '5 days',
  'placement',
  ARRAY['CSE','IT'],
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Annual Fee Payment Without Penalty',
  NOW() + INTERVAL '10 days',
  'fee',
  ARRAY[]::text[],
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
  gen_random_uuid(),
  'Library Book Return Due Date',
  NOW() + INTERVAL '12 days',
  'general',
  ARRAY[]::text[],
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);
