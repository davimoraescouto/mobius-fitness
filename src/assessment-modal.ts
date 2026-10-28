
import {
    App,
    Modal,
    Notice,
    Setting
} from 'obsidian';

import { MEASUREMENT_GROUPS } from './measurements';

export type SaveAssessmentCallback = (
    date: string,
    values: Record<string, string>,
    diet: string,
    observations: string
) => Promise<string>;

function localDateString(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export class AssessmentModal extends Modal {
    private date = localDateString();
    private values: Record<string, string> = {};
    private diet = '';
    private observations = '';

    constructor(
        app: App,
        private readonly saveAssessment: SaveAssessmentCallback
    ) {
        super(app);
    }

    onOpen(): void {
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
            .setDesc('Informe a data no formato AAAA-MM-DD.')
            .addText(text => text
                .setPlaceholder('AAAA-MM-DD')
                .setValue(this.date)
                .onChange(value => {
                    this.date = value;
                })
            );

        for (const group of MEASUREMENT_GROUPS) {
            const section = contentEl.createEl('details');

            if (group.id === 'body-composition') {
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
                        const path = await this.saveAssessment(
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

    onClose(): void {
        this.contentEl.empty();
    }
}
