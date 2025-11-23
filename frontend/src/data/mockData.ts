import { TaskStatus, ContractStatus } from '../types';

// --- 1. Users ---
export const USERS = [
  { id: 1, name: 'Alice Johnson', email: 'alice@gmail.com', displayName: 'AliceJ' },
  { id: 2, name: 'Bob Smith', email: 'bob@gmail.com', displayName: 'Bobby' },
  { id: 3, name: 'Carol White', email: 'carol@gmail.com', displayName: 'CarolW' },
  { id: 4, name: 'David Brown', email: 'david@gmail.com', displayName: 'Dave' },
  { id: 5, name: 'Eva Green', email: 'eva@gmail.com', displayName: 'Evie' },
  { id: 6, name: 'Frank Harris', email: 'frank@gmail.com', displayName: 'FrankH' },
  { id: 7, name: 'Grace Lee', email: 'grace@gmail.com', displayName: 'Gracie' },
  { id: 8, name: 'Henry Clark', email: 'henry@gmail.com', displayName: 'HenryC' },
  { id: 9, name: 'Ivy Adams', email: 'ivy@gmail.com', displayName: 'IvyA' },
  { id: 10, name: 'Jack Turner', email: 'jack@gmail.com', displayName: 'JackT' },
];

// --- 2. Wallets ---
export const WALLETS = [
  { userId: 1, balance: 240.00, escrowBalance: 108.00 },
  { userId: 2, balance: 185.00, escrowBalance: 88.00 },
  { userId: 3, balance: 205.00, escrowBalance: 68.00 },
  { userId: 4, balance: 170.00, escrowBalance: 0.00 },
  { userId: 5, balance: 340.00, escrowBalance: 150.00 },
  { userId: 6, balance: 155.00, escrowBalance: 92.00 },
  { userId: 7, balance: 275.00, escrowBalance: 80.00 },
  { userId: 8, balance: 115.00, escrowBalance: 0.00 },
  { userId: 9, balance: 195.00, escrowBalance: 0.00 },
  { userId: 10, balance: 140.00, escrowBalance: 205.00 },
];

// --- 3. Skills ---
export const SKILLS = [
  { id: 1, name: 'Python Programming', category: 'Tech' },
  { id: 2, name: 'Graphic Design', category: 'Creative' },
  { id: 3, name: 'Content Strategy', category: 'Writing' },
  { id: 4, name: 'Data Analysis', category: 'Tech' },
  { id: 5, name: 'Moving & Logistics', category: 'Labor' },
  { id: 6, name: 'Math Tutoring', category: 'Academic' },
  { id: 7, name: 'Career Coaching', category: 'Career' },
  { id: 8, name: 'Video Editing', category: 'Creative' },
  { id: 9, name: 'Database Architecture', category: 'Tech' },
  { id: 10, name: 'Translation - French', category: 'Language' },
  { id: 11, name: 'UX Research', category: 'Product' },
  { id: 12, name: 'Frontend Development', category: 'Tech' },
];

