// lib/types.ts — All TypeScript interfaces

export interface SearchRequest {
    student_interest: string;
    university: string;
    student_level: 'undergrad' | 'masters' | 'phd_applicant';
    student_background?: string;
    top_k?: number;
}

export interface AlignmentDetail {
    paper_scores: number[];
    best_paper_idx: number;
    best_paper_title: string;
    raw_cosine: number;
    statement_score?: number;
    best_matching_paper_idx?: number;
    model?: string;
    embedding_dimensions?: number;
    confidence?: string;
}

export interface AlignmentScore {
    alignment_score: number;
    raw_cosine: number;
    paper_scores: number[];
    best_matching_paper_idx: number;
    statement_score: number;
    confidence: 'high' | 'medium' | 'low';
}

export interface Paper {
    title: string;
    abstract: string;
    url: string;
    submitted: string;
    year?: number;
}

export interface Grant {
    title: string;
    abstract: string;
    amount: string;
    expires: string;
    id: string;
}

export interface SeedIdea {
    title: string;
    question: string;
    connection_to_professor: string;
    connection_to_student: string;
    difficulty: 'undergrad_suitable' | 'masters_suitable' | 'phd_level';
}

export interface EmailDraft {
    subject: string;
    body: string;
    word_count: number;
    hook_paper: string;
    seed_idea_used: string;
}

export interface LabCulture {
    culture_score: number;
    strengths: string[];
    watch_fors: string[];
    graduation_timeline: string;
    mentorship_style_signals: string;
    best_fit_for: string;
    questions_to_ask: string[];
}

export interface TimingInfo {
    timing_score: number;
    verdict: 'excellent' | 'good' | 'caution' | 'wait';
    verdict_color: 'teal' | 'amber' | 'coral';
    primary_reason: string;
    details: string;
    optimal_send_time: string;
    next_window: string | null;
    red_flags: string[];
}

export interface SkillsGap {
    required_skills: { skill: string; importance: string; student_has: boolean }[];
    critical_gaps: string[];
    strengths: string[];
    two_week_prep: { week: number; tasks: string[] }[];
    email_positioning: string;
}

export interface VerificationSignal {
    verdict: 'ACTIVE' | 'UNCERTAIN' | 'INACTIVE';
    verdict_color: string;
    reason: string;
    confidence: string;
}

export interface ThreeTierScore {
    composite_score: number;
    tier1_contribution: number;
    tier2_contribution: number;
    tier3_score: number | null;
    has_private_signal: boolean;
    private_signal_message: string | null;
    student_facing_message: string | null;
}

export interface Professor {
    id: string;
    name: string;
    university: string;
    department: string;
    lab_name?: string;
    lab_url?: string;
    current_focus: string;
    open_questions: string[];
    why_aligned: string;
    best_paper_to_read: { title: string; why: string } | null;
    alignment_score: number;
    alignment_detail: AlignmentDetail;
    confidence: string;
    verification: VerificationSignal;
    papers: Paper[];
    grants: Grant[];
    seed_ideas: SeedIdea[];
    email_draft: EmailDraft | null;
    lab_culture: LabCulture | null;
    timing: TimingInfo | null;
    skills_gap: SkillsGap | null;
    has_private_signal: boolean;
    three_tier_score?: ThreeTierScore;
    approach_strategy?: {
        recommended_entry: string;
        entry_rationale: string;
        specific_action: string;
        contact_target: string;
    };
    alumni?: Alumni[];
}

export interface Alumni {
    name: string;
    graduation_year: string;
    current_position: string;
    current_company: string;
    research_area: string;
}

export interface IntentPayload {
    primary_domain?: string;
    specific_topics?: string[];
    methods_mentioned?: string[];
    career_direction?: string;
    embedding_text?: string;
    search_keywords?: string[];
    student_level_context?: string;
}

export interface SearchResponse {
    professors: Professor[];
    total_verified: number;
    pipeline_metadata: {
        intent_extracted: boolean;
        professors_found: number;
        professors_verified: number;
        embeddings_computed: number;
    };
    intent?: IntentPayload | null;
    message?: string;
}

export type TrackerState =
    | 'NOT_CONTACTED'
    | 'EMAIL_DRAFTED'
    | 'EMAIL_SENT'
    | 'WAITING'
    | 'FOLLOW_UP_READY'
    | 'FOLLOWED_UP'
    | 'REPLIED_POSITIVE'
    | 'REPLIED_NEGATIVE'
    | 'MEETING_SCHEDULED'
    | 'NO_REPLY';

export interface TrackerEntry {
    professor_id: string;
    professor_name: string;
    state: TrackerState;
    sent_at: string | null;
    follow_up_at: string | null;
    email_subject: string;
    days_waiting: number;
}
