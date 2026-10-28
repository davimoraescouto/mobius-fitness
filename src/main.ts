
import { Plugin } from 'obsidian';

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

    async onload(): Promise<void> {
        await this.loadSettings();

        this.addRibbonIcon(
            'activity',
            'Nova avaliação física',
            () => this.openAssessmentModal()
        );

        this.addCommand({
            id: 'create-physical-assessment',
            name: 'Nova avaliação física',
            callback: () => {
                this.openAssessmentModal();
            }
        });

        this.addSettingTab(
            new MobiusFitnessSettingTab(this.app, this)
        );
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
