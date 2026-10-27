import {
    App,
    Modal,
    Notice,
    Plugin,
    PluginSettingTab,
    Setting,
    TFile,
    TFolder
} from 'obsidian';

import { ExerciseImageSelector } from './exercise-image';

interface MobiusFitnessSettings {
    dataFolder: string;
    customEquipment: string[];
}

const DEFAULT_SETTINGS: MobiusFitnessSettings = {
    dataFolder: 'Mobius Fitness',
    customEquipment: []
};

const MUSCLE_GROUPS = [
    'Peito',
    'Costas',
    'Ombros',
    'Bíceps',
    'Tríceps',
    'Quadríceps',
    'Posterior de coxa',
    'Glúteos',
    'Panturrilhas',
    'Abdômen',
    'Lombar',
    'Corpo inteiro',
    'Cardio'
];

const DEFAULT_EQUIPMENT = [
    'Peso corporal',
    'Halteres',
    'Kettlebell',
    'Barra',
    'Máquina',
    'Elástico'
];

const IMAGE_EXTENSIONS = new Set([
    'png',
    'jpg',
    'jpeg',
    'webp',
    'gif'
]);

function yamlString(value: string): string {
    return JSON.stringify(value);
}

function yamlList(values: string[]): string[] {
    return values.map(
        value => `  - ${yamlString(value)}`
    );
}

export default class MobiusFitnessPlugin extends Plugin {
    settings: MobiusFitnessSettings = {
        ...DEFAULT_SETTINGS,
        customEquipment: []
    };

