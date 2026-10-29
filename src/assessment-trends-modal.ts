
import { App, Modal, Setting } from 'obsidian';

import {
    AssessmentReader,
    type AssessmentData
} from './assessment-reader';

import {
    filterTrendByPeriod,
    getAvailableMeasurementTrends,
    type MeasurementTrend,
    type TrendPeriod,
    type TrendPoint
} from './assessment-trends';

import {
    getLanguage,
    getMeasurementLabel,
    t
} from './i18n';

function formatDate(
    value: string,
    includeYear = false
): string {
    const [year, month, day] = value.split('-');

    if (!year || !month || !day) {
        return value;
    }

    if (getLanguage() === 'pt-BR') {
        return includeYear
            ? `${day}/${month}/${year}`
            : `${day}/${month}`;
    }

    return includeYear
        ? `${month}/${day}/${year}`
        : `${month}/${day}`;
}

function formatValue(value: number): string {
    const locale = getLanguage() === 'pt-BR'
        ? 'pt-BR'
        : 'en-US';

    return value.toLocaleString(locale, {
        maximumFractionDigits: 2
    });
}

export class AssessmentTrendsModal extends Modal {
    private trends: MeasurementTrend[] = [];
    private selectedKey = 'peso_kg';
    private assessments: AssessmentData[] = [];
    private selectedPeriod: TrendPeriod = 'all';

    constructor(
        app: App,
        private readonly reader: AssessmentReader
    ) {
        super(app);
    }

    onOpen(): void {
        this.assessments =
            this.reader.readAllAssessments();

        this.trends = getAvailableMeasurementTrends(
            this.assessments
        );

        this.render();
    }

