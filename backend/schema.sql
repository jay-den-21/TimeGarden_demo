DROP DATABASE IF EXISTS TimeGarden;
CREATE DATABASE TimeGarden;
USE TimeGarden;

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Wallets Table
CREATE TABLE wallets (
    user_id INT PRIMARY KEY,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    escrow_balance DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tasks Table
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poster_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    budget DECIMAL(10, 2) NOT NULL,
    deadline DATE,
    status ENUM('open', 'in_progress', 'completed', 'cancelled', 'active', 'awaiting_review', 'disputed') DEFAULT 'open',
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poster_id) REFERENCES users(id)
);

-- 4. Skills Table
CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE,
    category VARCHAR(50)
);

-- 5. Task Skills (Many-to-Many)
CREATE TABLE task_skills (
    task_id INT,
    skill_id INT,
    PRIMARY KEY (task_id, skill_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 6. Proposals Table
CREATE TABLE proposals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    applicant_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    message TEXT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Contracts Table
CREATE TABLE contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proposal_id INT NOT NULL,
    requester_id INT NOT NULL,
    provider_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('awaiting_escrow', 'active', 'delivered', 'completed', 'disputed', 'cancelled', 'in_progress', 'awaiting_review') DEFAULT 'awaiting_escrow',
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id),
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (provider_id) REFERENCES users(id)
);

-- 8. Transactions Table
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT NOT NULL,
    contract_id INT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('escrow_lock', 'escrow_release', 'refund', 'debit', 'credit', 'deposit', 'withdrawal'),
    status VARCHAR(50) DEFAULT 'success',
    FOREIGN KEY (wallet_id) REFERENCES wallets(user_id),
    FOREIGN KEY (contract_id) REFERENCES contracts(id)
);

-- 9. Threads Table
CREATE TABLE threads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- 10. Thread Participants Table
CREATE TABLE thread_participants (
    thread_id INT,
    user_id INT,
    role VARCHAR(20),
    PRIMARY KEY (thread_id, user_id),
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Messages Table
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    thread_id INT NOT NULL,
    user_id INT NOT NULL,
    body TEXT,
    attachments VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 12. Reviews Table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    rating INT,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (reviewee_id) REFERENCES users(id)
);

-- =============================================
-- SEED DATA (Inserts mock data into tables)
-- =============================================

INSERT INTO users (id, name, email, display_name) VALUES
(1, 'Alice Johnson', 'alice@gmail.com', 'AliceJ'),
(2, 'Bob Smith', 'bob@gmail.com', 'Bobby'),
(3, 'Carol White', 'carol@gmail.com', 'CarolW'),
(4, 'David Brown', 'david@gmail.com', 'Dave'),
(5, 'Eva Green', 'eva@gmail.com', 'Evie'),
(6, 'Frank Harris', 'frank@gmail.com', 'FrankH'),
(7, 'Grace Lee', 'grace@gmail.com', 'Gracie'),
(8, 'Henry Clark', 'henry@gmail.com', 'HenryC'),
(9, 'Ivy Adams', 'ivy@gmail.com', 'IvyA'),
(10, 'Jack Turner', 'jack@gmail.com', 'JackT');

INSERT INTO wallets (user_id, balance, escrow_balance) VALUES
(1, 240.00, 108.00),
(2, 185.00, 88.00),
(3, 205.00, 68.00),
(4, 170.00, 0.00),
(5, 340.00, 150.00),
(6, 155.00, 92.00),
(7, 275.00, 80.00),
(8, 115.00, 0.00),
(9, 195.00, 0.00),
(10, 140.00, 205.00);

