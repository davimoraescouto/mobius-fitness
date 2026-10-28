
import {
    App,
    Modal,
    Notice,
    Plugin,
    PluginSettingTab,
    Setting,
    TFolder
} from 'obsidian';

interface MobiusFitnessSettings {
    dataFolder: string;
}

const DEFAULT_SETTINGS: MobiusFitnessSettings = {
    dataFolder: 'Mobius Fitness'
};

interface MeasurementField {
    key: string;
    label: string;
    unit: string;
}

const MEASUREMENT_GROUPS: {
    title: string;
    fields: MeasurementField[];
}[] = [
    {
        title: 'Composição corporal',
        fields: [
            { key: 'peso_kg', label: 'Peso corporal', unit: 'kg' },
            { key: 'gordura_corporal_pct', label: 'Gordura corporal', unit: '%' },
            { key: 'massa_magra_kg', label: 'Massa corporal magra', unit: 'kg' }
        ]
    },
    {
        title: 'Tronco',
        fields: [
            { key: 'pescoco_cm', label: 'Pescoço', unit: 'cm' },
            { key: 'ombros_cm', label: 'Ombros', unit: 'cm' },
            { key: 'peito_cm', label: 'Peito', unit: 'cm' },
            { key: 'cintura_cm', label: 'Cintura', unit: 'cm' },
            { key: 'abdomen_cm', label: 'Abdômen', unit: 'cm' },
            { key: 'quadril_cm', label: 'Quadril', unit: 'cm' }
        ]
    },
    {
        title: 'Braços',
        fields: [
            { key: 'biceps_esquerdo_cm', label: 'Bíceps esquerdo', unit: 'cm' },
            { key: 'biceps_direito_cm', label: 'Bíceps direito', unit: 'cm' },
            { key: 'antebraco_esquerdo_cm', label: 'Antebraço esquerdo', unit: 'cm' },
            { key: 'antebraco_direito_cm', label: 'Antebraço direito', unit: 'cm' }
        ]
    },
    {
        title: 'Pernas',
        fields: [
            { key: 'coxa_esquerda_cm', label: 'Coxa esquerda', unit: 'cm' },
            { key: 'coxa_direita_cm', label: 'Coxa direita', unit: 'cm' },
            { key: 'panturrilha_esquerda_cm', label: 'Panturrilha esquerda', unit: 'cm' },
            { key: 'panturrilha_direita_cm', label: 'Panturrilha direita', unit: 'cm' }
        ]
    }
];

