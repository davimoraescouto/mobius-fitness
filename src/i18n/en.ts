
import type { ptBR } from './pt-BR';

type DeepStringTranslations<T> = {
    [K in keyof T]: T[K] extends string
    ? string
    : DeepStringTranslations<T[K]>;
};

type TranslationStructure = DeepStringTranslations<typeof ptBR>;

export const en: TranslationStructure = {
    settings: {
        title: 'Settings',
        dataFolder: 'Data folder',
        dataFolderDescription:
            'Folder where physical assessments are stored.',
        language: 'Language',
        languageDescription:
            'Language used in the Mobius Fitness interface.',
        automatic: 'Automatic (Obsidian language)',
        portuguese: 'Português (Brasil)',
        english: 'English'
    },

    commands: {
        newAssessment: 'New physical assessment',
        assessmentHistory: 'Physical assessment history',
        compareAssessments: 'Compare physical assessments',
        assessmentTrends: 'Body measurements trends'
    },

    common: {
        save: 'Save',
        cancel: 'Cancel',
        close: 'Close',
        date: 'Date',
        observations: 'Notes',
        confirm: 'Confirm',
        noData: 'No data available'
    },

    assessments: {
        new: 'New physical assessment',
        history: 'Physical assessment history',
        comparison: 'Compare physical assessments',
        trends: 'Body measurements trends',
        weight: 'Weight',
        bodyFat: 'Body fat',
        leanMass: 'Lean mass'
    },

    assessmentForm: {
        introduction:
            'Fill in only the measurements you recorded.',
        date: 'Assessment date',
        dateDescription:
            'Enter the date in YYYY-MM-DD format.',
        datePlaceholder: 'YYYY-MM-DD',
        optional: 'Optional',
        diet: 'Dietary habits',
        dietDescription:
            'Describe your eating habits during this period.',
        dietPlaceholder:
            'E.g., A larger breakfast, use of a weight-gain supplement...',
        observations: 'Notes',
        observationsPlaceholder:
            'E.g., More energy, improved fitness...',
        save: 'Save assessment',
        saveSuccess:
            'Physical assessment saved successfully!',
        saveError: 'Error saving assessment.'
    },


    assessmentHistory: {
        title: 'Physical assessment history',
        countOne: '1 assessment found.',
        countMany: '{count} assessments found.',
        noAssessments:
            'No physical assessments found in the configured folder.',
        openError:
            'Could not open the assessment.',
        invalidAssessment:
            'Could not interpret the data in this assessment.',
        noMeasurements:
            'No measurements recorded.',
        metadataPending: 'Metadata is not available yet.',
        yamlMissing: 'YAML frontmatter is missing or not recognized.',
        yamlNotAtStart: 'YAML frontmatter must be at the beginning of the file.',
        invalidAssessmentType: 'Assessment type is missing or invalid.'
    },


    assessmentComparison: {
        title: 'Compare physical assessments',
        minimumAssessments:
            'At least two valid assessments are required for comparison.',
        previousAssessment: 'Previous assessment',
        currentAssessment: 'Recent assessment',
        compare: 'Compare',
        selectValid: 'Select two valid assessments.',
        compareError: 'Could not compare the assessments.',
        noCommonMeasurements:
            'The assessments have no measurements in common.',
        previous: 'Previous',
        current: 'Current',
        variation: 'Change',
        notAvailable: 'N/A',
        percentagePoints: 'pp',
        invalidSelection:
            'Select two valid assessments to compare.',
        invalidDateOrder:
            'The previous assessment must have an earlier date.'
    },


    assessmentTrends: {
        title: 'Body measurements trends',
        noMeasurements: 'No body measurements available.',
        period: 'Period',
        periodDescription: 'Assessment date range displayed in the chart.',
        allHistory: 'All history',
        days30: '30 days',
        days90: '90 days',
        days180: '180 days',
        year1: '1 year',
        measurement: 'Measurement',
        measurementDescription: 'Select a measurement to view its trend.',
        measurementNotFound: 'Measurement not found.',
        noDataInPeriod: 'No assessments with this measurement in the selected period.',
        onlyOneAssessment: 'Only one assessment contains this measurement in the selected period. At least two are required to draw the chart.',
        assessmentCountOne: '1 assessment with this measurement in the selected period.',
        assessmentCountMany: '{count} assessments with this measurement in the selected period.',
        selectedAssessment: 'Selected assessment',
        date: 'Date',
        chartAriaLabel: 'Trend chart for {measurement}',
        invalidDate: 'Invalid date: {date}',
        unknownMeasurement: 'Unknown measurement: {measurement}'
    },

    measurementValidation: {
        invalidInput: 'Enter a valid value for "{measurement}".',
        invalidValue: 'Invalid value for "{measurement}".'
    },
    measurements: {
        groups: {
            'body-composition': 'Body composition',
            torso: 'Torso',
            arms: 'Arms',
            legs: 'Legs'
        },
        fields: {
            peso_kg: 'Body weight',
            gordura_corporal_pct: 'Body fat',
            massa_magra_kg: 'Lean body mass',
            pescoco_cm: 'Neck',
            ombros_cm: 'Shoulders',
            peito_cm: 'Chest',
            cintura_cm: 'Waist',
            abdomen_cm: 'Abdomen',
            quadril_cm: 'Hips',
            biceps_esquerdo_cm: 'Left biceps',
            biceps_direito_cm: 'Right biceps',
            antebraco_esquerdo_cm: 'Left forearm',
            antebraco_direito_cm: 'Right forearm',
            coxa_esquerda_cm: 'Left thigh',
            coxa_direita_cm: 'Right thigh',
            panturrilha_esquerda_cm: 'Left calf',
            panturrilha_direita_cm: 'Right calf'
        }
    }

};