INSERT INTO skills (id, name, category) VALUES
(1, 'Python Programming', 'Tech'),
(2, 'Graphic Design', 'Creative'),
(3, 'Content Strategy', 'Writing'),
(4, 'Data Analysis', 'Tech'),
(5, 'Moving & Logistics', 'Labor'),
(6, 'Math Tutoring', 'Academic'),
(7, 'Career Coaching', 'Career'),
(8, 'Video Editing', 'Creative'),
(9, 'Database Architecture', 'Tech'),
(10, 'Translation - French', 'Language'),
(11, 'UX Research', 'Product'),
(12, 'Frontend Development', 'Tech');

INSERT INTO tasks (id, poster_id, title, description, budget, status, deadline, category, created_at) VALUES
(1, 1, 'Brand Identity Refresh', 'Need refreshed logo, palette, and brand kit', 110.00, 'in_progress', '2025-11-30', 'Creative', '2025-11-01'),
(2, 2, 'Automation Script Debug', 'Cron automation fails intermittently', 140.00, 'completed', '2025-11-20', 'Tech', '2025-11-02'),
(3, 4, 'Resume Translation to French', 'Professional resume translation with nuance', 75.00, 'completed', '2025-11-22', 'Language', '2025-11-03'),
(4, 6, 'Excel Data Cleanup', 'Normalize survey spreadsheets and add macros', 95.00, 'in_progress', '2025-11-25', 'Tech', '2025-11-04'),
(5, 5, 'Product Promo Video', '60-second launch trailer with captions', 160.00, 'awaiting_review', '2025-12-05', 'Creative', '2025-11-05'),
(6, 8, 'SAT Algebra Tutoring', 'Weekly session for tricky algebra topics', 65.00, 'completed', '2025-11-18', 'Academic', '2025-11-06'),
(7, 2, 'Weekend Moving Support', 'Need muscle for apartment move', 85.00, 'cancelled', '2025-11-24', 'Labor', '2025-11-07'),
(8, 3, 'Executive Resume Review', 'Polish tone and flow for leadership role', 70.00, 'in_progress', '2025-11-19', 'Career', '2025-11-08'),
(9, 10, 'Design PostgreSQL Schema', 'Model core entities + migrations', 210.00, 'active', '2025-12-10', 'Tech', '2025-11-09'),
(10, 9, 'SEO Blog Article', 'Write 1200-word evergreen article', 80.00, 'completed', '2025-11-26', 'Writing', '2025-11-10'),
(11, 7, 'Community Garden Website', 'Design volunteer site with CMS + form automations', 180.00, 'in_progress', '2025-12-15', 'Tech', '2025-11-11'),
(12, 2, 'Neighborhood Learning Pods', 'Need two instructors to cover rotating pods', 180.00, 'completed', '2025-11-29', 'Academic', '2025-11-12'),
(13, 5, 'Local Workshop Interpreter', 'Provide live translation for small-business workshop', 95.00, 'disputed', '2025-11-27', 'Language', '2025-11-13'),
(14, 9, 'Volunteer Scheduling App', 'Prototype to coordinate weekend signups', 130.00, 'open', '2025-12-20', 'Tech', '2025-11-14');

-- Map Skills to Tasks
INSERT INTO task_skills (task_id, skill_id) VALUES
(1, 2), (1, 3), 
(2, 1), (2, 12),
(3, 10), 
(4, 4), (4, 11),
(5, 8), (5, 2), 
(6, 6), 
(7, 5), 
(8, 7), (8, 3), 
(9, 9), (9, 1), (9, 12),
(10, 3), 
(11, 12), (11, 3), 
(12, 6), (12, 3), 
(13, 10), 
(14, 9), (14, 1);

