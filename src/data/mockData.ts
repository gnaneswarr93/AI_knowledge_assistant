import { User, KnowledgeDocument, Conversation, AdminStats, SessionInfo, SystemStatus, DocumentChunk } from '../types';

export const MOCK_SESSION_INFO: SessionInfo = {
  sessionId: 'SES-8941-X9-PROD',
  loginTime: 'Today at 08:30:14 AM (EDT)',
  ipAddress: '10.240.4.18 (Zero-Trust Gateway)',
  networkLocation: 'Enterprise VPN • North America Region',
  encryption: 'TLS 1.3 • AES-256-GCM (Hardware Key Auth)',
  tokenExpiry: '5 hours, 28 minutes remaining',
};

export const MOCK_SYSTEM_STATUS: SystemStatus = {
  status: 'Operational',
  latencyMs: 24,
  vectorDbStatus: 'Ready (Pinecone / pgvector HNSW)',
  vectorDbRecords: 465,
  embeddingModel: 'text-embedding-004 (768-dim, Cosine)',
  agentsActive: 5,
  lastSync: 'Synced 2 minutes ago',
};

const REMOTE_POLICY_CHUNKS: DocumentChunk[] = [
  {
    id: 'chk-rem-1',
    chunkIndex: 1,
    page: 2,
    section: 'Scope and Applicability',
    tokenCount: 486,
    embeddingDimension: 768,
    text: 'This Remote Work Policy applies to all full-time regular employees whose roles are classified as hybrid-eligible by their respective department heads. Roles requiring physical hardware maintenance, direct client facility access, or specialized lab environments are exempt from remote eligibility.',
  },
  {
    id: 'chk-rem-2',
    chunkIndex: 2,
    page: 4,
    section: 'Eligibility & Weekly Quotas',
    tokenCount: 512,
    embeddingDimension: 768,
    text: 'Eligible staff may perform duties remotely for up to three (3) business days per calendar week, subject to direct manager approval. Team core collaborative hours are established between 10:00 AM and 4:00 PM in the employee’s primary designated time zone.',
  },
  {
    id: 'chk-rem-3',
    chunkIndex: 3,
    page: 6,
    section: 'Home Office Allowance & Ergonomics',
    tokenCount: 460,
    embeddingDimension: 768,
    text: 'Employees in approved hybrid roles are entitled to a one-time remote workstation ergonomic stipend of $500. Additionally, a monthly telecommunications and broadband reimbursement of $50 is claimable via Concur expense reporting with proof of home broadband connectivity.',
  },
];

const HANDBOOK_CHUNKS: DocumentChunk[] = [
  {
    id: 'chk-hnd-1',
    chunkIndex: 1,
    page: 18,
    section: 'Flexible Workplace Guidelines',
    tokenCount: 495,
    embeddingDimension: 768,
    text: 'The organization fosters flexible working arrangements built upon accountability and transparent delivery. All remote work must be conducted through company-provisioned secure endpoints equipped with managed endpoint detection and response (EDR).',
  },
  {
    id: 'chk-hnd-2',
    chunkIndex: 2,
    page: 24,
    section: 'Paid Time Off & Holidays',
    tokenCount: 504,
    embeddingDimension: 768,
    text: 'Standard annual paid time off (PTO) accrual starts at 20 days per fiscal calendar year, accruing at 1.66 days per month for employees with under 3 years of service. After 3 years, accrual scales to 25 days. Employees receive 10 separate wellness/sick days per annum.',
  },
];

const SECURITY_CHUNKS: DocumentChunk[] = [
  {
    id: 'chk-sec-1',
    chunkIndex: 1,
    page: 2,
    section: 'Authentication & MFA Protocols',
    tokenCount: 510,
    embeddingDimension: 768,
    text: 'Mandatory Multi-Factor Authentication (MFA) must be enforced across all corporate Identity Providers (IdP). Hardware security keys (FIDO2/WebAuthn) are mandatory for engineers, system administrators, and staff accessing confidential client repositories.',
  },
  {
    id: 'chk-sec-2',
    chunkIndex: 2,
    page: 3,
    section: 'Device Encryption & Endpoint Hygiene',
    tokenCount: 472,
    embeddingDimension: 768,
    text: 'Full-disk volume encryption (BitLocker with XTS-AES 256 or FileVault 2) is enforced across all macOS and Windows endpoints. Workstations automatically lock after five (5) minutes of inactive idle state.',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Kalyan Ram',
    email: 'employee@enterprise.com',
    role: 'EMPLOYEE',
    department: 'Engineering',
    employeeId: 'EMP-29402',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinedDate: 'March 2023',
  },
  {
    id: 'user-2',
    name: 'Admin User',
    email: 'admin@enterprise.com',
    role: 'ADMIN',
    department: 'IT & Knowledge Systems',
    employeeId: 'ADM-10041',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinedDate: 'January 2021',
  },
];

