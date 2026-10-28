
import {
    App,
    Plugin,
    PluginSettingTab,
    Setting,
    TFolder
} from 'obsidian';

export interface MobiusFitnessSettings {
    dataFolder: string;
}

export const DEFAULT_SETTINGS: MobiusFitnessSettings = {
    dataFolder: 'Mobius Fitness'
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