INSERT INTO proposals (id, task_id, applicant_id, amount, message, status, created_at) VALUES
(1, 1, 5, 108.00, 'Can deliver full brand board plus social templates', 'accepted', '2025-11-05'),
(2, 1, 2, 102.00, 'Available for rapid turnaround if needed', 'rejected', '2025-11-05'),
(3, 2, 9, 135.00, 'Will refactor scripts and add regression tests', 'accepted', '2025-11-06'),
(4, 2, 2, 120.00, 'Debug plan attached for review', 'pending', '2025-11-06'),
(5, 2, 10, 125.00, 'Focus on deployment reliability', 'rejected', '2025-11-06'),
(6, 3, 3, 72.00, 'Native French speaker, will retain nuance', 'accepted', '2025-11-07'),
(7, 3, 10, 70.00, 'Can translate polished draft by weekend', 'pending', '2025-11-07'),
(8, 4, 4, 92.00, 'Will normalize sheets and document macros', 'accepted', '2025-11-08'),
(9, 4, 5, 95.00, 'Can automate cleanup pipeline after delivery', 'pending', '2025-11-08'),
(10, 5, 7, 150.00, 'Storyboard + motion graphics included', 'accepted', '2025-11-09'),
(11, 5, 6, 155.00, 'Have availability for collaborative edits', 'pending', '2025-11-09'),
(12, 6, 6, 60.00, 'Certified tutor, session recap provided', 'accepted', '2025-11-04'),
(13, 6, 5, 62.00, 'Evening availability for make-up lessons', 'pending', '2025-11-04'),
(14, 7, 7, 82.00, 'Two-person crew for four hours with dolly', 'accepted', '2025-11-03'),
(15, 7, 4, 78.00, 'Can assist on loading + driving', 'pending', '2025-11-03'),
(16, 8, 8, 68.00, 'Executive recruiter background, ATS savvy', 'accepted', '2025-11-05'),
(17, 8, 1, 65.00, 'Happy to polish narrative and achievements', 'pending', '2025-11-05'),
(18, 9, 9, 205.00, 'Will deliver schema, ERD, and migrations', 'accepted', '2025-11-06'),
(19, 9, 2, 198.00, 'Focus on scalability and audit logs', 'pending', '2025-11-06'),
(20, 10, 1, 78.00, 'Outline, keyword map, and SEO polish included', 'accepted', '2025-11-07'),
(21, 10, 3, 74.00, 'Can submit draft within 48 hours', 'pending', '2025-11-07'),
(22, 11, 2, 172.00, 'Full Webflow build with CMS collections', 'accepted', '2025-11-10'),
(23, 11, 10, 165.00, 'Can ship MVP in one week', 'pending', '2025-11-10'),
(24, 12, 6, 92.00, 'Lead instructor for advanced pod', 'accepted', '2025-11-09'),
(25, 12, 1, 88.00, 'Cover fundamentals pod with worksheets', 'accepted', '2025-11-09'),
(26, 12, 3, 86.00, 'Available on weekends if you need backups', 'pending', '2025-11-09'),
(27, 13, 3, 95.00, 'Certified interpreter, can deliver transcript', 'accepted', '2025-11-11'),
(28, 13, 9, 102.00, 'Can provide dual language summary after event', 'rejected', '2025-11-11');

INSERT INTO contracts (id, proposal_id, requester_id, provider_id, amount, status, start_date) VALUES
(1, 1, 1, 5, 108.00, 'in_progress', '2025-03-15'),
(2, 3, 2, 9, 135.00, 'completed', '2025-03-10'),
(3, 6, 4, 3, 72.00, 'completed', '2025-03-12'),
(4, 8, 6, 4, 92.00, 'in_progress', '2025-03-18'),
(5, 10, 5, 7, 150.00, 'awaiting_review', '2025-03-20'),
(6, 12, 8, 6, 60.00, 'completed', '2025-03-05'),
(7, 14, 2, 7, 82.00, 'cancelled', '2025-03-22'),
(8, 16, 3, 8, 68.00, 'in_progress', '2025-03-25'),
(9, 18, 10, 9, 205.00, 'active', '2025-03-28'),
(10, 20, 9, 1, 78.00, 'completed', '2025-03-01'),
(11, 22, 7, 2, 172.00, 'in_progress', '2025-04-01'),
(12, 24, 2, 6, 92.00, 'completed', '2025-03-15'),
(13, 25, 2, 1, 88.00, 'active', '2025-03-15'),
(14, 27, 5, 3, 95.00, 'disputed', '2025-03-29');