export const INITIAL_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: 'doc-1',
    name: 'Remote Work Policy.pdf',
    type: 'PDF',
    department: 'Human Resources',
    size: '1.4 MB',
    status: 'Indexed',
    updatedAt: '2 days ago',
    chunksCount: 42,
    uploadedBy: 'HR Operations',
    description: 'Guidelines on hybrid work schedules, remote ergonomics, core collaboration hours, and digital connectivity allowance.',
    previewSnippet: 'Employees in eligible roles may request up to 3 remote work days per week upon manager approval. Core collaborative hours are 10:00 AM to 4:00 PM local time.',
    sampleChunks: REMOTE_POLICY_CHUNKS,
  },
  {
    id: 'doc-2',
    name: 'Employee Handbook.docx',
    type: 'DOCX',
    department: 'Human Resources',
    size: '3.8 MB',
    status: 'Indexed',
    updatedAt: '1 week ago',
    chunksCount: 128,
    uploadedBy: 'HR Operations',
    description: 'Comprehensive organizational handbook detailing employee conduct, benefits, leave policies, and professional development programs.',
    previewSnippet: 'Standard annual paid time off (PTO) accrual starts at 20 days per fiscal calendar year, plus 11 recognized organizational public holidays.',
    sampleChunks: HANDBOOK_CHUNKS,
  },
  {
    id: 'doc-3',
    name: 'Information Security Policy.pdf',
    type: 'PDF',
    department: 'Security & IT',
    size: '2.1 MB',
    status: 'Indexed',
    updatedAt: '3 weeks ago',
    chunksCount: 84,
    uploadedBy: 'Infosec Office',
    description: 'Enterprise data classification, multi-factor authentication mandates, encryption standards, and incident reporting protocols.',
    previewSnippet: 'All enterprise workstations require BitLocker/FileVault disk encryption. Passwords must be at least 14 characters with mandatory hardware key MFA.',
    sampleChunks: SECURITY_CHUNKS,
  },
  {
    id: 'doc-4',
    name: 'Project Management Guidelines.pdf',
    type: 'PDF',
    department: 'Product & Operations',
    size: '4.2 MB',
    status: 'Indexed',
    updatedAt: '1 month ago',
    chunksCount: 110,
    uploadedBy: 'PMO Team',
    description: 'Lifecycle stages for capital and tech initiatives, Stage-Gate approval matrices, and quarterly OKR tracking methodologies.',
    previewSnippet: 'Initiatives exceeding $50,000 or cross-department dependencies require Stage-Gate 2 steering committee consensus prior to procurement.',
  },
  {
    id: 'doc-5',
    name: 'Data Privacy Policy.docx',
    type: 'DOCX',
    department: 'Legal & Compliance',
    size: '890 KB',
    status: 'Indexed',
    updatedAt: '2 months ago',
    chunksCount: 36,
    uploadedBy: 'Legal Counsel',
    description: 'Handling of personal identifiable information (PII), GDPR/CCPA alignment, retention periods, and customer consent architecture.',
    previewSnippet: 'Customer PII must never reside in unencrypted staging environments. Data subjects have a 30-day statutory response window for erasure requests.',
  },
  {
    id: 'doc-6',
    name: 'IT Support Manual.pdf',
    type: 'PDF',
    department: 'Security & IT',
    size: '1.9 MB',
    status: 'Indexed',
    updatedAt: '3 months ago',
    chunksCount: 65,
    uploadedBy: 'Help Desk',
    description: 'Standard operating procedures for hardware provisioning, enterprise VPN client configuration, and internal ticket SLAs.',
    previewSnippet: 'Priority 1 (production blockage) tickets have an initial response SLA of 15 minutes, with full triage escalation to Tier 3 on-call engineers.',
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Remote work policy',
    lastUpdated: '10 mins ago',
    messages: [
      {
        id: 'msg-101',
        sender: 'user',
        content: 'What is our remote work policy?',
        timestamp: '10:14 AM',
      },
      {
        id: 'msg-102',
        sender: 'assistant',
        content: `According to the available enterprise knowledge, employees in designated eligible roles may work remotely up to three (3) days per workweek with departmental manager approval.\n\nKey parameters include:\n• **Core Hours**: Mandatory availability during collaborative core hours (10:00 AM – 4:00 PM local time).\n• **Equipment & Connectivity**: Company-issued laptops must use enterprise VPN at all times. A one-time home office ergonomic stipend of $500 is accessible via the expense portal.\n• **Security Protocols**: Work from public Wi-Fi without VPN encryption is strictly prohibited.`,
        timestamp: '10:15 AM',
        sources: [
          { documentName: 'Remote Work Policy.pdf', page: 4, section: 'Eligibility & Weekly Quotas', relevanceScore: 0.94 },
          { documentName: 'Employee Handbook.docx', page: 18, section: 'Flexible Workplace Guidelines', relevanceScore: 0.88 },
        ],
        confidence: 'High',
        feedback: 'helpful',
      },
    ],
  },
  {
    id: 'conv-2',
    title: 'Security guidelines',
    lastUpdated: 'Yesterday',
    messages: [
      {
        id: 'msg-201',
        sender: 'user',
        content: 'Summarize the information security guidelines.',
        timestamp: '2:30 PM',
      },
      {
        id: 'msg-202',
        sender: 'assistant',
        content: `Based on the Information Security Policy, here is the executive summary of mandatory security standards:\n\n1. **Authentication & Access**: Multi-Factor Authentication (MFA) via hardware security key or enterprise authenticator is mandatory. Minimum 14-character passwords refreshed every 90 days.\n2. **Device Hygiene**: Full-disk hardware encryption (BitLocker/FileVault) is enforced automatically via MDM. Screen locks after 5 minutes of inactivity.\n3. **Data Classification**: Confidential and Restricted client data must never be saved on local drives or shared via unapproved personal cloud accounts.\n4. **Incident Reporting**: Any suspected phishing or compromised credential must be flagged to security@enterprise.com within 30 minutes.`,
        timestamp: '2:31 PM',
        sources: [
          { documentName: 'Information Security Policy.pdf', page: 2, section: 'MFA & Device Controls', relevanceScore: 0.96 },
          { documentName: 'IT Support Manual.pdf', page: 11, section: 'Incident Triage Escalation', relevanceScore: 0.85 },
        ],
        confidence: 'High',
        feedback: 'helpful',
      },
    ],
  },
  {
    id: 'conv-3',
    title: 'Employee leave policy',
    lastUpdated: '3 days ago',
    messages: [
      {
        id: 'msg-301',
        sender: 'user',
        content: 'What is the employee leave policy?',
        timestamp: '11:05 AM',
      },
      {
        id: 'msg-302',
        sender: 'assistant',
        content: `Per the official Employee Handbook, full-time regular employees receive the following structured leave benefits:\n\n• **Paid Time Off (PTO)**: 20 accrued days annually for employees with under 3 years tenure (accruing at 1.66 days/month), increasing to 25 days after 3 years.\n• **Sick & Wellbeing Leave**: 10 dedicated sick days per calendar year, separate from vacation PTO.\n• **Parental Leave**: 16 weeks of 100% paid leave for primary caregivers; 8 weeks for secondary caregivers.\n• **Carryover Policy**: Up to 5 unused PTO days can be rolled over to the subsequent calendar year, expiring by March 31st.`,
        timestamp: '11:06 AM',
        sources: [
          { documentName: 'Employee Handbook.docx', page: 24, section: 'Leave Types & Accruals', relevanceScore: 0.93 },
        ],
        confidence: 'High',
        feedback: null,
      },
    ],
  },
  {
    id: 'conv-4',
    title: 'Project approval process',
    lastUpdated: 'Last week',
    messages: [
      {
        id: 'msg-401',
        sender: 'user',
        content: 'What is the project approval process?',
        timestamp: '4:15 PM',
      },
      {
        id: 'msg-402',
        sender: 'assistant',
        content: `According to the Project Management Guidelines, all enterprise initiatives follow a 4-stage governance lifecycle:\n\n• **Stage 1 (Concept Review)**: Submission of a 1-page business brief to Department Head.\n• **Stage 2 (Business Case & Feasibility)**: Cross-functional assessment (budget, infosec, engineering bandwidth). Projects over $50,000 require Stage-Gate steering committee approval.\n• **Stage 3 (Implementation Approval)**: Resource allocation signed off by PMO and Finance.\n• **Stage 4 (Post-Launch Audit)**: 90-day review against projected OKRs.`,
        timestamp: '4:16 PM',
        sources: [
          { documentName: 'Project Management Guidelines.pdf', page: 7, section: 'Governance Stage Gates', relevanceScore: 0.91 },
        ],
        confidence: 'High',
        feedback: null,
      },
    ],
  },
];

