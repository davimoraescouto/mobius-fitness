
import { Plugin } from 'obsidian';

import { AssessmentTrendsModal } from './assessment-trends-modal';
import { AssessmentComparisonModal } from './assessment-comparison-modal';
import { AssessmentReader } from './assessment-reader';
import { AssessmentHistoryModal } from './assessment-history-modal';
import { AssessmentModal } from './assessment-modal';
import { AssessmentService } from './assessment-service';

import {
    setLanguage,
    t
} from './i18n';

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

    private openAssessmentTrends(): void {
        const reader = new AssessmentReader(
            this.app,
            this.settings.dataFolder
        );

        new AssessmentTrendsModal(
            this.app,
            reader
        ).open();
    }

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

        // Aplica o idioma salvo nas configurações.
        setLanguage(this.settings.language);

        // Ícone lateral para criar uma avaliação física.
        this.addRibbonIcon(
            'activity',
            t('commands', 'newAssessment'),
            () => this.openAssessmentModal()
        );

        this.addCommand({
            id: 'create-physical-assessment',
            name: t('commands', 'newAssessment'),
            callback: () => {
                this.openAssessmentModal();
            }
        });

        this.addCommand({
            id: 'open-physical-assessment-history',
            name: t('commands', 'assessmentHistory'),
            callback: () => {
                this.openAssessmentHistory();
            }
        });

        this.addSettingTab(
            new MobiusFitnessSettingTab(this.app, this)
        );

        this.addCommand({
            id: 'compare-physical-assessments',
            name: t('commands', 'compareAssessments'),
            callback: () => {
                this.openAssessmentComparison();
            }
        });

        this.addCommand({
            id: 'open-physical-assessment-trends',
            name: t('commands', 'assessmentTrends'),
            callback: () => {
                this.openAssessmentTrends();
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
