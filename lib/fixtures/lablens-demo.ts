import type { IntentPayload, Professor, SearchResponse } from '@/lib/types';
import type { ClientSearchParams } from '@/lib/searchSession';

export const demoSearchParams: ClientSearchParams = {
    student_interest:
        'I want to work on reliable machine learning for healthcare decisions — causality, uncertainty, and evaluation.',
    school_scope: 'columbia',
    student_level: 'masters',
    student_background: 'Python, one ML course, small Kaggle project.',
    department_filter: '',
    require_grant: false,
    min_alignment: 0,
};

export const demoIntent: IntentPayload = {
    primary_domain: 'trustworthy ML for health & causal reasoning',
    specific_topics: ['causal inference', 'uncertainty quantification', 'clinical ML', 'evaluation'],
    methods_mentioned: ['PyTorch', 'probabilistic models'],
    career_direction: 'industry',
    embedding_text:
        'Graduate student focused on reliable machine learning for healthcare: causal inference, uncertainty, and rigorous evaluation of clinical prediction models.',
    search_keywords: ['causal', 'ML', 'health', 'uncertainty', 'Columbia', 'professor'],
    student_level_context: "Master's student seeking research assistant or thesis advisor.",
};

function prof(
    id: string,
    name: string,
    score: number,
    overrides: Partial<Professor> & Pick<Professor, 'name' | 'university' | 'department'>
): Professor {
    const alignment_detail = {
        paper_scores: [58, 72, 81, 64, 70],
        best_paper_idx: 2,
        best_matching_paper_idx: 2,
        best_paper_title: 'Robust causal estimation under shift',
        raw_cosine: 0.71,
        statement_score: 68,
        model: 'all-MiniLM-L6-v2 (demo fixture)',
        embedding_dimensions: 384,
        confidence: 'high' as const,
    };

    const base: Professor = {
        id,
        name: overrides.name,
        university: overrides.university,
        institutions: overrides.institutions ?? ['Columbia'],
        department: overrides.department,
        lab_name: overrides.lab_name ?? 'Inference & Decision Lab',
        lab_url: overrides.lab_url ?? 'https://example.edu/lab',
        current_focus:
            overrides.current_focus ??
            'Causal representation learning and reliable deployment of ML in high-stakes settings, with emphasis on identifiability and shift.',
        open_questions: overrides.open_questions ?? [
            'How should we test causal claims when RCTs are infeasible?',
            'What minimal assumptions justify transport of treatment effects?',
        ],
        why_aligned:
            overrides.why_aligned ??
            'Your interest in trustworthy ML overlaps with their work on causal inference and evaluation under distribution shift.',
        best_paper_to_read: overrides.best_paper_to_read ?? {
            title: 'Causal Bounds Under Unobserved Confounding (demo)',
            why: 'Closest match to your stated interest in causal reasoning with realistic assumptions.',
        },
        alignment_score: score,
        alignment_detail,
        confidence: 'high',
        verification: overrides.verification ?? {
            verdict: 'ACTIVE',
            verdict_color: 'teal',
            reason: 'Demo fixture',
            confidence: 'high',
        },
        papers: overrides.papers ?? [
            {
                title: 'Causal Bounds Under Unobserved Confounding',
                abstract: 'We derive partial identification results...',
                url: 'https://arxiv.org/abs/demo1',
                submitted: '2025-08-01',
                year: 2025,
            },
            {
                title: 'Evaluating Clinical Risk Models Under Shift',
                abstract: 'Framework for monitoring performance when deployment cohorts drift...',
                url: 'https://arxiv.org/abs/demo2',
                submitted: '2025-03-15',
                year: 2025,
            },
        ],
        grants: overrides.grants ?? [
            {
                id: 'nsf-demo-1',
                title: 'Causal Machine Learning for Equitable Health Decisions',
                abstract: 'NSF-funded project on causal inference and fairness in clinical workflows.',
                amount: '480000',
                expires: '12/31/2027',
            },
        ],
        seed_ideas: overrides.seed_ideas ?? [
            {
                title: 'Shift-aware calibration audit',
                question:
                    'Could we design a pre-deployment checklist that combines conformal coverage with causal sensitivity analysis for one clinical pathway?',
                connection_to_professor: 'Builds on their evaluation + causal bounds themes.',
                connection_to_student: 'Uses your ML background and interest in reliability.',
                difficulty: 'masters_suitable',
            },
            {
                title: 'Synthetic controls for digital interventions',
                question: 'How would synthetic control methods apply to A/B tests with long carryover in mobile health?',
                connection_to_professor: 'Connects causal identification to applied digital health.',
                connection_to_student: 'Good scope for a semester project.',
                difficulty: 'undergrad_suitable',
            },
            {
                title: 'Minimax optimal sensitivity models',
                question: 'Can we characterize worst-case bias under a calibrated sensitivity model for observational studies?',
                connection_to_professor: 'Theoretical causal inference angle.',
                connection_to_student: 'Strong if you want PhD-level depth later.',
                difficulty: 'phd_level',
            },
        ],
        email_draft: overrides.email_draft ?? {
            subject: 'Question on causal bounds paper + RA interest (demo draft)',
            body: `Dear Prof. ${overrides.name.split(' ').pop()},\n\nI'm a master's student at Columbia interested in trustworthy ML for health. I read your recent work on causal bounds under unobserved confounding and was struck by how you connect partial identification to practical sensitivity analysis.\n\nI'm curious whether your lab has openings for students to work on evaluation under shift — I have Python/PyTorch experience and would love to contribute.\n\nThank you for your time,\n[Your name]`,
            word_count: 118,
            hook_paper: 'Causal Bounds Under Unobserved Confounding',
            seed_idea_used: 'Shift-aware calibration audit',
        },
        lab_culture: overrides.lab_culture ?? null,
        timing: overrides.timing ?? {
            timing_score: 82,
            verdict: 'good',
            verdict_color: 'teal',
            primary_reason: 'Recent preprint activity and active NSF window suggest inbox attention.',
            details: 'Demo timing model — replace with live pipeline output.',
            optimal_send_time: 'Tuesday or Wednesday morning, ET',
            next_window: 'After spring break noise settles',
            red_flags: ['Avoid mass CC to entire lab list'],
        },
        skills_gap: overrides.skills_gap ?? null,
        has_private_signal: false,
        three_tier_score: undefined,
        approach_strategy: overrides.approach_strategy,
    };

    return { ...base, ...overrides, alignment_detail, alignment_score: score };
}