// --- 4. Tasks ---
export const TASKS = [
  { id: 1, posterId: 1, title: 'Brand Identity Refresh', description: 'Need refreshed logo, palette, and brand kit', budget: 110.00, status: TaskStatus.IN_PROGRESS, deadline: '2025-11-30', skills: ['Graphic Design', 'Content Strategy'], category: 'Creative', createdAt: '2025-11-01' },
  { id: 2, posterId: 2, title: 'Automation Script Debug', description: 'Cron automation fails intermittently', budget: 140.00, status: TaskStatus.COMPLETED, deadline: '2025-11-20', skills: ['Python Programming', 'Frontend Development'], category: 'Tech', createdAt: '2025-11-02' },
  { id: 3, posterId: 4, title: 'Resume Translation to French', description: 'Professional resume translation with nuance', budget: 75.00, status: TaskStatus.COMPLETED, deadline: '2025-11-22', skills: ['Translation - French'], category: 'Language', createdAt: '2025-11-03' },
  { id: 4, posterId: 6, title: 'Excel Data Cleanup', description: 'Normalize survey spreadsheets and add macros', budget: 95.00, status: TaskStatus.IN_PROGRESS, deadline: '2025-11-25', skills: ['Data Analysis', 'UX Research'], category: 'Tech', createdAt: '2025-11-04' },
  { id: 5, posterId: 5, title: 'Product Promo Video', description: '60-second launch trailer with captions', budget: 160.00, status: TaskStatus.AWAITING_REVIEW, deadline: '2025-12-05', skills: ['Video Editing', 'Graphic Design'], category: 'Creative', createdAt: '2025-11-05' },
  { id: 6, posterId: 8, title: 'SAT Algebra Tutoring', description: 'Weekly session for tricky algebra topics', budget: 65.00, status: TaskStatus.COMPLETED, deadline: '2025-11-18', skills: ['Math Tutoring'], category: 'Academic', createdAt: '2025-11-06' },
  { id: 7, posterId: 2, title: 'Weekend Moving Support', description: 'Need muscle for apartment move', budget: 85.00, status: TaskStatus.CANCELLED, deadline: '2025-11-24', skills: ['Moving & Logistics'], category: 'Labor', createdAt: '2025-11-07' },
  { id: 8, posterId: 3, title: 'Executive Resume Review', description: 'Polish tone and flow for leadership role', budget: 70.00, status: TaskStatus.IN_PROGRESS, deadline: '2025-11-19', skills: ['Career Coaching', 'Content Strategy'], category: 'Career', createdAt: '2025-11-08' },
  { id: 9, posterId: 10, title: 'Design PostgreSQL Schema', description: 'Model core entities + migrations', budget: 210.00, status: TaskStatus.ACTIVE, deadline: '2025-12-10', skills: ['Database Architecture', 'Python Programming', 'Frontend Development'], category: 'Tech', createdAt: '2025-11-09' },
  { id: 10, posterId: 9, title: 'SEO Blog Article', description: 'Write 1200-word evergreen article', budget: 80.00, status: TaskStatus.COMPLETED, deadline: '2025-11-26', skills: ['Content Strategy'], category: 'Writing', createdAt: '2025-11-10' },
  { id: 11, posterId: 7, title: 'Community Garden Website', description: 'Design volunteer site with CMS + form automations', budget: 180.00, status: TaskStatus.IN_PROGRESS, deadline: '2025-12-15', skills: ['Frontend Development', 'Content Strategy'], category: 'Tech', createdAt: '2025-11-11' },
  { id: 12, posterId: 2, title: 'Neighborhood Learning Pods', description: 'Need two instructors to cover rotating pods', budget: 180.00, status: TaskStatus.COMPLETED, deadline: '2025-11-29', skills: ['Math Tutoring', 'Content Strategy'], category: 'Academic', createdAt: '2025-11-12' },
  { id: 13, posterId: 5, title: 'Local Workshop Interpreter', description: 'Provide live translation for small-business workshop', budget: 95.00, status: TaskStatus.DISPUTED, deadline: '2025-11-27', skills: ['Translation - French'], category: 'Language', createdAt: '2025-11-13' },
  { id: 14, posterId: 9, title: 'Volunteer Scheduling App', description: 'Prototype to coordinate weekend signups', budget: 130.00, status: TaskStatus.OPEN, deadline: '2025-12-20', skills: ['Database Architecture', 'Python Programming'], category: 'Tech', createdAt: '2025-11-14' },
];

