
import { App, TFile, TFolder } from 'obsidian';

import { MEASUREMENT_GROUPS } from './measurements';
import { t } from './i18n';

export interface AssessmentFile {
    date: string;
    file: TFile;
}

export type AssessmentReadStatus =
    | 'valid'
    | 'pending'
    | 'invalid';

export interface AssessmentData {
    date: string;
    file: TFile;
    measurements: Record<string, number>;
    status: AssessmentReadStatus;
    warning?: string;
}

const ASSESSMENT_FILENAME =
    /^MobiusFitness(\d{4}-\d{2}-\d{2})\.md$/;

function isValidDate(value: string): boolean {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
        return false;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const date = new Date(0);
    date.setFullYear(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

function parseNumericValue(value: unknown): number | null {
    if (typeof value === 'number') {
        return Number.isFinite(value) && value >= 0
            ? value
            : null;
    }

    if (typeof value !== 'string') {
        return null;
    }

    const normalized = value.trim().replace(',', '.');

    if (!/^\d+(\.\d+)?$/.test(normalized)) {
        return null;
    }

    const parsed = Number(normalized);

    return Number.isFinite(parsed)
        ? parsed
        : null;
}

export class AssessmentReader {
    constructor(
        private readonly app: App,
        private readonly dataFolder: string
    ) { }

    listAssessments(): AssessmentFile[] {
        const folderPath = this.dataFolder.trim();

        if (!folderPath || folderPath === '/') {
            return [];
        }

        const folder =
            this.app.vault.getAbstractFileByPath(folderPath);

        if (!(folder instanceof TFolder)) {
            return [];
        }

        const assessments: AssessmentFile[] = [];

        for (const child of folder.children) {
            if (!(child instanceof TFile)) {
                continue;
            }

            const match =
                ASSESSMENT_FILENAME.exec(child.name);

            if (!match) {
                continue;
            }

            const date = match[1];

            if (!date || !isValidDate(date)) {
                continue;
            }

            assessments.push({
                date,
                file: child
            });
        }

        assessments.sort((a, b) =>
            b.date.localeCompare(a.date)
        );

        return assessments;
    }

    readAssessment(
        assessment: AssessmentFile
    ): AssessmentData {
        const cache = this.app.metadataCache
            .getFileCache(assessment.file);

        const measurements: Record<string, number> = {};

        if (!cache) {
            return {
                ...assessment,
                measurements,
                status: 'pending',
                warning: t('assessmentHistory', 'metadataPending')
            };
        }

        if (!cache.frontmatter) {
            return {
                ...assessment,
                measurements,
                status: 'invalid',
                warning: t('assessmentHistory', 'yamlMissing')
            };
        }

        if (
            cache.frontmatterPosition &&
            cache.frontmatterPosition.start.line !== 0
        ) {
            return {
                ...assessment,
                measurements,
                status: 'invalid',
                warning: t('assessmentHistory', 'yamlNotAtStart')
            };
        }

        const frontmatter = cache.frontmatter;

        if (
            frontmatter.tipo !== 'avaliacao_fisica'
        ) {
            return {
                ...assessment,
                measurements,
                status: 'invalid',
                warning: t('assessmentHistory', 'invalidAssessmentType')
            };
        }

        for (const group of MEASUREMENT_GROUPS) {
            for (const field of group.fields) {
                const value = parseNumericValue(
                    frontmatter[field.key]
                );

                if (value !== null) {
                    measurements[field.key] = value;
                }
            }
        }

        return {
            ...assessment,
            measurements,
            status: 'valid'
        };
    }

    readAllAssessments(): AssessmentData[] {
        return this.listAssessments().map(
            assessment => this.readAssessment(assessment)
        );
    }
}
