
import {
    App,
    Plugin,
    PluginSettingTab,
    Setting,
    TFolder
} from 'obsidian';

import {
    setLanguage,
    t
} from './i18n';

import type {
    LanguagePreference
} from './i18n';

export interface MobiusFitnessSettings {
    dataFolder: string;
    language: LanguagePreference;
}

export const DEFAULT_SETTINGS: MobiusFitnessSettings = {
    dataFolder: 'Mobius Fitness',
    language: 'auto'
};

type SettingsPlugin = Plugin & {
    settings: MobiusFitnessSettings;
    saveSettings(): Promise<void>;
};

export class MobiusFitnessSettingTab extends PluginSettingTab {
    private readonly plugin: SettingsPlugin;

    constructor(
        app: App,
        plugin: SettingsPlugin
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
            .setName(t('settings', 'language'))
            .setDesc(t('settings', 'languageDescription'))
            .addDropdown(dropdown => {
                dropdown
                    .addOption(
                        'auto',
                        t('settings', 'automatic')
                    )
                    .addOption(
                        'pt-BR',
                        t('settings', 'portuguese')
                    )
                    .addOption(
                        'en',
                        t('settings', 'english')
                    );

                dropdown.setValue(
                    this.plugin.settings.language
                );

                dropdown.onChange(async value => {
                    const language =
                        value as LanguagePreference;

                    this.plugin.settings.language = language;

                    setLanguage(language);

                    await this.plugin.saveSettings();

                    // Atualiza os rótulos desta tela.
                    this.display();
                });
            });

        new Setting(containerEl)
            .setName(t('settings', 'dataFolder'))
            .setDesc(
                t('settings', 'dataFolderDescription')
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