// --- 5. Proposals ---
export const PROPOSALS = [
  { id: 1, taskId: 1, applicantId: 5, amount: 108.00, message: 'Can deliver full brand board plus social templates', status: 'accepted', createdAt: '2025-11-05' },
  { id: 2, taskId: 1, applicantId: 2, amount: 102.00, message: 'Available for rapid turnaround if needed', status: 'rejected', createdAt: '2025-11-05' },
  { id: 3, taskId: 2, applicantId: 9, amount: 135.00, message: 'Will refactor scripts and add regression tests', status: 'accepted', createdAt: '2025-11-06' },
  { id: 4, taskId: 2, applicantId: 2, amount: 120.00, message: 'Debug plan attached for review', status: 'pending', createdAt: '2025-11-06' },
  { id: 5, taskId: 2, applicantId: 10, amount: 125.00, message: 'Focus on deployment reliability', status: 'rejected', createdAt: '2025-11-06' },
  { id: 6, taskId: 3, applicantId: 3, amount: 72.00, message: 'Native French speaker, will retain nuance', status: 'accepted', createdAt: '2025-11-07' },
  { id: 7, taskId: 3, applicantId: 10, amount: 70.00, message: 'Can translate polished draft by weekend', status: 'pending', createdAt: '2025-11-07' },
  { id: 8, taskId: 4, applicantId: 4, amount: 92.00, message: 'Will normalize sheets and document macros', status: 'accepted', createdAt: '2025-11-08' },
  { id: 9, taskId: 4, applicantId: 5, amount: 95.00, message: 'Can automate cleanup pipeline after delivery', status: 'pending', createdAt: '2025-11-08' },
  { id: 10, taskId: 5, applicantId: 7, amount: 150.00, message: 'Storyboard + motion graphics included', status: 'accepted', createdAt: '2025-11-09' },
  { id: 11, taskId: 5, applicantId: 6, amount: 155.00, message: 'Have availability for collaborative edits', status: 'pending', createdAt: '2025-11-09' },
  { id: 12, taskId: 6, applicantId: 6, amount: 60.00, message: 'Certified tutor, session recap provided', status: 'accepted', createdAt: '2025-11-04' },
  { id: 13, taskId: 6, applicantId: 5, amount: 62.00, message: 'Evening availability for make-up lessons', status: 'pending', createdAt: '2025-11-04' },
  { id: 14, taskId: 7, applicantId: 7, amount: 82.00, message: 'Two-person crew for four hours with dolly', status: 'accepted', createdAt: '2025-11-03' },
  { id: 15, taskId: 7, applicantId: 4, amount: 78.00, message: 'Can assist on loading + driving', status: 'pending', createdAt: '2025-11-03' },
  { id: 16, taskId: 8, applicantId: 8, amount: 68.00, message: 'Executive recruiter background, ATS savvy', status: 'accepted', createdAt: '2025-11-05' },
  { id: 17, taskId: 8, applicantId: 1, amount: 65.00, message: 'Happy to polish narrative and achievements', status: 'pending', createdAt: '2025-11-05' },
  { id: 18, taskId: 9, applicantId: 9, amount: 205.00, message: 'Will deliver schema, ERD, and migrations', status: 'accepted', createdAt: '2025-11-06' },
  { id: 19, taskId: 9, applicantId: 2, amount: 198.00, message: 'Focus on scalability and audit logs', status: 'pending', createdAt: '2025-11-06' },
  { id: 20, taskId: 10, applicantId: 1, amount: 78.00, message: 'Outline, keyword map, and SEO polish included', status: 'accepted', createdAt: '2025-11-07' },
  { id: 21, taskId: 10, applicantId: 3, amount: 74.00, message: 'Can submit draft within 48 hours', status: 'pending', createdAt: '2025-11-07' },
  { id: 22, taskId: 11, applicantId: 2, amount: 172.00, message: 'Full Webflow build with CMS collections', status: 'accepted', createdAt: '2025-11-10' },
  { id: 23, taskId: 11, applicantId: 10, amount: 165.00, message: 'Can ship MVP in one week', status: 'pending', createdAt: '2025-11-10' },
  { id: 24, taskId: 12, applicantId: 6, amount: 92.00, message: 'Lead instructor for advanced pod', status: 'accepted', createdAt: '2025-11-09' },
  { id: 25, taskId: 12, applicantId: 1, amount: 88.00, message: 'Cover fundamentals pod with worksheets', status: 'accepted', createdAt: '2025-11-09' },
  { id: 26, taskId: 12, applicantId: 3, amount: 86.00, message: 'Available on weekends if you need backups', status: 'pending', createdAt: '2025-11-09' },
  { id: 27, taskId: 13, applicantId: 3, amount: 95.00, message: 'Certified interpreter, can deliver transcript', status: 'accepted', createdAt: '2025-11-11' },
  { id: 28, taskId: 13, applicantId: 9, amount: 102.00, message: 'Can provide dual language summary after event', status: 'rejected', createdAt: '2025-11-11' },
];