INSERT INTO transactions (id, contract_id, wallet_id, type, status, amount, description, date) VALUES
(1, 1, 1, 'debit', 'success', -108.00, 'Escrow hold for contract 1', '2025-03-15'),
(2, 2, 2, 'debit', 'success', -135.00, 'Escrow hold for contract 2', '2025-03-10'),
(3, 2, 9, 'credit', 'success', 135.00, 'Release for contract 2', '2025-03-10'),
(4, 3, 6, 'debit', 'success', -72.00, 'Escrow hold for contract 3', '2025-03-12'),
(5, 3, 3, 'credit', 'success', 72.00, 'Release for contract 3', '2025-03-12'),
(6, 4, 6, 'debit', 'success', -92.00, 'Escrow hold for contract 4', '2025-03-18'),
(7, 5, 5, 'debit', 'pending', -150.00, 'Awaiting video deliverables before release', '2025-03-20'),
(8, 6, 8, 'debit', 'success', -60.00, 'Escrow hold for contract 6', '2025-03-05'),
(9, 6, 6, 'credit', 'success', 60.00, 'Tutoring session released', '2025-03-05'),
(10, 7, 2, 'debit', 'success', -82.00, 'Hold before moving help cancellation', '2025-03-22'),
(11, 7, 2, 'refund', 'success', 82.00, 'Refund returned to requester after cancel', '2025-03-22'),
(12, 8, 3, 'debit', 'success', -68.00, 'Escrow hold for resume review', '2025-03-25'),
(13, 9, 10, 'debit', 'success', -205.00, 'Schema work funded in escrow', '2025-03-28'),
(14, 10, 9, 'debit', 'success', -78.00, 'Escrow hold for blog article', '2025-03-01'),
(15, 10, 1, 'credit', 'success', 78.00, 'Release for contract 10', '2025-03-01'),
(16, 11, 7, 'debit', 'success', -100.00, 'Phase 1 escrow for contract 11', '2025-04-01'),
(17, 11, 2, 'credit', 'success', 100.00, 'Milestone 1 release for contract 11', '2025-04-01'),
(18, 11, 7, 'debit', 'success', -80.00, 'Phase 2 escrow for contract 11', '2025-04-01'),
(19, 12, 2, 'debit', 'success', -92.00, 'Escrow hold for contract 12 instructor A', '2025-03-15'),
(20, 12, 6, 'credit', 'success', 92.00, 'Release for contract 12 instructor A', '2025-03-15'),
(21, 13, 2, 'debit', 'success', -88.00, 'Escrow hold for contract 13 instructor B', '2025-03-15'),
(22, 14, 5, 'debit', 'success', -95.00, 'Escrow hold for contract 14 interpreter', '2025-03-29'),
(23, 14, 3, 'credit', 'success', 40.00, 'Partial release after day-one translation', '2025-03-29'),
(24, 14, 5, 'refund', 'success', 55.00, 'Refund remaining balance after dispute', '2025-03-29');

INSERT INTO threads (id, task_id, last_message_at) VALUES
(1, 1, '2025-11-05 10:01:00'),
(2, 2, '2025-11-06 12:05:00'),
(3, 3, '2025-11-07 09:45:00'),
(4, 4, '2025-11-08 16:22:00'),
(5, 5, '2025-11-09 15:10:00'),
(6, 6, '2025-11-04 18:30:00'),
(7, 7, '2025-11-03 11:55:00'),
(8, 8, '2025-11-05 14:40:00'),
(9, 9, '2025-11-06 19:12:00'),
(10, 10, '2025-11-07 08:50:00'),
(11, 11, '2025-11-10 13:15:00'),
(12, 12, '2025-11-09 17:40:00'),
(13, 13, '2025-11-11 09:05:00'),
(14, 14, '2025-11-12 08:20:00');