export const MOCK_ADMIN_STATS: AdminStats = {
  totalDocuments: 6,
  totalUsers: 48,
  totalQueries: 1420,
  indexedPercentage: 100,
  vectorEmbeddingsCount: 465,
};

export const SUGGESTED_QUESTIONS = [
  'What is our remote work policy?',
  'Summarize the information security guidelines.',
  'What is the employee leave policy?',
  'What is the project approval process?',
];

export interface KnowledgeQAMapping {
  keywords: string[];
  conciseResponse: string;
  detailedResponse: string;
  summarizeResponse: string;
  sources: Array<{
    documentName: string;
    page: number;
    section: string;
    relevanceScore: number;
    excerpt: string;
    chunkId?: string;
    tokenCount?: number;
  }>;
  confidence: 'High' | 'Medium';
  followUpQuestions: string[];
}

export const KNOWLEDGE_QA_MAPPINGS: KnowledgeQAMapping[] = [
  {
    keywords: ['remote', 'work from home', 'wfh', 'telecommute', 'hybrid'],
    conciseResponse: `Employees in eligible enterprise roles may work remotely up to three (3) days per week with departmental manager sign-off. Core availability hours are 10:00 AM to 4:00 PM local time, and corporate Zero-Trust VPN is strictly required for internal access.`,
    detailedResponse: `According to the approved Enterprise Remote Work Policy (Section 4) and Employee Handbook (Section 18):\n\n### 1. Hybrid Allocation & Eligibility\n• Full-time regular staff in designated hybrid-eligible roles may work remotely up to three (3) days per calendar week.\n• Remote arrangements require mutual agreement and formal sign-off by the departmental director via the HR Portal.\n\n### 2. Core Collaborative Hours\n• Employees must remain actively reachable on Slack and corporate email during collaborative core hours (10:00 AM – 4:00 PM in the employee’s local time zone).\n\n### 3. Equipment, Broadband & Home Ergonomics\n• A one-time remote workstation allowance of $500 is claimable through Concur for ergonomic chairs, desks, or external monitors.\n• A recurring monthly broadband stipend of $50 is reimbursed with proof of utility bill.\n\n### 4. Zero-Trust Security Protocols\n• Work from unencrypted public Wi-Fi without active Zero-Trust VPN client connection is strictly prohibited.\n• Workstations automatically lock after five (5) minutes of idle time.`,
    summarizeResponse: `• **Quota**: Up to 3 remote days/week with manager approval.\n• **Core Hours**: 10:00 AM – 4:00 PM local time.\n• **Stipends**: $500 one-time setup + $50/month broadband allowance.\n• **Security**: Corporate Zero-Trust VPN mandatory at all times.`,
    sources: [
      {
        documentName: 'Remote Work Policy.pdf',
        page: 4,
        section: 'Eligible Roles & Schedule',
        relevanceScore: 0.95,
        chunkId: 'chk-rem-2',
        tokenCount: 512,
        excerpt: 'Eligible staff may perform duties remotely for up to three (3) business days per calendar week, subject to direct manager approval. Team core collaborative hours are established between 10:00 AM and 4:00 PM in the employee’s primary designated time zone.',
      },
      {
        documentName: 'Employee Handbook.docx',
        page: 18,
        section: 'Remote Work Standards',
        relevanceScore: 0.89,
        chunkId: 'chk-hnd-1',
        tokenCount: 495,
        excerpt: 'The organization fosters flexible working arrangements built upon accountability and transparent delivery. All remote work must be conducted through company-provisioned secure endpoints equipped with managed EDR.',
      },
    ],
    confidence: 'High',
    followUpQuestions: [
      'How do I submit the $500 home workstation expense in Concur?',
      'What are the core collaborative hours for cross-timezone teams?',
      'Can employees work remotely from outside their home state or country?',
    ],
  },
  {
    keywords: ['security', 'infosec', 'password', 'mfa', 'encryption', 'phishing'],
    conciseResponse: `Mandatory cybersecurity standards require hardware FIDO2 MFA on enterprise accounts, full-disk volume encryption (BitLocker/FileVault), and strict prohibition of unapproved external drives. Report security anomalies within 30 minutes.`,
    detailedResponse: `Based on the Information Security Policy (Sections 2 & 3) and IT Support Manual (Section 9):\n\n### 1. Identity & Multi-Factor Authentication\n• Mandatory Multi-Factor Authentication (MFA) is enforced across all enterprise IdPs.\n• Engineering, DevOps, and privileged system administrators must use hardware security keys (FIDO2/WebAuthn).\n• Passwords must be at least 14 alphanumeric characters and are cycled every 90 days.\n\n### 2. Workstation Defense & Endpoint Hygiene\n• Full-disk volume encryption (BitLocker XTS-AES 256 or macOS FileVault 2) is enforced automatically via MDM.\n• Inactivity timeout is set to 5 minutes across all corporate laptops.\n• Personal USB drives and non-approved cloud storage providers are blocked at the kernel level.\n\n### 3. Incident Triage & Reporting\n• Suspicious emails, credential stuffing alerts, or device loss must be reported to security@enterprise.com within 30 minutes.`,
    summarizeResponse: `• **Authentication**: Mandatory FIDO2 hardware MFA; 14-char passwords.\n• **Encryption**: Automated BitLocker / FileVault with 5-minute screen lock.\n• **Peripherals**: Personal USB drives blocked by endpoint agent.\n• **Incident SLA**: 30-minute escalation window to security@enterprise.com.`,
    sources: [
      {
        documentName: 'Information Security Policy.pdf',
        page: 3,
        section: 'Authentication & Endpoint Protection',
        relevanceScore: 0.97,
        chunkId: 'chk-sec-1',
        tokenCount: 510,
        excerpt: 'Mandatory Multi-Factor Authentication (MFA) must be enforced across all corporate Identity Providers (IdP). Hardware security keys (FIDO2/WebAuthn) are mandatory for engineers, system administrators, and staff accessing confidential client repositories.',
      },
      {
        documentName: 'IT Support Manual.pdf',
        page: 9,
        section: 'Security Escalations',
        relevanceScore: 0.86,
        chunkId: 'chk-it-2',
        tokenCount: 420,
        excerpt: 'Tier 1 infosec alerts require automated quarantine of affected endpoints. The Help Desk must alert on-call SecOps immediately for unauthorized lateral movement attempts.',
      },
    ],
    confidence: 'High',
    followUpQuestions: [
      'How do I request a replacement hardware FIDO2 key?',
      'What should I do if I accidentally clicked a suspected phishing link?',
      'Are password managers like 1Password or Bitwarden supported?',
    ],
  },
  {
    keywords: ['leave', 'pto', 'vacation', 'sick', 'holiday', 'parental', 'time off'],
    conciseResponse: `Full-time regular employees accrue 20 days of annual PTO (scaling to 25 days after 3 years), receive 10 separate wellness/sick days, and 16 weeks of fully paid parental leave for primary caregivers. Up to 5 PTO days rollover into Q1.`,
    detailedResponse: `Per the official Employee Handbook (Section 24, Paid Time Off & Holidays):\n\n### 1. Annual PTO Accrual\n• Years 1–3: 20 days per calendar year, accrued at 1.66 days per month worked.\n• Years 4+: Accrual scales to 25 days per calendar year (2.08 days per month).\n\n### 2. Sick & Wellness Days\n• 10 dedicated wellness days per year, usable for personal illness or family care.\n• Medical notes are only required for absences exceeding 3 consecutive business days.\n\n### 3. Parental Leave Policy\n• Primary caregivers: 16 weeks of 100% paid leave.\n• Secondary caregivers: 8 weeks of 100% paid leave.\n\n### 4. Carryover Restrictions\n• Up to 5 unused PTO days can be rolled into the subsequent calendar year, expiring on March 31st.`,
    summarizeResponse: `• **Annual PTO**: 20 days (years 1–3), 25 days (years 4+).\n• **Sick Leave**: 10 separate wellness days annually.\n• **Parental**: 16 weeks (primary) / 8 weeks (secondary) at 100% pay.\n• **Rollover**: Max 5 days into new year, expiring March 31st.`,
    sources: [
      {
        documentName: 'Employee Handbook.docx',
        page: 24,
        section: 'Paid Time Off & Holidays',
        relevanceScore: 0.94,
        chunkId: 'chk-hnd-2',
        tokenCount: 504,
        excerpt: 'Standard annual paid time off (PTO) accrual starts at 20 days per fiscal calendar year, accruing at 1.66 days per month for employees with under 3 years of service. After 3 years, accrual scales to 25 days. Employees receive 10 separate wellness/sick days per annum.',
      },
    ],
    confidence: 'High',
    followUpQuestions: [
      'How do I submit a time-off request in Workday?',
      'Can unused PTO be paid out in cash upon department transfer?',
      'How does parental leave integrate with state disability benefits?',
    ],
  },
  {
    keywords: ['approval', 'project', 'pmo', 'stage-gate', 'budget', 'procurement', 'gate'],
    conciseResponse: `Enterprise projects follow a 4-Stage Gate process: Concept Brief (Gate 1), Feasibility & Architecture (Gate 2), Implementation & Sprint Tracking (Gate 3), and Operational Handover (Gate 4). Budgets over $50,000 require PMO steering approval.`,
    detailedResponse: `According to the Project Management Guidelines (Section 7, Governance Lifecycle):\n\n### 1. Gate 1: Concept & Alignment\n• Departmental submission of a 2-page project charter aligning with quarterly strategic OKRs.\n\n### 2. Gate 2: Feasibility, Budget & Architecture\n• Technical architecture review by the Engineering Staff Committee and Infosec risk assessment.\n• Initiatives exceeding $50,000 require Stage-Gate Steering Committee majority vote.\n\n### 3. Gate 3: Execution & Resourcing\n• Bi-weekly sprint milestones, burn-rate monitoring, and vendor milestone sign-offs.\n\n### 4. Gate 4: Operational Handover & Post-Mortem\n• Complete handover to operations, end-user documentation, and 90-day impact retrospective.`,
    summarizeResponse: `• **Gate 1**: Charter alignment with quarterly enterprise OKRs.\n• **Gate 2**: Tech feasibility & Infosec audit; $50k+ requires PMO committee.\n• **Gate 3**: Execution, sprint milestones, and bi-weekly budget audit.\n• **Gate 4**: Final documentation archive and 90-day post-mortem review.`,
    sources: [
      {
        documentName: 'Project Management Guidelines.pdf',
        page: 7,
        section: 'Stage-Gate Lifecycle',
        relevanceScore: 0.92,
        chunkId: 'chk-pm-1',
        tokenCount: 480,
        excerpt: 'Initiatives exceeding $50,000 or cross-department dependencies require Stage-Gate 2 steering committee consensus prior to procurement.',
      },
    ],
    confidence: 'High',
    followUpQuestions: [
      'Where can I download the Stage-Gate 2 business case template?',
      'Who sits on the PMO Steering Committee for engineering initiatives?',
      'How are cross-department dependencies tracked across sprints?',
    ],
  },
  {
    keywords: ['privacy', 'gdpr', 'ccpa', 'pii', 'data', 'customer data'],
    conciseResponse: `Under the Enterprise Data Privacy Policy, customer PII must be encrypted at rest, retained for a maximum of 36 months post-contract, and Data Subject Access Requests (DSARs) must be executed within 30 calendar days.`,
    detailedResponse: `As governed by the Data Privacy Policy (Section 6, Customer Rights & Retention):\n\n### 1. Data Minimization & Segregation\n• Engineering teams must collect only personal data strictly required to deliver operational SLAs.\n• Customer PII must never be duplicated into development, staging, or testing sandbox environments.\n\n### 2. Statutory Retention Limits\n• Customer personal identifiers are automatically purged thirty-six (36) months following service contract expiration.\n\n### 3. Subject Access & Erasure (DSAR)\n• All access, rectification, or right-to-be-forgotten requests must be routed to privacy@enterprise.com and fulfilled within 30 days.\n\n### 4. Third-Party Sub-Processors\n• Any vendor ingesting customer telemetry must execute the corporate Data Processing Addendum (DPA) with standard contractual clauses.`,
    summarizeResponse: `• **Sanitization**: No customer PII in staging or sandbox environments.\n• **Retention**: 36-month purge policy following contract closure.\n• **DSAR SLA**: Mandatory 30-day fulfillment window for privacy requests.\n• **Vendors**: Required execution of Enterprise Data Processing Addendum.`,
    sources: [
      {
        documentName: 'Data Privacy Policy.docx',
        page: 6,
        section: 'Customer Rights & Retention',
        relevanceScore: 0.93,
        chunkId: 'chk-priv-1',
        tokenCount: 460,
        excerpt: 'Customer PII must never reside in unencrypted staging environments. Data subjects have a 30-day statutory response window for erasure requests.',
      },
    ],
    confidence: 'High',
    followUpQuestions: [
      'How do I submit an internal Data Privacy Impact Assessment (DPIA)?',
      'What is the procedure when a customer requests complete account erasure?',
      'Which sub-processors are currently authorized under our SOC 2 Type II report?',
    ],
  },
  {
    keywords: ['it', 'support', 'hardware', 'laptop', 'vpn', 'ticket', 'help desk'],
    conciseResponse: `IT Support operates with defined SLAs: P1 (Critical Outage) initial response within 15 minutes, P2 (Major Degradation) within 2 hours, and P3 (Standard Requests) within 1 business day. Standard laptops are refreshed every 36 months.`,
    detailedResponse: `According to the IT Support Manual (Section 4, Service Levels & Lifecycle Management):\n\n### 1. Incident Priority Classifications\n• **Priority 1 (Critical)**: Production outage, revenue-impacting system downtime, or enterprise security breach — 15 minute first response SLA.\n• **Priority 2 (High)**: Major departmental degradation or unbootable hardware without spare — 2 hour SLA.\n• **Priority 3 (Standard)**: Peripheral requests, routine software licenses, or general inquiries — 1 business day SLA.\n\n### 2. Hardware Refresh Standards\n• Corporate macOS and Windows workstations undergo automatic hardware refresh every thirty-six (36) months.\n• Battery replacements and mechanical repairs are coordinated via on-site depot or overnight mail-in dispatch.`,
    summarizeResponse: `• **P1 (Critical)**: 15-minute response SLA; 24/7 on-call triage.\n• **P2 (High)**: 2-hour response SLA.\n• **P3 (Standard)**: 1-business-day response SLA.\n• **Hardware Cycle**: 36-month standard workstation replacement cycle.`,
    sources: [
      {
        documentName: 'IT Support Manual.pdf',
        page: 4,
        section: 'Ticket SLAs & Hardware Lifecycles',
        relevanceScore: 0.96,
        chunkId: 'chk-it-1',
        tokenCount: 450,
        excerpt: 'Priority 1 (production blockage) tickets have an initial response SLA of 15 minutes, with full triage escalation to Tier 3 on-call engineers.',
      },
    ],
    confidence: 'High',
    followUpQuestions: [
      'How do I check when my corporate laptop is eligible for a refresh?',
      'What is the on-call phone number for P1 production emergencies?',
      'Can I request a secondary external monitor for my home office?',
    ],
  },
];