export const demoProfessors: Professor[] = [
    prof('demo-prof-ada', 'Ada Chen', 88, {
        name: 'Ada Chen',
        university: 'Columbia University',
        department: 'Computer Science',
        institutions: ['Columbia'],
    }),
    prof('demo-prof-ben', 'Ben Okonkwo', 76, {
        name: 'Ben Okonkwo',
        university: 'Columbia University',
        department: 'Biomedical Informatics',
        institutions: ['Columbia'],
        alignment_score: 76,
        current_focus: 'NLP for clinical notes, label noise, and weak supervision for phenotyping.',
        why_aligned: 'Overlaps on reliable ML in medicine; more applied than theory-heavy causal work.',
    }),
    prof('demo-prof-cara', 'Cara Iverson', 71, {
        name: 'Cara Iverson',
        university: 'Columbia University',
        department: 'Statistics',
        institutions: ['Columbia'],
        alignment_score: 71,
        current_focus: 'Semiparametric efficiency and causal inference in high dimensions.',
        grants: [],
    }),
];

/** Extra fields normally returned from /professor/deep — merged in UI demo so all tabs render. */
export const demoDeepProfileOverlay: Partial<Professor> = {
    lab_culture: {
        culture_score: 78,
        strengths: [
            'Weekly reading group with clear expectations',
            'Co-author culture for strong student projects',
            'Mix of theory and applied health collaborations',
        ],
        watch_fors: ['Competitive funding cycles — clarify RA timeline early'],
        graduation_timeline: 'Typical PhD 5–6 years; MS students often 2-semester projects',
        mentorship_style_signals: 'Hands-on early, more independence after first project milestone',
        best_fit_for: 'Students who like proofs + coding and care about deployment context',
        questions_to_ask: [
            'How do you scope a first project for a new MS student?',
            'What does success look like before writing a paper?',
        ],
    },
    skills_gap: {
        required_skills: [
            { skill: 'Linear algebra & probability', importance: 'required', student_has: true },
            { skill: 'PyTorch or JAX', importance: 'required', student_has: true },
            { skill: 'Causal graphs / potential outcomes', importance: 'helpful', student_has: false },
            { skill: 'Reading clinical papers', importance: 'nice', student_has: false },
        ],
        critical_gaps: ['Formal causal inference coursework'],
        strengths: ['Implementation speed', 'Clear written communication'],
        two_week_prep: [
            {
                week: 1,
                tasks: ['Read Pearl Ch. 1–3 notes', 'Replicate one sensitivity analysis notebook'],
            },
            {
                week: 2,
                tasks: ['Skim professor’s last two papers', 'Draft 5-bullet project pitch'],
            },
        ],
        email_positioning: 'Lead with evaluation + reliability; ask one technical question from the bounds paper.',
    },
    alumni_data:
        'Dr. Jordan Lee — Apple ML Health (2024)\nDr. Sam Rivera — tenure-track Biostatistics, UW (2023)\nDr. Priya Shah — startup clinical NLP (2022)',
    approach_strategy: {
        recommended_entry: 'Cold email + ask to audit reading group',
        entry_rationale: 'Lab recruits heavily from engaged attendees.',
        specific_action: 'Mention one equation or figure from the bounds paper.',
        contact_target: 'Prof directly; CC admin only if requested.',
    },
};

export function mergeDemoProfile(prof: Professor): Professor {
    return {
        ...prof,
        ...demoDeepProfileOverlay,
        lab_culture: demoDeepProfileOverlay.lab_culture ?? prof.lab_culture,
        skills_gap: demoDeepProfileOverlay.skills_gap ?? prof.skills_gap,
        approach_strategy: demoDeepProfileOverlay.approach_strategy ?? prof.approach_strategy,
        alumni_data: demoDeepProfileOverlay.alumni_data ?? (prof as Professor & { alumni_data?: string }).alumni_data,
    };
}

export const demoSearchResponse: SearchResponse = {
    professors: demoProfessors,
    total_verified: 6,
    pipeline_metadata: {
        intent_extracted: true,
        professors_found: 8,
        professors_verified: 6,
        embeddings_computed: 6,
    },
    intent: demoIntent,
};
