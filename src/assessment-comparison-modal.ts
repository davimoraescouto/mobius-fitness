
import {
    App,
    Modal,
    Notice,
    Setting
} from 'obsidian';

import {
    AssessmentReader,
    type AssessmentData
} from './assessment-reader';

import {
    compareAssessments,
    type AssessmentComparison,
    type MeasurementComparison
} from './assessment-comparison';

import {
    getLanguage,
    getMeasurementLabel,
    t
} from './i18n';

function formatDate(value: string): string {
    const [year, month, day] = value.split('-');

    if (!year || !month || !day) {
        return value;
    }

    return getLanguage() === 'pt-BR'
        ? `${day}/${month}/${year}`
        : `${month}/${day}/${year}`;
}

function formatNumber(value: number): string {
    const locale = getLanguage() === 'pt-BR'
        ? 'pt-BR'
        : 'en-US';

    return value.toLocaleString(locale, {
        maximumFractionDigits: 2
    });
}

function formatSignedNumber(value: number): string {
    const normalized = Object.is(value, -0)
        ? 0
        : value;

    return `${normalized > 0 ? '+' : ''}${formatNumber(normalized)}`;
}

export class AssessmentComparisonModal extends Modal {
    private assessments: AssessmentData[] = [];

    private previousDate = '';
    private currentDate = '';

    constructor(
        app: App,
        private readonly reader: AssessmentReader
    ) {
        super(app);
    }

    onOpen(): void {
        this.assessments = this.reader
            .readAllAssessments()
            .filter(
                assessment => assessment.status === 'valid'
            );

        this.render();
    }

    private render(): void {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h2', {
            text: t('assessmentComparison', 'title')
        });

        if (this.assessments.length < 2) {
            contentEl.createEl('p', {
                text: t(
                    'assessmentComparison',
                    'minimumAssessments'
                )
            });
            return;
        }

        const current = this.assessments[0];
        const previous = this.assessments[1];

        if (!current || !previous) {
            return;
        }

        this.currentDate = current.date;
        this.previousDate = previous.date;

        new Setting(contentEl)
            .setName(
                t(
                    'assessmentComparison',
                    'previousAssessment'
                )
            )
            .addDropdown(dropdown => {
                for (const assessment of this.assessments) {
                    dropdown.addOption(
                        assessment.date,
                        formatDate(assessment.date)
                    );
                }

                dropdown.setValue(this.previousDate);

                dropdown.onChange(value => {
                    this.previousDate = value;
                });
            });

        new Setting(contentEl)
            .setName(
                t(
                    'assessmentComparison',
                    'currentAssessment'
                )
            )
            .addDropdown(dropdown => {
                for (const assessment of this.assessments) {
                    dropdown.addOption(
                        assessment.date,
                        formatDate(assessment.date)
                    );
                }

                dropdown.setValue(this.currentDate);

                dropdown.onChange(value => {
                    this.currentDate = value;
                });
            });

        const results = contentEl.createDiv({
            cls: 'mobius-comparison-results'
        });

        new Setting(contentEl)
            .addButton(button => {
                button
                    .setButtonText(
                        t('assessmentComparison', 'compare')
                    )
                    .setCta()
                    .onClick(() => {
                        this.runComparison(results);
                    });
            });

        this.runComparison(results);
    }

    private runComparison(
        container: HTMLElement
    ): void {
        container.empty();

        const previous = this.assessments.find(
            assessment =>
                assessment.date === this.previousDate
        );

        const current = this.assessments.find(
            assessment =>
                assessment.date === this.currentDate
        );

        if (
            !previous ||
            !current ||
            previous.date === current.date
        ) {
            new Notice(
                t('assessmentComparison', 'selectValid')
            );
            return;
        }

        let comparison: AssessmentComparison;

        try {
            comparison = compareAssessments(
                previous,
                current
            );
        } catch (error) {
            console.error(
                'Mobius Fitness: comparison failed.',
                error
            );

            container.createEl('p', {
                text: error instanceof Error
                    ? error.message
                    : t(
                        'assessmentComparison',
                        'compareError'
                    )
            });

            return;
        }

        container.createEl('h3', {
            text:
                `${formatDate(comparison.previousDate)} → ` +
                `${formatDate(comparison.currentDate)}`
        });

        if (comparison.measurements.length === 0) {
            container.createEl('p', {
                text: t(
                    'assessmentComparison',
                    'noCommonMeasurements'
                )
            });
            return;
        }

        for (const measurement of comparison.measurements) {
            this.renderMeasurementCard(
                container,
                measurement
            );
        }
    }

    private renderMeasurementCard(
        container: HTMLElement,
        measurement: MeasurementComparison
    ): void {
        const card = container.createDiv({
            cls: 'mobius-comparison-card'
        });

        card.style.padding = '12px';
        card.style.marginBottom = '10px';
        card.style.borderRadius = '8px';
        card.style.backgroundColor =
            'var(--background-secondary)';
        card.style.border =
            '1px solid var(--background-modifier-border)';

        const title = card.createEl('strong', {
            text: getMeasurementLabel(measurement.key)
        });

        title.style.display = 'block';
        title.style.marginBottom = '10px';

        const values = card.createDiv({
            cls: 'mobius-comparison-values'
        });

        values.style.display = 'grid';
        values.style.gridTemplateColumns =
            'repeat(2, minmax(0, 1fr))';
        values.style.gap = '12px';

        const previous = values.createDiv();

        const previousLabel = previous.createDiv({
            text: t(
                'assessmentComparison',
                'previous'
            )
        });

        previousLabel.style.color = 'var(--text-muted)';
        previousLabel.style.fontSize = '0.85em';

        previous.createEl('strong', {
            text:
                `${formatNumber(measurement.previous)} ` +
                measurement.unit
        });

        const current = values.createDiv();

        const currentLabel = current.createDiv({
            text: t(
                'assessmentComparison',
                'current'
            )
        });

        currentLabel.style.color = 'var(--text-muted)';
        currentLabel.style.fontSize = '0.85em';

        current.createEl('strong', {
            text:
                `${formatNumber(measurement.current)} ` +
                measurement.unit
        });

        const variation = card.createDiv();

        variation.style.marginTop = '10px';
        variation.style.paddingTop = '8px';
        variation.style.borderTop =
            '1px solid var(--background-modifier-border)';

        const absoluteDifference =
            measurement.unit === '%'
                ? (
                    `${formatSignedNumber(measurement.difference)} ` +
                    t(
                        'assessmentComparison',
                        'percentagePoints'
                    )
                )
                : (
                    `${formatSignedNumber(measurement.difference)} ` +
                    measurement.unit
                );

        const percentageDifference =
            measurement.percentageChange === null
                ? t(
                    'assessmentComparison',
                    'notAvailable'
                )
                : (
                    `${formatSignedNumber(measurement.percentageChange)}%`
                );

        variation.createSpan({
            text:
                `${t('assessmentComparison', 'variation')}: `
        });

        variation.createEl('strong', {
            text:
                `${absoluteDifference} ` +
                `(${percentageDifference})`
        });
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
