
import type { AssessmentData } from './assessment-reader';

import { MEASUREMENT_GROUPS } from './measurements';

export interface MeasurementComparison {
    key: string;
    label: string;
    unit: string;
    previous: number;
    current: number;
    difference: number;
    percentageChange: number | null;
}

export interface AssessmentComparison {
    previousDate: string;
    currentDate: string;
    measurements: MeasurementComparison[];
}

export function compareAssessments(
    previous: AssessmentData,
    current: AssessmentData
): AssessmentComparison {
    if (
        previous.status !== 'valid' ||
        current.status !== 'valid'
    ) {
        throw new Error(
            'Selecione duas avaliações válidas para comparar.'
        );
    }

    if (previous.date >= current.date) {
        throw new Error(
            'A avaliação anterior deve ter uma data mais antiga.'
        );
    }

    const measurements: MeasurementComparison[] = [];

    for (const group of MEASUREMENT_GROUPS) {
        for (const field of group.fields) {
            const previousValue =
                previous.measurements[field.key];

            const currentValue =
                current.measurements[field.key];

            if (
                previousValue === undefined ||
                currentValue === undefined
            ) {
                continue;
            }

            const difference =
                currentValue - previousValue;

            const percentageChange =
                previousValue === 0
                    ? null
                    : (difference / previousValue) * 100;

            measurements.push({
                key: field.key,
                label: field.label,
                unit: field.unit,
                previous: previousValue,
                current: currentValue,
                difference,
                percentageChange
            });
        }
    }

    return {
        previousDate: previous.date,
        currentDate: current.date,
        measurements
    };
}
