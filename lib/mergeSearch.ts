import type { Professor, SearchResponse } from './types';

function normName(name: string) {
    return name.toLowerCase().replace(/\s+/g, ' ').trim();
}

function schoolTag(university: string): string {
    if (university.includes('Columbia')) return 'Columbia';
    if (university.includes('NYU')) return 'NYU';
    return university;
}

/** Merge two search responses (e.g. Columbia + NYU). Dedupes by professor name; keeps higher alignment score. */
export function mergeSearchResponses(
    resA: SearchResponse,
    resB: SearchResponse,
    universityA: string,
    universityB: string
): SearchResponse {
    const tagA = schoolTag(universityA);
    const tagB = schoolTag(universityB);
    const map = new Map<string, Professor>();

    const ingest = (res: SearchResponse, tag: string) => {
        for (const p of res.professors || []) {
            const key = normName(p.name);
            const cur = map.get(key);
            if (!cur) {
                map.set(key, { ...p, institutions: [tag] });
                continue;
            }
            const institutions = Array.from(new Set([...(cur.institutions || []), tag]));
            const preferNew = (p.alignment_score || 0) >= (cur.alignment_score || 0);
            const base = preferNew ? { ...p } : { ...cur };
            map.set(key, { ...base, institutions });
        }
    };

    ingest(resA, tagA);
    ingest(resB, tagB);

    const professors = Array.from(map.values()).sort(
        (x, y) => (y.alignment_score || 0) - (x.alignment_score || 0)
    );

    return {
        professors,
        total_verified: (resA.total_verified || 0) + (resB.total_verified || 0),
        pipeline_metadata: {
            intent_extracted: !!(
                resA.pipeline_metadata?.intent_extracted || resB.pipeline_metadata?.intent_extracted
            ),
            professors_found:
                (resA.pipeline_metadata?.professors_found || 0) +
                (resB.pipeline_metadata?.professors_found || 0),
            professors_verified:
                (resA.pipeline_metadata?.professors_verified || 0) +
                (resB.pipeline_metadata?.professors_verified || 0),
            embeddings_computed:
                (resA.pipeline_metadata?.embeddings_computed || 0) +
                (resB.pipeline_metadata?.embeddings_computed || 0),
        },
        intent: resA.intent ?? resB.intent,
    };
}

/** Ensure each professor has institution chips for the UI. */
export function annotateSchoolTags(professors: Professor[], university: string): Professor[] {
    const tag = schoolTag(university);
    return professors.map((p) => ({
        ...p,
        institutions: p.institutions?.length ? p.institutions : [tag],
    }));
}
