
import { App, Modal, Notice } from 'obsidian';

import {
    AssessmentReader,
    type AssessmentData
} from './assessment-reader';

import { MEASUREMENT_GROUPS } from './measurements';

import {
    getLanguage,
    getMeasurementLabel,
    t
} from './i18n';

function getLocale(): string {
    return getLanguage() === 'pt-BR'
        ? 'pt-BR'
        : 'en-US';
}

function formatDate(value: string): string {
    const [year, month, day] = value.split('-');

    if (!year || !month || !day) {
        return value;
    }

    if (getLanguage() === 'pt-BR') {
        return `${day}/${month}/${year}`;
    }

    return `${month}/${day}/${year}`;
}

function formatMeasurement(
    value: number,
    unit: string
): string {
    return `${value.toLocaleString(getLocale())} ${unit}`;
}

export class AssessmentHistoryModal extends Modal {
    constructor(
        app: App,
        private readonly reader: AssessmentReader
    ) {
        super(app);
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h2', {
            text: t('assessmentHistory', 'title')
        });

        const assessments =
            this.reader.readAllAssessments();

        const countText = assessments.length === 1
            ? t('assessmentHistory', 'countOne')
            : t('assessmentHistory', 'countMany')
                .replace(
                    '{count}',
                    String(assessments.length)
                );

        contentEl.createEl('p', {
            text: countText
        });

        if (assessments.length === 0) {
            contentEl.createEl('p', {
                text: t(
                    'assessmentHistory',
                    'noAssessments'
                )
            });

            return;
        }

        for (const assessment of assessments) {
            this.renderAssessment(
                contentEl,
                assessment
            );
        }
    }

    private renderAssessment(
        container: HTMLElement,
        assessment: AssessmentData
    ): void {
        const section = container.createDiv({
            cls: 'mobius-history-item'
        });

        section.style.padding = '12px 0';
        section.style.borderBottom =
            '1px solid var(--background-modifier-border)';

        const header = section.createEl('button', {
            text: formatDate(assessment.date),
            cls: 'mobius-history-open'
        });

        header.style.display = 'block';
        header.style.width = '100%';
        header.style.textAlign = 'left';
        header.style.fontWeight = '600';
        header.style.marginBottom = '8px';

        header.addEventListener('click', async () => {
            try {
                await this.app.workspace
                    .getLeaf(false)
                    .openFile(assessment.file);

                this.close();
            } catch (error) {
                console.error(
                    'Mobius Fitness: failed to open assessment.',
                    error
                );

                new Notice(
                    t('assessmentHistory', 'openError')
                );
            }
        });

if (assessment.status !== 'valid') {
    const warning = section.createEl('p', {
        text: assessment.warning ??
            t('assessmentHistory', 'invalidAssessment')
    });

            warning.style.color =
                assessment.status === 'pending'
                    ? 'var(--text-muted)'
                    : 'var(--text-error)';

            warning.style.fontSize = '0.9em';
            warning.style.margin = '4px 0';

            return;
        }

        let hasMeasurements = false;

        for (const group of MEASUREMENT_GROUPS) {
            for (const field of group.fields) {
                const value =
                    assessment.measurements[field.key];

                if (value === undefined) {
                    continue;
                }

                hasMeasurements = true;

                const line = section.createDiv();

                line.createSpan({
                    text: `${getMeasurementLabel(field.key)}: `
                });

                const result = line.createSpan({
                    text: formatMeasurement(
                        value,
                        field.unit
                    )
                });

                result.style.fontWeight = '500';
            }
        }

        if (!hasMeasurements) {
            const empty = section.createEl('p', {
                text: t(
                    'assessmentHistory',
                    'noMeasurements'
                )
            });

            empty.style.color = 'var(--text-muted)';
        }
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
