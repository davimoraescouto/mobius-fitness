import {
    App,
    DropdownComponent,
    TFile
} from 'obsidian';

const IMAGE_EXTENSIONS = new Set([
    'png',
    'jpg',
    'jpeg',
    'webp',
    'gif'
]);

export class ExerciseImageSelector {
    private app: App;
    private container: HTMLElement;
    private mediaFolder: string;
    private selectedPath: string;
    private onSelectionChange: (path: string) => void;

    constructor(
        app: App,
        container: HTMLElement,
        mediaFolder: string,
        initialPath = '',
        onSelectionChange: (path: string) => void = () => {}
    ) {
        this.app = app;
        this.container = container;
        this.mediaFolder = mediaFolder;
        this.selectedPath = initialPath;
        this.onSelectionChange = onSelectionChange;
    }

    getSelectedPath(): string {
        return this.selectedPath;
    }

    render(): void {
        this.container.empty();

        this.container.createEl('h3', {
            text: 'Imagem ou GIF (opcional)'
        });

        const images = this.app.vault
            .getFiles()
            .filter(file =>
                IMAGE_EXTENSIONS.has(
                    file.extension.toLowerCase()
                ) &&
                file.parent?.path === this.mediaFolder
            )
            .sort((a, b) =>
                a.name.localeCompare(b.name)
            );

        if (images.length === 0) {
            this.container.createEl('p', {
                text: 'Nenhuma imagem encontrada na pasta Midias.'
            });
        }

        const dropdown = new DropdownComponent(
            this.container
        );

        dropdown.addOption('', 'Sem imagem');

        for (const image of images) {
            dropdown.addOption(
                image.path,
                image.name
            );
        }

        if (
            this.selectedPath &&
            !images.some(file => file.path === this.selectedPath)
        ) {
            this.selectedPath = '';
            this.onSelectionChange('');
        }

        dropdown.setValue(this.selectedPath);

        const preview = this.container.createDiv({
            cls: 'mobius-image-preview'
        });

        const updatePreview = (path: string) => {
            preview.empty();

            if (!path) {
                return;
            }

            const file =
                this.app.vault.getAbstractFileByPath(path);

            if (!(file instanceof TFile)) {
                preview.createEl('p', {
                    text: 'Imagem não encontrada.'
                });
                return;
            }

            const img = preview.createEl('img');

            img.src = this.app.vault.getResourcePath(file);
            img.alt = file.basename;

            img.style.maxWidth = '100%';
            img.style.maxHeight = '220px';
            img.style.objectFit = 'contain';
            img.style.marginTop = '12px';
            img.style.borderRadius = '8px';
        };

        dropdown.onChange(value => {
            this.selectedPath = value;
            this.onSelectionChange(value);
            updatePreview(value);
        });

        updatePreview(this.selectedPath);
    }
}