// --- 6. Contracts ---
export const CONTRACTS = [
  { id: 1, proposalId: 1, requesterId: 1, providerId: 5, amount: 108.00, status: ContractStatus.IN_PROGRESS, startDate: '2025-03-15' },
  { id: 2, proposalId: 3, requesterId: 2, providerId: 9, amount: 135.00, status: ContractStatus.COMPLETED, startDate: '2025-03-10' },
  { id: 3, proposalId: 6, requesterId: 4, providerId: 3, amount: 72.00, status: ContractStatus.COMPLETED, startDate: '2025-03-12' },
  { id: 4, proposalId: 8, requesterId: 6, providerId: 4, amount: 92.00, status: ContractStatus.IN_PROGRESS, startDate: '2025-03-18' },
  { id: 5, proposalId: 10, requesterId: 5, providerId: 7, amount: 150.00, status: ContractStatus.AWAITING_REVIEW, startDate: '2025-03-20' },
  { id: 6, proposalId: 12, requesterId: 8, providerId: 6, amount: 60.00, status: ContractStatus.COMPLETED, startDate: '2025-03-05' },
  { id: 7, proposalId: 14, requesterId: 2, providerId: 7, amount: 82.00, status: ContractStatus.CANCELLED, startDate: '2025-03-22' },
  { id: 8, proposalId: 16, requesterId: 3, providerId: 8, amount: 68.00, status: ContractStatus.IN_PROGRESS, startDate: '2025-03-25' },
  { id: 9, proposalId: 18, requesterId: 10, providerId: 9, amount: 205.00, status: ContractStatus.ACTIVE, startDate: '2025-03-28' },
  { id: 10, proposalId: 20, requesterId: 9, providerId: 1, amount: 78.00, status: ContractStatus.COMPLETED, startDate: '2025-03-01' },
  { id: 11, proposalId: 22, requesterId: 7, providerId: 2, amount: 172.00, status: ContractStatus.IN_PROGRESS, startDate: '2025-04-01' },
  { id: 12, proposalId: 24, requesterId: 2, providerId: 6, amount: 92.00, status: ContractStatus.COMPLETED, startDate: '2025-03-15' },
  { id: 13, proposalId: 25, requesterId: 2, providerId: 1, amount: 88.00, status: ContractStatus.ACTIVE, startDate: '2025-03-15' },
  { id: 14, proposalId: 27, requesterId: 5, providerId: 3, amount: 95.00, status: ContractStatus.DISPUTED, startDate: '2025-03-29' },
];

