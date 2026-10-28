
import { Plugin } from 'obsidian';
import { AssessmentComparisonModal } from './assessment-comparison-modal';
import { AssessmentReader } from './assessment-reader';
import { AssessmentHistoryModal } from './assessment-history-modal';
import { AssessmentModal } from './assessment-modal';
import { AssessmentService } from './assessment-service';

import {
    DEFAULT_SETTINGS,
    MobiusFitnessSettingTab
} from './settings';

import type {
    MobiusFitnessSettings
} from './settings';

export default class MobiusFitnessPlugin extends Plugin {
    settings: MobiusFitnessSettings = {
        ...DEFAULT_SETTINGS
    };

    private openAssessmentComparison(): void {
        const reader = new AssessmentReader(
            this.app,
            this.settings.dataFolder
        );

        new AssessmentComparisonModal(
            this.app,
            reader
        ).open();
    }

    async onload(): Promise<void> {
        await this.loadSettings();

        // Ícone lateral para criar uma avaliação física.
        this.addRibbonIcon(
            'activity',
            'Nova avaliação física',
            () => this.openAssessmentModal()
        );

        // Comando para criar uma nova avaliação física.
        this.addCommand({
            id: 'create-physical-assessment',
            name: 'Nova avaliação física',
            callback: () => {
                this.openAssessmentModal();
            }
        });

        // Comando para visualizar o histórico de avaliações.
        this.addCommand({
            id: 'open-physical-assessment-history',
            name: 'Histórico de avaliações físicas',
            callback: () => {
                this.openAssessmentHistory();
            }
        });

        // Configurações do plugin.
        this.addSettingTab(
            new MobiusFitnessSettingTab(this.app, this)
        );

        this.addCommand({
            id: 'compare-physical-assessments',
            name: 'Comparar avaliações físicas',
            callback: () => {
                this.openAssessmentComparison();
            }
        });
    }

    private openAssessmentModal(): void {
        new AssessmentModal(
            this.app,
            (date, values, diet, observations) =>
                this.saveAssessment(
                    date,
                    values,
                    diet,
                    observations
                )
        ).open();
    }

    private openAssessmentHistory(): void {
        const reader = new AssessmentReader(
            this.app,
            this.settings.dataFolder
        );

        new AssessmentHistoryModal(
            this.app,
            reader
        ).open();
    }

    async loadSettings(): Promise<void> {
        const saved = await this.loadData();

        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            saved
        );
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }

    async saveAssessment(
        date: string,
        values: Record<string, string>,
        diet: string,
        observations: string
    ): Promise<string> {
        const service = new AssessmentService(
            this.app,
            this.settings.dataFolder
        );

        return service.saveAssessment(
            date,
            values,
            diet,
            observations
        );
    }
}
