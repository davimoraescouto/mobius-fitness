
import { Modal, Plugin } from 'obsidian';

export default class MobiusFitnessPlugin extends Plugin {
    async onload() {
        // Ícone na barra lateral do Obsidian.
        this.addRibbonIcon(
            'dumbbell',
            'Abrir Mobius Fitness',
            () => {
                new FitnessModal(this.app).open();
            }
        );

        // Comando disponível na paleta do Obsidian.
        this.addCommand({
            id: 'open-fitness-dashboard',
            name: 'Abrir painel de treinos',
            callback: () => {
                new FitnessModal(this.app).open();
            }
        });
    }
}

class FitnessModal extends Modal {
    onOpen() {
        const { contentEl } = this;

        contentEl.empty();
        contentEl.createEl('h2', {
            text: 'Mobius Fitness'
        });

        contentEl.createEl('p', {
            text: 'Seu espaço de treinamento físico no Obsidian.'
        });

        contentEl.createEl('p', {
            text: 'Em breve: exercícios, séries, pesos, PSE e cronômetro.'
        });
    }

    onClose() {
        this.contentEl.empty();
    }
}