// --- 7. Transactions ---
export const TRANSACTIONS = [
  { id: 1, contractId: 1, walletId: 1, type: 'debit', status: 'success', amount: -108.00, description: 'Escrow hold for contract 1' },
  { id: 2, contractId: 2, walletId: 2, type: 'debit', status: 'success', amount: -135.00, description: 'Escrow hold for contract 2' },
  { id: 3, contractId: 2, walletId: 9, type: 'credit', status: 'success', amount: 135.00, description: 'Release for contract 2' },
  { id: 4, contractId: 3, walletId: 6, type: 'debit', status: 'success', amount: -72.00, description: 'Escrow hold for contract 3' },
  { id: 5, contractId: 3, walletId: 3, type: 'credit', status: 'success', amount: 72.00, description: 'Release for contract 3' },
  { id: 6, contractId: 4, walletId: 6, type: 'debit', status: 'success', amount: -92.00, description: 'Escrow hold for contract 4' },
  { id: 7, contractId: 5, walletId: 5, type: 'debit', status: 'pending', amount: -150.00, description: 'Awaiting video deliverables before release' },
  { id: 8, contractId: 6, walletId: 8, type: 'debit', status: 'success', amount: -60.00, description: 'Escrow hold for contract 6' },
  { id: 9, contractId: 6, walletId: 6, type: 'credit', status: 'success', amount: 60.00, description: 'Tutoring session released' },
  { id: 10, contractId: 7, walletId: 2, type: 'debit', status: 'success', amount: -82.00, description: 'Hold before moving help cancellation' },
  { id: 11, contractId: 7, walletId: 2, type: 'refund', status: 'success', amount: 82.00, description: 'Refund returned to requester after cancel' },
  { id: 12, contractId: 8, walletId: 3, type: 'debit', status: 'success', amount: -68.00, description: 'Escrow hold for resume review' },
  { id: 13, contractId: 9, walletId: 10, type: 'debit', status: 'success', amount: -205.00, description: 'Schema work funded in escrow' },
  { id: 14, contractId: 10, walletId: 9, type: 'debit', status: 'success', amount: -78.00, description: 'Escrow hold for blog article' },
  { id: 15, contractId: 10, walletId: 1, type: 'credit', status: 'success', amount: 78.00, description: 'Release for contract 10' },
  { id: 16, contractId: 11, walletId: 7, type: 'debit', status: 'success', amount: -100.00, description: 'Phase 1 escrow for contract 11' },
  { id: 17, contractId: 11, walletId: 2, type: 'credit', status: 'success', amount: 100.00, description: 'Milestone 1 release for contract 11' },
  { id: 18, contractId: 11, walletId: 7, type: 'debit', status: 'success', amount: -80.00, description: 'Phase 2 escrow for contract 11' },
  { id: 19, contractId: 12, walletId: 2, type: 'debit', status: 'success', amount: -92.00, description: 'Escrow hold for contract 12 instructor A' },
  { id: 20, contractId: 12, walletId: 6, type: 'credit', status: 'success', amount: 92.00, description: 'Release for contract 12 instructor A' },
  { id: 21, contractId: 13, walletId: 2, type: 'debit', status: 'success', amount: -88.00, description: 'Escrow hold for contract 13 instructor B' },
  { id: 22, contractId: 14, walletId: 5, type: 'debit', status: 'success', amount: -95.00, description: 'Escrow hold for contract 14 interpreter' },
  { id: 23, contractId: 14, walletId: 3, type: 'credit', status: 'success', amount: 40.00, description: 'Partial release after day-one translation' },
  { id: 24, contractId: 14, walletId: 5, type: 'refund', status: 'success', amount: 55.00, description: 'Refund remaining balance after dispute' },
];

// --- 8. Threads & Participants ---
export const THREADS = [
    { id: 1, taskId: 1, lastMessageAt: '2025-11-05 10:01:00' },
    { id: 2, taskId: 2, lastMessageAt: '2025-11-06 12:05:00' },
    { id: 3, taskId: 3, lastMessageAt: '2025-11-07 09:45:00' },
    { id: 4, taskId: 4, lastMessageAt: '2025-11-08 16:22:00' },
    { id: 5, taskId: 5, lastMessageAt: '2025-11-09 15:10:00' },
    { id: 6, taskId: 6, lastMessageAt: '2025-11-04 18:30:00' },
    { id: 7, taskId: 7, lastMessageAt: '2025-11-03 11:55:00' },
    { id: 8, taskId: 8, lastMessageAt: '2025-11-05 14:40:00' },
    { id: 9, taskId: 9, lastMessageAt: '2025-11-06 19:12:00' },
    { id: 10, taskId: 10, lastMessageAt: '2025-11-07 08:50:00' },
    { id: 11, taskId: 11, lastMessageAt: '2025-11-10 13:15:00' },
    { id: 12, taskId: 12, lastMessageAt: '2025-11-09 17:40:00' },
    { id: 13, taskId: 13, lastMessageAt: '2025-11-11 09:05:00' },
    { id: 14, taskId: 14, lastMessageAt: '2025-11-12 08:20:00' },
];