    private render(): void {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h2', {
            text: t('assessmentTrends', 'title')
        });

        if (this.trends.length === 0) {
            contentEl.createEl('p', {
                text: t(
                    'assessmentTrends',
                    'noMeasurements'
                )
            });

            return;
        }

        if (!this.trends.some(
            trend => trend.key === this.selectedKey
        )) {
            const firstTrend = this.trends[0];

            if (!firstTrend) {
                return;
            }

            this.selectedKey = firstTrend.key;
        }

        new Setting(contentEl)
            .setName(
                t('assessmentTrends', 'period')
            )
            .setDesc(
                t('assessmentTrends', 'periodDescription')
            )
            .addDropdown(dropdown => {
                dropdown.addOption(
                    'all',
                    t('assessmentTrends', 'allHistory')
                );

                dropdown.addOption(
                    '30',
                    t('assessmentTrends', 'days30')
                );

                dropdown.addOption(
                    '90',
                    t('assessmentTrends', 'days90')
                );

                dropdown.addOption(
                    '180',
                    t('assessmentTrends', 'days180')
                );

                dropdown.addOption(
                    '365',
                    t('assessmentTrends', 'year1')
                );

                dropdown.setValue(
                    String(this.selectedPeriod)
                );

                dropdown.onChange(value => {
                    if (value === 'all') {
                        this.selectedPeriod = 'all';
                    } else {
                        const days = Number(value);

                        if (
                            days !== 30 &&
                            days !== 90 &&
                            days !== 180 &&
                            days !== 365
                        ) {
                            return;
                        }

                        this.selectedPeriod = days;
                    }

                    this.renderSelectedTrend(
                        chartContainer
                    );
                });
            });

        const chartContainer = contentEl.createDiv({
            cls: 'mobius-trends-chart'
        });

        new Setting(contentEl)
            .setName(
                t('assessmentTrends', 'measurement')
            )
            .setDesc(
                t(
                    'assessmentTrends',
                    'measurementDescription'
                )
            )
            .addDropdown(dropdown => {
                for (const trend of this.trends) {
                    dropdown.addOption(
                        trend.key,
                        `${getMeasurementLabel(trend.key)} (${trend.unit})`
                    );
                }

                dropdown.setValue(this.selectedKey);

                dropdown.onChange(value => {
                    this.selectedKey = value;

                    this.renderSelectedTrend(
                        chartContainer
                    );
                });
            });

        // Mantém o gráfico abaixo do seletor.
        contentEl.appendChild(chartContainer);

        this.renderSelectedTrend(chartContainer);
    }

    private renderSelectedTrend(
        container: HTMLElement
    ): void {
        container.empty();

        const trend = this.trends.find(
            item => item.key === this.selectedKey
        );

        if (!trend) {
            container.createEl('p', {
                text: t(
                    'assessmentTrends',
                    'measurementNotFound'
                )
            });

            return;
        }

        const filteredTrend = filterTrendByPeriod(
            trend,
            this.assessments,
            this.selectedPeriod
        );

        const label = getMeasurementLabel(
            filteredTrend.key
        );

        container.createEl('h3', {
            text: label
        });

        if (filteredTrend.points.length === 0) {
            container.createEl('p', {
                text: t(
                    'assessmentTrends',
                    'noDataInPeriod'
                )
            });

            return;
        }

        if (filteredTrend.points.length === 1) {
            container.createEl('p', {
                text: t(
                    'assessmentTrends',
                    'onlyOneAssessment'
                )
            });

            const point = filteredTrend.points[0];

            if (!point) {
                return;
            }

            container.createEl('p', {
                text:
                    `${formatDate(point.date)}: ` +
                    `${formatValue(point.value)} ` +
                    filteredTrend.unit
            });

            return;
        }

        this.renderChart(
            container,
            filteredTrend.points,
            filteredTrend.unit,
            label
        );

        const count = filteredTrend.points.length;

        const countText = count === 1
            ? t(
                'assessmentTrends',
                'assessmentCountOne'
            )
            : t(
                'assessmentTrends',
                'assessmentCountMany'
            ).replace('{count}', String(count));

        container.createEl('p', {
            text: countText
        });
    }

    private renderChart(
        container: HTMLElement,
        points: TrendPoint[],
        unit: string,
        label: string
    ): void {
        const width = 600;
        const height = 320;

        const paddingLeft = 58;
        const paddingRight = 20;
        const paddingTop = 30;
        const paddingBottom = 55;

        const chartWidth =
            width - paddingLeft - paddingRight;

        const chartHeight =
            height - paddingTop - paddingBottom;

        const values = points.map(
            point => point.value
        );

        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);

        const valueRange = maxValue - minValue;

        const paddingValue =
            valueRange === 0
                ? Math.max(
                    Math.abs(maxValue) * 0.05,
                    1
                )
                : valueRange * 0.1;

        const yMin = minValue - paddingValue;
        const yMax = maxValue + paddingValue;

        const svgNS =
            'http://www.w3.org/2000/svg';

        const svg = document.createElementNS(
            svgNS,
            'svg'
        );

        svg.setAttribute(
            'viewBox',
            `0 0 ${width} ${height}`
        );

        svg.setAttribute('width', '100%');
        svg.setAttribute('role', 'img');

        svg.setAttribute(
            'aria-label',
            t(
                'assessmentTrends',
                'chartAriaLabel'
            ).replace('{measurement}', label)
        );

        svg.classList.add('mobius-trends-chart');

        container.appendChild(svg);

        // Painel com os detalhes do ponto selecionado.
        const details = container.createDiv({
            cls: 'mobius-trends-details'
        });

        details.createEl('strong', {
            cls: 'mobius-trends-details-title',
            text: t(
                'assessmentTrends',
                'selectedAssessment'
            )
        });

        const detailsContent = details.createDiv();

        const showPointDetails = (
            point: TrendPoint
        ): void => {
            detailsContent.empty();

            detailsContent.createEl('p', {
                text:
                    `${t('assessmentTrends', 'date')}: ` +
                    formatDate(point.date, true)
            });

            detailsContent.createEl('p', {
                text:
                    `${label}: ` +
                    `${formatValue(point.value)} ${unit}`
            });
        };

        // Exibe inicialmente a avaliação mais recente.
        const latestPoint =
            points[points.length - 1];

        if (latestPoint) {
            showPointDetails(latestPoint);
        }

        const createSvgElement = (
            tag: string,
            attributes: Record<string, string>
        ): SVGElement => {
            const element = document.createElementNS(
                svgNS,
                tag
            );

            for (
                const [key, value]
                of Object.entries(attributes)
            ) {
                element.setAttribute(key, value);
            }

            svg.appendChild(element);

            return element;
        };

        // Converte YYYY-MM-DD para timestamp UTC.
        const getTimestamp = (
            date: string
        ): number => {
            const parts = date.split('-');

            const invalidDateMessage = t(
                'assessmentTrends',
                'invalidDate'
            ).replace('{date}', date);

            if (parts.length !== 3) {
                throw new Error(invalidDateMessage);
            }

            const year = Number(parts[0]);
            const month = Number(parts[1]);
            const day = Number(parts[2]);

            if (
                !Number.isInteger(year) ||
                !Number.isInteger(month) ||
                !Number.isInteger(day) ||
                month < 1 ||
                month > 12 ||
                day < 1 ||
                day > 31
            ) {
                throw new Error(invalidDateMessage);
            }

            const timestamp = Date.UTC(
                year,
                month - 1,
                day
            );

            const parsed = new Date(timestamp);

            if (
                parsed.getUTCFullYear() !== year ||
                parsed.getUTCMonth() !== month - 1 ||
                parsed.getUTCDate() !== day
            ) {
                throw new Error(invalidDateMessage);
            }

            return timestamp;
        };

        const timestamps = points.map(
            point => getTimestamp(point.date)
        );

        const minTimestamp = Math.min(
            ...timestamps
        );

        const maxTimestamp = Math.max(
            ...timestamps
        );

        const timeRange =
            maxTimestamp - minTimestamp;

        const getX = (
            index: number
        ): number => {
            const timestamp = timestamps[index];

            if (
                timestamp === undefined ||
                timeRange === 0
            ) {
                return (
                    paddingLeft +
                    chartWidth / 2
                );
            }

            return (
                paddingLeft +
                (
                    (timestamp - minTimestamp) /
                    timeRange
                ) * chartWidth
            );
        };

        const getY = (
            value: number
        ): number =>
            paddingTop +
            (
                (yMax - value) /
                (yMax - yMin)
            ) * chartHeight;

        // Linhas de referência e valores do eixo Y.
        for (let i = 0; i <= 4; i++) {
            const value =
                yMin +
                ((yMax - yMin) * i) / 4;

            const y = getY(value);

            createSvgElement('line', {
                x1: String(paddingLeft),
                y1: String(y),
                x2: String(
                    width - paddingRight
                ),
                y2: String(y),
                stroke:
                    'var(--background-modifier-border)',
                'stroke-width': '1'
            });

            const text = createSvgElement(
                'text',
                {
                    x: String(paddingLeft - 8),
                    y: String(y + 4),
                    'text-anchor': 'end',
                    fill: 'var(--text-muted)',
                    'font-size': '12'
                }
            );

            text.textContent =
                formatValue(value);
        }

        // Linha de evolução.
        const linePoints = points
            .map(
                (point, index) =>
                    `${getX(index)},${getY(point.value)}`
            )
            .join(' ');

        createSvgElement('polyline', {
            points: linePoints,
            fill: 'none',
            stroke: 'var(--interactive-accent)',
            'stroke-width': '3',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
        });

        // Marcadores e rótulos de datas.
        for (
            let index = 0;
            index < points.length;
            index++
        ) {
            const point = points[index];

            if (!point) {
                continue;
            }

            const x = getX(index);
            const y = getY(point.value);

            const circle = createSvgElement(
                'circle',
                {
                    cx: String(x),
                    cy: String(y),
                    r: '9',
                    fill:
                        'var(--interactive-accent)',
                    stroke:
                        'var(--background-primary)',
                    'stroke-width': '2',
                    tabindex: '0',
                    role: 'button',
                    'aria-label':
                        `${formatDate(point.date)}: ` +
                        `${formatValue(point.value)} ${unit}`
                }
            );

            circle.classList.add('mobius-trends-point');

            circle.addEventListener(
                'click',
                () => {
                    showPointDetails(point);
                }
            );

            circle.addEventListener(
                'keydown',
                event => {
                    if (
                        event.key === 'Enter' ||
                        event.key === ' '
                    ) {
                        event.preventDefault();

                        showPointDetails(point);
                    }
                }
            );

            const title =
                document.createElementNS(
                    svgNS,
                    'title'
                );

            title.textContent =
                `${formatDate(point.date, true)}: ` +
                `${formatValue(point.value)} ${unit}`;

            circle.appendChild(title);

            // Exibe apenas as datas extremas.
            if (
                index === 0 ||
                index === points.length - 1
            ) {
                const dateLabel =
                    createSvgElement(
                        'text',
                        {
                            x: String(x),
                            y: String(
                                height -
                                paddingBottom +
                                22
                            ),
                            'text-anchor':
                                index === 0
                                    ? 'start'
                                    : 'end',
                            fill:
                                'var(--text-muted)',
                            'font-size': '11'
                        }
                    );

                dateLabel.textContent =
                    formatDate(point.date);
            }
        }
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