function localDateString(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


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


function parseMeasurement(
    value: string,
    label: string
): number | null {
    const trimmed = value.trim();

    if (!trimmed) {
        return null;
    }

    const normalized = trimmed.replace(',', '.');

    if (!/^\d+(\.\d+)?$/.test(normalized)) {
        throw new Error(
            `Informe um valor válido para "${label}".`
        );
    }

    const number = Number(normalized);

    if (!Number.isFinite(number)) {
        throw new Error(
            `Valor inválido para "${label}".`
        );
    }

    return number;
}

export default class MobiusFitnessPlugin extends Plugin {
    settings: MobiusFitnessSettings = {
        ...DEFAULT_SETTINGS
    };

    async onload() {
        await this.loadSettings();

        this.addRibbonIcon(
            'activity',
            'Nova avaliação física',
            () => new AssessmentModal(this.app, this).open()
        );

        this.addCommand({
            id: 'create-physical-assessment',
            name: 'Nova avaliação física',
            callback: () => {
                new AssessmentModal(this.app, this).open();
            }
        });

        this.addSettingTab(
            new MobiusFitnessSettingTab(this.app, this)
        );
    }

    async loadSettings() {
        const saved = await this.loadData();

        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            saved
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    
async ensureAssessmentFolder(): Promise<string> {
    const folder = this.settings.dataFolder.trim();

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

        const base = this.settings.dataFolder.trim();

        if (!base || base === '/') {
            throw new Error(
                'Selecione uma pasta de dados válida.'
            );
        }

        const folder = base;
        const filename = `MobiusFitness${date}.md`;
        const path = `${folder}/${filename}`;

        if (this.app.vault.getAbstractFileByPath(path)) {
            throw new Error(
                'Já existe uma avaliação nessa data.'
            );
        }

        const content = [
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

        await this.ensureAssessmentFolder();

        // Segunda verificação antes de criar o arquivo.
        if (this.app.vault.getAbstractFileByPath(path)) {
            throw new Error(
                'Já existe uma avaliação nessa data.'
            );
        }

        await this.app.vault.create(path, content);

        return path;
    }
}

class MobiusFitnessSettingTab extends PluginSettingTab {
    plugin: MobiusFitnessPlugin;

    constructor(
        app: App,
        plugin: MobiusFitnessPlugin
    ) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        const folders = this.app.vault
            .getAllLoadedFiles()
            .filter((file): file is TFolder =>
                file instanceof TFolder &&
                file.path !== '/'
            )
            .sort((a, b) =>
                a.path.localeCompare(b.path)
            );

        new Setting(containerEl)
            .setName('Pasta de dados')
            .setDesc(
                'Pasta onde serão armazenadas as avaliações físicas.'
            )
            .addDropdown(dropdown => {
                const current =
                    this.plugin.settings.dataFolder;

                dropdown.addOption(current, current);

                for (const folder of folders) {
                    if (folder.path !== current) {
                        dropdown.addOption(
                            folder.path,
                            folder.path
                        );
                    }
                }

                dropdown.setValue(current);

                dropdown.onChange(async value => {
                    this.plugin.settings.dataFolder = value;
                    await this.plugin.saveSettings();
                });
            });
    }
}

class AssessmentModal extends Modal {
    plugin: MobiusFitnessPlugin;

    private date = localDateString();
    private values: Record<string, string> = {};
    private diet = '';
    private observations = '';

    constructor(
        app: App,
        plugin: MobiusFitnessPlugin
    ) {
        super(app);
        this.plugin = plugin;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h2', {
            text: 'Nova avaliação física'
        });

        contentEl.createEl('p', {
            text: 'Preencha apenas as medidas que você registrou.'
        });

        new Setting(contentEl)
            .setName('Data da avaliação')
            .setDesc('Formato: AAAA-MM-DD')
            .addText(text => text
                .setPlaceholder('2026-10-28')
                .setValue(this.date)
                .onChange(value => {
                    this.date = value;
                })
            );

        for (const group of MEASUREMENT_GROUPS) {
            const section = contentEl.createEl('details');

            // A primeira seção começa aberta.
            if (group.title === 'Composição corporal') {
                section.open = true;
            }

            section.createEl('summary', {
                text: group.title
            });

            for (const field of group.fields) {
                new Setting(section)
                    .setName(`${field.label} (${field.unit})`)
                    .addText(text => text
                        .setPlaceholder('Opcional')
                        .setValue(
                            this.values[field.key] ?? ''
                        )
                        .onChange(value => {
                            this.values[field.key] = value;
                        })
                    );
            }
        }

        contentEl.createEl('h3', {
            text: 'Rotina alimentar'
        });

        contentEl.createEl('p', {
            text: 'Descreva seus hábitos alimentares neste período.'
        });

        new Setting(contentEl)
            .addTextArea(text => {
                text.setPlaceholder(
                    'Ex.: Café da manhã reforçado, uso de hipercalórico...'
                );

                text.setValue(this.diet);

                text.onChange(value => {
                    this.diet = value;
                });

                text.inputEl.rows = 4;
                text.inputEl.style.width = '100%';
            });

        contentEl.createEl('h3', {
            text: 'Observações'
        });

        new Setting(contentEl)
            .addTextArea(text => {
                text.setPlaceholder(
                    'Ex.: Mais disposição, melhora no condicionamento...'
                );

                text.setValue(this.observations);

                text.onChange(value => {
                    this.observations = value;
                });

                text.inputEl.rows = 3;
                text.inputEl.style.width = '100%';
            });

        new Setting(contentEl)
            .addButton(button => button
                .setButtonText('Salvar avaliação')
                .setCta()
                .onClick(async () => {
                    button.setDisabled(true);

                    try {
                        const path =
                            await this.plugin.saveAssessment(
                                this.date,
                                this.values,
                                this.diet,
                                this.observations
                            );

                        new Notice(
                            'Avaliação física salva com sucesso!'
                        );

                        const file =
                            this.app.vault.getFileByPath(path);

                        if (file) {
                            await this.app.workspace
                                .getLeaf(false)
                                .openFile(file);
                        }

                        this.close();
                    } catch (error) {
                        new Notice(
                            error instanceof Error
                                ? error.message
                                : 'Erro ao salvar avaliação.'
                        );
                    } finally {
                        button.setDisabled(false);
                    }
                })
            );
    }

    onClose() {
        this.contentEl.empty();
    }
}
