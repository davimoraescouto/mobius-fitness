
import {
    App,
    Modal,
    Notice,
    Setting
} from 'obsidian';

import { MEASUREMENT_GROUPS } from './measurements';
import {
    t,
    getMeasurementLabel,
    getMeasurementGroupTitle
} from './i18n';

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
            text: t('assessments', 'new')
        });

        contentEl.createEl('p', {
            text: t('assessmentForm', 'introduction')
        });

        new Setting(contentEl)
            .setName(t('assessmentForm', 'date'))
            .setDesc(t('assessmentForm', 'dateDescription'))
            .addText(text => text
                .setPlaceholder(
                    t('assessmentForm', 'datePlaceholder')
                )
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
                text: getMeasurementGroupTitle(group.id)
            });

            for (const field of group.fields) {
                new Setting(section)
                    .setName(
                        `${getMeasurementLabel(field.key)} (${field.unit})`
                    ).addText(text => text
                        .setPlaceholder(
                            t('assessmentForm', 'optional')
                        )
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
            text: t('assessmentForm', 'diet')
        });

        contentEl.createEl('p', {
            text: t('assessmentForm', 'dietDescription')
        });

        new Setting(contentEl)
            .addTextArea(text => {
                text.setPlaceholder(
                    t('assessmentForm', 'dietPlaceholder')
                );

                text.setValue(this.diet);

                text.onChange(value => {
                    this.diet = value;
                });

                text.inputEl.rows = 4;
                text.inputEl.style.width = '100%';
            });

        contentEl.createEl('h3', {
            text: t('assessmentForm', 'observations')
        });

        new Setting(contentEl)
            .addTextArea(text => {
                text.setPlaceholder(
                    t(
                        'assessmentForm',
                        'observationsPlaceholder'
                    )
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
                .setButtonText(
                    t('assessmentForm', 'save')
                )
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
                            t('assessmentForm', 'saveSuccess')
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
                                : t('assessmentForm', 'saveError')
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