INSERT INTO thread_participants (thread_id, user_id, role) VALUES
(1, 1, 'poster'), (1, 5, 'applicant'),
(2, 2, 'poster'), (2, 9, 'applicant'),
(3, 4, 'poster'), (3, 3, 'applicant'),
(4, 6, 'poster'), (4, 4, 'applicant'),
(5, 5, 'poster'), (5, 7, 'applicant'),
(6, 8, 'poster'), (6, 6, 'applicant'),
(7, 2, 'poster'), (7, 7, 'applicant'),
(8, 3, 'poster'), (8, 8, 'applicant'),
(9, 10, 'poster'), (9, 9, 'applicant'),
(10, 9, 'poster'), (10, 1, 'applicant'),
(11, 7, 'poster'), (11, 2, 'applicant'),
(12, 2, 'poster'), (12, 6, 'applicant'),
(13, 5, 'poster'), (13, 3, 'applicant'),
(14, 9, 'poster');

INSERT INTO messages (id, thread_id, user_id, body, created_at) VALUES
(1, 1, 1, 'Mood board is in the brief, let me know if anything is unclear', '2025-11-05 10:01:00'),
(2, 1, 5, 'Looks great, sending initial sketches tonight', '2025-11-05 10:05:00'),
(3, 2, 2, 'Shared failing cron logs in the folder', '2025-11-06 12:05:00'),
(4, 2, 9, 'Thanks, root cause looks like race condition; patch incoming', '2025-11-06 12:15:00'),
(5, 3, 4, 'Please keep the professional tone consistent across pages', '2025-11-07 09:45:00'),
(6, 3, 3, 'Understood, will send translated draft tomorrow', '2025-11-07 10:00:00'),
(7, 4, 6, 'New CSV uploaded, can you confirm column mapping?', '2025-11-08 16:22:00'),
(8, 4, 4, 'Yep, running macros now and will drop QA sheet soon', '2025-11-08 16:45:00'),
(9, 5, 5, 'Storyboard version 2 attached for comments', '2025-11-09 15:10:00'),
(10, 5, 7, 'Noted two tweaks, delivering final cut tonight', '2025-11-09 15:30:00'),
(11, 6, 8, 'Can we shift the tutoring session to Thursday?', '2025-11-04 18:30:00'),
(12, 6, 6, 'Thursday 6pm works, worksheet will be ready', '2025-11-04 18:45:00'),
(13, 9, 10, 'Draft ERD uploaded for review', '2025-11-06 19:12:00'),
(14, 9, 9, 'Schema looks solid; starting migration scripts now', '2025-11-06 19:30:00'),
(15, 10, 9, 'Outline approved—excited to read the final post', '2025-11-07 08:50:00'),
(16, 10, 1, 'Thanks! Draft will include internal links for SEO', '2025-11-07 09:00:00'),
(17, 11, 7, 'Shared sitemap draft; please confirm sections to keep', '2025-11-10 13:15:00'),
(18, 11, 2, 'Sections look good—adding CMS bindings tonight', '2025-11-10 13:30:00'),
(19, 12, 2, 'Need both pods covered on Saturday, ok for you two?', '2025-11-09 17:40:00'),
(20, 12, 6, 'I can handle advanced pod and prep slides', '2025-11-09 17:45:00'),
(21, 12, 1, 'I will run foundational pod and share worksheets', '2025-11-09 17:50:00'),
(22, 13, 5, 'Client asked for literal translation; please adjust tone', '2025-11-11 09:05:00'),
(23, 13, 3, 'Understood, sending revised transcript tonight', '2025-11-11 09:15:00'),
(24, 13, 5, 'Received complaints from attendees; need to discuss refund', '2025-11-11 12:00:00'),
(25, 14, 9, 'Still looking for a prototype engineer—details in the doc', '2025-11-12 08:20:00');