    async onload() {
        await this.loadSettings();

        this.addRibbonIcon(
            'dumbbell',
            'Criar exercício no Mobius Fitness',
            () => new ExerciseModal(this.app, this).open()
        );

        this.addCommand({
            id: 'create-exercise',
            name: 'Criar exercício',
            callback: () => {
                new ExerciseModal(this.app, this).open();
            }
        });

        // Temporariamente abre o cadastro.
        // Futuramente abrirá o dashboard.
        this.addCommand({
            id: 'open-fitness-dashboard',
            name: 'Abrir painel de treinos',
            callback: () => {
                new ExerciseModal(this.app, this).open();
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

        if (!Array.isArray(this.settings.customEquipment)) {
            this.settings.customEquipment = [];
        }
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    getMediaFolder(): string {
        return `${this.settings.dataFolder.trim()}/Midias`;
    }

    getEquipment(): string[] {
        return [...new Set([
            ...DEFAULT_EQUIPMENT,
            ...this.settings.customEquipment
        ])].sort((a, b) => a.localeCompare(b));
    }

    async addEquipment(name: string): Promise<string> {
        const cleanName = name.trim();

        if (!cleanName) {
            throw new Error(
                'Informe o nome do equipamento.'
            );
        }

        const existing = this.getEquipment().find(
            item =>
                item.toLowerCase() === cleanName.toLowerCase()
        );

        if (existing) {
            return existing;
        }

        this.settings.customEquipment.push(cleanName);
        await this.saveSettings();

        return cleanName;
    }

    async ensureDataFolders() {
        const baseFolder = this.settings.dataFolder.trim();

        if (!baseFolder || baseFolder === '/') {
            throw new Error(
                'Selecione uma pasta de dados válida.'
            );
        }

        const folders = [
            baseFolder,
            `${baseFolder}/Exercicios`,
            `${baseFolder}/Fichas`,
            `${baseFolder}/Sessoes`,
            `${baseFolder}/Midias`
        ];

        for (const folder of folders) {
            const existing =
                this.app.vault.getAbstractFileByPath(folder);

            if (!existing) {
                await this.app.vault.createFolder(folder);
            } else if (!(existing instanceof TFolder)) {
                throw new Error(
                    `O caminho "${folder}" já existe como arquivo.`
                );
            }
        }
    }

    async saveExercise(
        name: string,
        primaryMuscle: string,
        secondaryMuscles: string[],
        equipment: string[],
        imagePath: string
    ) {
        const cleanName = name.trim();

        if (!cleanName) {
            throw new Error(
                'Informe o nome do exercício.'
            );
        }

        if (
            /[\\/:*?"<>|#^\[\]]/.test(cleanName) ||
            cleanName === '.' ||
            cleanName === '..'
        ) {
            throw new Error(
                'O nome contém caracteres inválidos.'
            );
        }

        if (!MUSCLE_GROUPS.includes(primaryMuscle)) {
            throw new Error(
                'Selecione um músculo principal válido.'
            );
        }

        if (secondaryMuscles.some(muscle =>
            !MUSCLE_GROUPS.includes(muscle) ||
            muscle === primaryMuscle
        )) {
            throw new Error(
                'Seleção de músculos secundários inválida.'
            );
        }

        if (imagePath) {
            const imageFile =
                this.app.vault.getAbstractFileByPath(
                    imagePath
                );

            if (!(imageFile instanceof TFile)) {
                throw new Error(
                    'A imagem selecionada não foi encontrada.'
                );
            }

            if (
                !IMAGE_EXTENSIONS.has(
                    imageFile.extension.toLowerCase()
                ) ||
                imageFile.parent?.path !== this.getMediaFolder()
            ) {
                throw new Error(
                    'Selecione uma imagem válida da pasta Midias.'
                );
            }
        }

        const baseFolder =
            this.settings.dataFolder.trim();

        if (!baseFolder || baseFolder === '/') {
            throw new Error(
                'Selecione uma pasta de dados válida.'
            );
        }

        const path =
            `${baseFolder}/Exercicios/${cleanName}.md`;

        if (this.app.vault.getAbstractFileByPath(path)) {
            throw new Error(
                'Já existe um exercício com esse nome.'
            );
        }

        await this.ensureDataFolders();

        const content = [
            '---',
            'tipo: "exercicio"',
            `nome: ${yamlString(cleanName)}`,
            `musculo_principal: ${yamlString(primaryMuscle)}`,
            ...(secondaryMuscles.length
                ? [
                    'musculos_secundarios:',
                    ...yamlList(secondaryMuscles)
                ]
                : ['musculos_secundarios: []']),
            ...(equipment.length
                ? [
                    'equipamentos:',
                    ...yamlList(equipment)
                ]
                : ['equipamentos: []']),
            `imagem: ${yamlString(imagePath)}`,
            '---',
            '',
            `# ${cleanName}`,
            '',
            '## Observações',
            ''
        ].join('\n');

        await this.app.vault.create(path, content);
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
                'Selecione onde serão armazenados exercícios, fichas, sessões e mídias.'
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

class ExerciseModal extends Modal {
    plugin: MobiusFitnessPlugin;

    private exerciseName = '';
    private primaryMuscle = 'Peito';
    private secondaryMuscles: string[] = [];
    private selectedEquipment: string[] = [];
    private imagePath = '';

    constructor(
        app: App,
        plugin: MobiusFitnessPlugin
    ) {
        super(app);
        this.plugin = plugin;
    }

    onOpen() {
        this.render();
    }

    render() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h2', {
            text: 'Cadastrar exercício'
        });

        new Setting(contentEl)
            .setName('Nome do exercício')
            .addText(text => text
                .setPlaceholder('Ex.: Supino inclinado')
                .setValue(this.exerciseName)
                .onChange(value => {
                    this.exerciseName = value;
                })
            );

        new Setting(contentEl)
            .setName('Músculo principal')
            .addDropdown(dropdown => {
                for (const muscle of MUSCLE_GROUPS) {
                    dropdown.addOption(muscle, muscle);
                }

                dropdown.setValue(this.primaryMuscle);

                dropdown.onChange(value => {
                    this.primaryMuscle = value;

                    this.secondaryMuscles =
                        this.secondaryMuscles.filter(
                            muscle => muscle !== value
                        );

                    this.render();
                });
            });

        contentEl.createEl('h3', {
            text: 'Músculos secundários'
        });

        contentEl.createEl('p', {
            text: 'Selecione os músculos secundários envolvidos.'
        });

        for (const muscle of MUSCLE_GROUPS) {
            if (muscle === this.primaryMuscle) {
                continue;
            }

            new Setting(contentEl)
                .setName(muscle)
                .addToggle(toggle => toggle
                    .setValue(
                        this.secondaryMuscles.includes(muscle)
                    )
                    .onChange(value => {
                        if (value) {
                            if (!this.secondaryMuscles.includes(muscle)) {
                                this.secondaryMuscles.push(muscle);
                            }
                        } else {
                            this.secondaryMuscles =
                                this.secondaryMuscles.filter(
                                    item => item !== muscle
                                );
                        }
                    })
                );
        }

        contentEl.createEl('h3', {
            text: 'Equipamentos'
        });

        contentEl.createEl('p', {
            text: 'Selecione um ou mais equipamentos utilizados.'
        });

        for (const equipment of this.plugin.getEquipment()) {
            new Setting(contentEl)
                .setName(equipment)
                .addToggle(toggle => toggle
                    .setValue(
                        this.selectedEquipment.includes(equipment)
                    )
                    .onChange(value => {
                        if (value) {
                            if (!this.selectedEquipment.includes(equipment)) {
                                this.selectedEquipment.push(equipment);
                            }
                        } else {
                            this.selectedEquipment =
                                this.selectedEquipment.filter(
                                    item => item !== equipment
                                );
                        }
                    })
                );
        }

        let newEquipment = '';

        new Setting(contentEl)
            .setName('Novo equipamento')
            .setDesc(
                'Adicione um equipamento que não esteja na lista.'
            )
            .addText(text => text
                .setPlaceholder('Ex.: Banco inclinado')
                .onChange(value => {
                    newEquipment = value;
                })
            )
            .addButton(button => button
                .setButtonText('Adicionar')
                .onClick(async () => {
                    button.setDisabled(true);

                    try {
                        const equipment =
                            await this.plugin.addEquipment(
                                newEquipment
                            );

                        if (
                            !this.selectedEquipment.includes(equipment)
                        ) {
                            this.selectedEquipment.push(equipment);
                        }

                        new Notice(
                            `Equipamento "${equipment}" adicionado.`
                        );

                        this.render();
                    } catch (error) {
                        new Notice(
                            error instanceof Error
                                ? error.message
                                : 'Erro ao adicionar equipamento.'
                        );

                        button.setDisabled(false);
                    }
                })
            );

        // Seleção de imagens apenas da pasta Midias.
        const imageContainer = contentEl.createDiv();

        const imageSelector = new ExerciseImageSelector(
            this.app,
            imageContainer,
            this.plugin.getMediaFolder(),
            this.imagePath,
            path => {
                this.imagePath = path;
            }
        );

        imageSelector.render();

        new Setting(contentEl)
            .addButton(button => button
                .setButtonText('Salvar exercício')
                .setCta()
                .onClick(async () => {
                    button.setDisabled(true);

                    try {
                        await this.plugin.saveExercise(
                            this.exerciseName,
                            this.primaryMuscle,
                            this.secondaryMuscles,
                            this.selectedEquipment,
                            this.imagePath
                        );

                        new Notice(
                            'Exercício cadastrado com sucesso!'
                        );

                        this.close();
                    } catch (error) {
                        new Notice(
                            error instanceof Error
                                ? error.message
                                : 'Erro ao salvar exercício.'
                        );

                        button.setDisabled(false);
                    }
                })
            );
    }

    onClose() {
        this.contentEl.empty();
    }
}
