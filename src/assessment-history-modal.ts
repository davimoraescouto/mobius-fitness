
import { App, Modal, Notice } from 'obsidian';

import {
    AssessmentReader,
    type AssessmentData
} from './assessment-reader';

import { MEASUREMENT_GROUPS } from './measurements';

function formatDate(value: string): string {
    const [year, month, day] = value.split('-');

    return `${day}/${month}/${year}`;
}

function formatMeasurement(
    value: number,
    unit: string
): string {
    return `${value.toLocaleString('pt-BR')} ${unit}`;
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
            text: 'Histórico de avaliações físicas'
        });

        const assessments = this.reader.readAllAssessments();

        contentEl.createEl('p', {
            text: `${assessments.length} avaliação(ões) encontrada(s).`
        });

        if (assessments.length === 0) {
            contentEl.createEl('p', {
                text: 'Nenhuma avaliação física encontrada na pasta configurada.'
            });

            return;
        }

        for (const assessment of assessments) {
            this.renderAssessment(contentEl, assessment);
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
                    'Mobius Fitness: erro ao abrir avaliação.',
                    error
                );

                new Notice(
                    'Não foi possível abrir a avaliação.'
                );
            }
        });

        if (assessment.status !== 'valid') {
            const warning = section.createEl('p', {
                text: assessment.warning ??
                    'Não foi possível interpretar os dados desta avaliação.'
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
                    text: `${field.label}: `
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
                text: 'Sem medidas registradas.'
            });

            empty.style.color = 'var(--text-muted)';
        }
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
