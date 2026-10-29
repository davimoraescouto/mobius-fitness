
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

        const header = section.createEl('button', {
            text: formatDate(assessment.date),
            cls: 'mobius-history-open'
        });

        header.addEventListener('click', () => {
            void this.openAssessment(assessment);
        });

        if (assessment.status !== 'valid') {
            section.createEl('p', {
                text: assessment.warning ??
                    t(
                        'assessmentHistory',
                        'invalidAssessment'
                    ),
                cls: [
                    'mobius-history-warning',
                    assessment.status === 'pending'
                        ? 'mobius-history-warning-pending'
                        : 'mobius-history-warning-invalid'
                ]
            });

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
                    text:
                        `${getMeasurementLabel(field.key)}: `
                });

                line.createSpan({
                    text: formatMeasurement(
                        value,
                        field.unit
                    ),
                    cls: 'mobius-history-measurement-value'
                });
            }
        }

        if (!hasMeasurements) {
            section.createEl('p', {
                text: t(
                    'assessmentHistory',
                    'noMeasurements'
                ),
                cls: 'mobius-history-empty'
            });
        }
    }

    private async openAssessment(
        assessment: AssessmentData
    ): Promise<void> {
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
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
