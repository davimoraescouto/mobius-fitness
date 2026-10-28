
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

function formatDate(value: string): string {
    const [year, month, day] = value.split('-');
    return `${day}/${month}`;
}

function formatValue(value: number): string {
    return value.toLocaleString('pt-BR', {
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
        this.assessments = this.reader.readAllAssessments();

        this.trends = getAvailableMeasurementTrends(
            this.assessments
        );

        this.render();
    }

    private render(): void {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h2', {
            text: 'Evolução corporal'
        });

        if (this.trends.length === 0) {
            contentEl.createEl('p', {
                text: 'Nenhuma medida corporal disponível.'
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
            .setName('Período')
            .setDesc('Intervalo de avaliações exibido no gráfico.')
            .addDropdown(dropdown => {
                dropdown.addOption('all', 'Todo o histórico');
                dropdown.addOption('30', '30 dias');
                dropdown.addOption('90', '90 dias');
                dropdown.addOption('180', '180 dias');
                dropdown.addOption('365', '1 ano');

                dropdown.setValue(String(this.selectedPeriod));

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

                    this.renderSelectedTrend(chartContainer);
                });
            });


        const chartContainer = contentEl.createDiv({
            cls: 'mobius-trends-chart'
        });

        new Setting(contentEl)
            .setName('Medida')
            .setDesc('Selecione a medida para visualizar a evolução.')
            .addDropdown(dropdown => {
                for (const trend of this.trends) {
                    dropdown.addOption(
                        trend.key,
                        `${trend.label} (${trend.unit})`
                    );
                }

                dropdown.setValue(this.selectedKey);

                dropdown.onChange(value => {
                    this.selectedKey = value;
                    this.renderSelectedTrend(chartContainer);
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
                text: 'Medida não encontrada.'
            });
            return;
        }

        const filteredTrend = filterTrendByPeriod(
            trend,
            this.assessments,
            this.selectedPeriod
        );

        container.createEl('h3', {
            text: filteredTrend.label
        });

        if (filteredTrend.points.length === 0) {
            container.createEl('p', {
                text: 'Nenhuma avaliação com esta medida no período selecionado.'
            });
            return;
        }

        if (filteredTrend.points.length === 1) {
            container.createEl('p', {
                text: 'Existe apenas uma avaliação com esta medida no período selecionado. São necessárias pelo menos duas para desenhar o gráfico.'
            });

            const point = filteredTrend.points[0];

            if (!point) {
                return;
            }

            container.createEl('p', {
                text: `${formatDate(point.date)}: ${formatValue(point.value)} ${filteredTrend.unit}`
            });

            return;
        }

        this.renderChart(
            container,
            filteredTrend.points,
            filteredTrend.unit,
            filteredTrend.label
        );

        container.createEl('p', {
            text: `${filteredTrend.points.length} avaliações com esta medida no período selecionado.`
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

    const values = points.map(point => point.value);

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const valueRange = maxValue - minValue;

    const paddingValue =
        valueRange === 0
            ? Math.max(Math.abs(maxValue) * 0.05, 1)
            : valueRange * 0.1;

    const yMin = minValue - paddingValue;
    const yMax = maxValue + paddingValue;

    const svgNS = 'http://www.w3.org/2000/svg';

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
        `Gráfico de evolução de ${label}`
    );

    svg.style.display = 'block';
    svg.style.maxWidth = '100%';

    container.appendChild(svg);


    // Painel com os detalhes do ponto selecionado.
    const details = container.createDiv({
        cls: 'mobius-trends-details'
    });

    details.style.marginTop = '12px';
    details.style.padding = '12px';
    details.style.borderRadius = '8px';
    details.style.backgroundColor =
        'var(--background-secondary)';
    details.style.border =
        '1px solid var(--background-modifier-border)';

    const detailsTitle = details.createEl('strong', {
        text: 'Avaliação selecionada'
    });

    detailsTitle.style.display = 'block';
    detailsTitle.style.marginBottom = '8px';

    const detailsContent = details.createDiv();

    const showPointDetails = (
        point: TrendPoint
    ): void => {
        detailsContent.empty();

        const [year, month, day] = point.date.split('-');

        detailsContent.createEl('p', {
            text: `Data: ${day}/${month}/${year}`
        });

        detailsContent.createEl('p', {
            text: `${label}: ${formatValue(point.value)} ${unit}`
        });
    };

    // Exibe inicialmente a avaliação mais recente.
    const latestPoint = points[points.length - 1];

    if(latestPoint) {
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

        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }

        svg.appendChild(element);
        return element;
    };


    // Converte a data YYYY-MM-DD em um valor numérico
    // independente do fuso horário local.

    const getTimestamp = (date: string): number => {
        const parts = date.split('-');

        if (parts.length !== 3) {
            throw new Error(`Data inválida: ${date}`);
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
            throw new Error(`Data inválida: ${date}`);
        }

        const timestamp = Date.UTC(year, month - 1, day);
        const parsed = new Date(timestamp);

        if (
            parsed.getUTCFullYear() !== year ||
            parsed.getUTCMonth() !== month - 1 ||
            parsed.getUTCDate() !== day
        ) {
            throw new Error(`Data inválida: ${date}`);
        }

        return timestamp;
    };


    const timestamps = points.map(
        point => getTimestamp(point.date)
    );

    const minTimestamp = Math.min(...timestamps);
    const maxTimestamp = Math.max(...timestamps);

    const timeRange = maxTimestamp - minTimestamp;

    const getX = (index: number): number => {
        const timestamp = timestamps[index];

        if (
            timestamp === undefined ||
            timeRange === 0
        ) {
            return paddingLeft + chartWidth / 2;
        }

        return paddingLeft +
            ((timestamp - minTimestamp) / timeRange) *
            chartWidth;
    };


    const getY = (value: number): number =>
        paddingTop +
        ((yMax - value) / (yMax - yMin)) *
        chartHeight;

    // Linhas de referência e valores do eixo Y.
    for(let i = 0; i <= 4; i++) {
    const value =
        yMin + ((yMax - yMin) * i) / 4;

    const y = getY(value);

    createSvgElement('line', {
        x1: String(paddingLeft),
        y1: String(y),
        x2: String(width - paddingRight),
        y2: String(y),
        stroke:
            'var(--background-modifier-border)',
        'stroke-width': '1'
    });

    const text = createSvgElement('text', {
        x: String(paddingLeft - 8),
        y: String(y + 4),
        'text-anchor': 'end',
        fill: 'var(--text-muted)',
        'font-size': '12'
    });

    text.textContent = formatValue(value);
}

// Linha de evolução.
const linePoints = points
    .map((point, index) =>
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


    const circle = createSvgElement('circle', {
        cx: String(x),
        cy: String(y),
        r: '9',
        fill: 'var(--interactive-accent)',
        stroke: 'var(--background-primary)',
        'stroke-width': '2',
        tabindex: '0',
        role: 'button',
        'aria-label':
            `${formatDate(point.date)}: ${formatValue(point.value)} ${unit}`
    });

    circle.style.cursor = 'pointer';

    circle.addEventListener('click', () => {
        showPointDetails(point);
    });

    circle.addEventListener('keydown', event => {
        if (
            event.key === 'Enter' ||
            event.key === ' '
        ) {
            event.preventDefault();
            showPointDetails(point);
        }
    });


    const title = document.createElementNS(
        svgNS,
        'title'
    );

    title.textContent =
        `${point.date}: ${formatValue(point.value)} ${unit}`;

    circle.appendChild(title);


    // Exibe somente as datas extremas para
    // evitar sobreposição em períodos próximos.
    if (
        index === 0 ||
        index === points.length - 1
    ) {
        const dateLabel = createSvgElement(
            'text',
            {
                x: String(x),
                y: String(
                    height - paddingBottom + 22
                ),
                'text-anchor':
                    index === 0 ? 'start' : 'end',
                fill: 'var(--text-muted)',
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