export const THREAD_PARTICIPANTS = [
    { userId: 1, threadId: 1, role: 'poster' }, { userId: 5, threadId: 1, role: 'applicant' },
    { userId: 2, threadId: 2, role: 'poster' }, { userId: 9, threadId: 2, role: 'applicant' },
    { userId: 4, threadId: 3, role: 'poster' }, { userId: 3, threadId: 3, role: 'applicant' },
    { userId: 6, threadId: 4, role: 'poster' }, { userId: 4, threadId: 4, role: 'applicant' },
    { userId: 5, threadId: 5, role: 'poster' }, { userId: 7, threadId: 5, role: 'applicant' },
    { userId: 8, threadId: 6, role: 'poster' }, { userId: 6, threadId: 6, role: 'applicant' },
    { userId: 2, threadId: 7, role: 'poster' }, { userId: 7, threadId: 7, role: 'applicant' },
    { userId: 3, threadId: 8, role: 'poster' }, { userId: 8, threadId: 8, role: 'applicant' },
    { userId: 10, threadId: 9, role: 'poster' }, { userId: 9, threadId: 9, role: 'applicant' },
    { userId: 9, threadId: 10, role: 'poster' }, { userId: 1, threadId: 10, role: 'applicant' },
    { userId: 7, threadId: 11, role: 'poster' }, { userId: 2, threadId: 11, role: 'applicant' },
    { userId: 2, threadId: 12, role: 'poster' }, { userId: 6, threadId: 12, role: 'applicant' }, { userId: 1, threadId: 12, role: 'applicant' },
    { userId: 5, threadId: 13, role: 'poster' }, { userId: 3, threadId: 13, role: 'applicant' },
    { userId: 9, threadId: 14, role: 'poster' },
];

// --- 9. Messages ---
export const MESSAGES = [
    { id: 1, threadId: 1, userId: 1, body: 'Mood board is in the brief, let me know if anything is unclear', createdAt: '2025-11-05 10:01:00' },
    { id: 2, threadId: 1, userId: 5, body: 'Looks great, sending initial sketches tonight', createdAt: '2025-11-05 10:05:00' },
    { id: 3, threadId: 2, userId: 2, body: 'Shared failing cron logs in the folder', createdAt: '2025-11-06 12:05:00' },
    { id: 4, threadId: 2, userId: 9, body: 'Thanks, root cause looks like race condition; patch incoming', createdAt: '2025-11-06 12:15:00' },
    { id: 5, threadId: 3, userId: 4, body: 'Please keep the professional tone consistent across pages', createdAt: '2025-11-07 09:45:00' },
    { id: 6, threadId: 3, userId: 3, body: 'Understood, will send translated draft tomorrow', createdAt: '2025-11-07 10:00:00' },
    { id: 7, threadId: 4, userId: 6, body: 'New CSV uploaded, can you confirm column mapping?', createdAt: '2025-11-08 16:22:00' },
    { id: 8, threadId: 4, userId: 4, body: 'Yep, running macros now and will drop QA sheet soon', createdAt: '2025-11-08 16:45:00' },
    { id: 9, threadId: 5, userId: 5, body: 'Storyboard version 2 attached for comments', createdAt: '2025-11-09 15:10:00', attachments: 'storyboard_v2.pdf' },
    { id: 10, threadId: 5, userId: 7, body: 'Noted two tweaks, delivering final cut tonight', createdAt: '2025-11-09 15:30:00', attachments: 'promo_cut.mov' },
    { id: 11, threadId: 6, userId: 8, body: 'Can we shift the tutoring session to Thursday?', createdAt: '2025-11-04 18:30:00' },
    { id: 12, threadId: 6, userId: 6, body: 'Thursday 6pm works, worksheet will be ready', createdAt: '2025-11-04 18:45:00' },
    { id: 13, threadId: 9, userId: 10, body: 'Draft ERD uploaded for review', createdAt: '2025-11-06 19:12:00', attachments: 'tg-erd.png' },
    { id: 14, threadId: 9, userId: 9, body: 'Schema looks solid; starting migration scripts now', createdAt: '2025-11-06 19:30:00' },
    { id: 15, threadId: 10, userId: 9, body: 'Outline approved—excited to read the final post', createdAt: '2025-11-07 08:50:00' },
    { id: 16, threadId: 10, userId: 1, body: 'Thanks! Draft will include internal links for SEO', createdAt: '2025-11-07 09:00:00' },
    { id: 17, threadId: 11, userId: 7, body: 'Shared sitemap draft; please confirm sections to keep', createdAt: '2025-11-10 13:15:00' },
    { id: 18, threadId: 11, userId: 2, body: 'Sections look good—adding CMS bindings tonight', createdAt: '2025-11-10 13:30:00' },
    { id: 19, threadId: 12, userId: 2, body: 'Need both pods covered on Saturday, ok for you two?', createdAt: '2025-11-09 17:40:00' },
    { id: 20, threadId: 12, userId: 6, body: 'I can handle advanced pod and prep slides', createdAt: '2025-11-09 17:45:00' },
    { id: 21, threadId: 12, userId: 1, body: 'I will run foundational pod and share worksheets', createdAt: '2025-11-09 17:50:00' },
    { id: 22, threadId: 13, userId: 5, body: 'Client asked for literal translation; please adjust tone', createdAt: '2025-11-11 09:05:00' },
    { id: 23, threadId: 13, userId: 3, body: 'Understood, sending revised transcript tonight', createdAt: '2025-11-11 09:15:00' },
    { id: 24, threadId: 13, userId: 5, body: 'Received complaints from attendees; need to discuss refund', createdAt: '2025-11-11 12:00:00' },
    { id: 25, threadId: 14, userId: 9, body: 'Still looking for a prototype engineer—details in the doc', createdAt: '2025-11-12 08:20:00', attachments: 'volunteer_app_brief.pdf' },
];

