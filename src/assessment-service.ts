
import { App, TFolder } from 'obsidian';

import {
    MEASUREMENT_GROUPS,
    parseMeasurement
} from './measurements';

function validDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const parts = value.split('-');

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

export class AssessmentService {
    constructor(
        private readonly app: App,
        private readonly dataFolder: string
    ) {}

    private async ensureDataFolder(): Promise<string> {
        const folder = this.dataFolder.trim();

        if (!folder || folder === '/') {
            throw new Error(
                'Selecione uma pasta de dados válida.'
            );
        }

        const existing =
            this.app.vault.getAbstractFileByPath(folder);

        if (!existing) {
            await this.app.vault.createFolder(folder);
        } else if (!(existing instanceof TFolder)) {
            throw new Error(
                `O caminho "${folder}" já existe como arquivo.`
            );
        }

        return folder;
    }

    private generateMarkdown(
        date: string,
        values: Record<string, string>,
        diet: string,
        observations: string
    ): string {
        const measurements: string[] = [];

        for (const group of MEASUREMENT_GROUPS) {
            for (const field of group.fields) {
                const number = parseMeasurement(
                    values[field.key] ?? '',
                    field.label
                );

                if (number !== null) {
                    measurements.push(
                        `${field.key}: ${number}`
                    );
                }
            }
        }

        return [
            '---',
            'tipo: avaliacao_fisica',
            `data: "${date}"`,
            ...measurements,
            '---',
            '',
            '# Avaliação física',
            '',
            '## Rotina alimentar',
            '',
            diet.trim() || 'Não registrada.',
            '',
            '## Observações',
            '',
            observations.trim() || 'Não registradas.',
            ''
        ].join('\n');
    }

    async saveAssessment(
        date: string,
        values: Record<string, string>,
        diet: string,
        observations: string
    ): Promise<string> {
        if (!validDate(date)) {
            throw new Error(
                'Informe uma data válida no formato AAAA-MM-DD.'
            );
        }

        const content = this.generateMarkdown(
            date,
            values,
            diet,
            observations
        );

        const folder = await this.ensureDataFolder();
        const filename = `MobiusFitness${date}.md`;
        const path = `${folder}/${filename}`;

        if (this.app.vault.getAbstractFileByPath(path)) {
            throw new Error(
                'Já existe uma avaliação nessa data.'
            );
        }

        try {
            await this.app.vault.create(path, content);
        } catch (error) {
            console.error(
                'Mobius Fitness: erro ao salvar avaliação.',
                error
            );

            throw new Error(
                'Não foi possível salvar a avaliação. Verifique a pasta de dados e tente novamente.'
            );
        }

        return path;
    }
}