// --- 10. Reviews ---
export const REVIEWS = [
  { id: 1, taskId: 2, reviewerId: 2, revieweeId: 9, rating: 5, comment: 'Resolved all automation bugs and added tests', createdAt: '2025-11-20 10:00:00' },
  { id: 2, taskId: 2, reviewerId: 9, revieweeId: 2, rating: 4, comment: 'Clear requirements and fast code reviews', createdAt: '2025-11-20 10:05:00' },
  { id: 3, taskId: 3, reviewerId: 4, revieweeId: 3, rating: 5, comment: 'Translation captured tone perfectly', createdAt: '2025-11-22 10:00:00' },
  { id: 4, taskId: 6, reviewerId: 8, revieweeId: 6, rating: 5, comment: 'Great tutoring session with comprehensive recap', createdAt: '2025-11-18 10:00:00' },
  { id: 5, taskId: 10, reviewerId: 9, revieweeId: 1, rating: 4, comment: 'Strong structure and keyword coverage', createdAt: '2025-11-26 10:00:00' },
  { id: 6, taskId: 10, reviewerId: 1, revieweeId: 9, rating: 5, comment: 'Brief and feedback were detailed and prompt', createdAt: '2025-11-26 10:05:00' },
  { id: 7, taskId: 12, reviewerId: 2, revieweeId: 6, rating: 5, comment: 'Students loved the advanced pod curriculum', createdAt: '2025-11-29 10:00:00' },
  { id: 8, taskId: 12, reviewerId: 6, revieweeId: 2, rating: 4, comment: 'Pods were well organized with quick feedback', createdAt: '2025-11-29 10:05:00' },
  { id: 9, taskId: 12, reviewerId: 2, revieweeId: 1, rating: 5, comment: 'Foundations pod delivered excellent worksheets', createdAt: '2025-11-29 10:10:00' },
  { id: 10, taskId: 8, reviewerId: 8, revieweeId: 4, rating: 5, comment: 'Very professional and fast.', createdAt: '2025-11-19 10:00:00' },
];