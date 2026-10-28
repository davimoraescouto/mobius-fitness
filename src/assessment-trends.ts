
import type { AssessmentData } from './assessment-reader';

import { MEASUREMENT_GROUPS } from './measurements';

export interface TrendPoint {
    date: string;
    value: number;
}

export interface MeasurementTrend {
    key: string;
    label: string;
    unit: string;
    points: TrendPoint[];
}

export function getMeasurementTrend(
    assessments: AssessmentData[],
    measurementKey: string
): MeasurementTrend {
    const field = MEASUREMENT_GROUPS
        .flatMap(group => group.fields)
        .find(field => field.key === measurementKey);

    if (!field) {
        throw new Error(
            `Medida desconhecida: ${measurementKey}`
        );
    }

    const points: TrendPoint[] = assessments
        .filter(assessment => assessment.status === 'valid')
        .flatMap(assessment => {
            const value =
                assessment.measurements[measurementKey];

            if (
                value === undefined ||
                !Number.isFinite(value)
            ) {
                return [];
            }

            return [{
                date: assessment.date,
                value
            }];
        })
        .sort((a, b) =>
            a.date.localeCompare(b.date)
        );

    return {
        key: field.key,
        label: field.label,
        unit: field.unit,
        points
    };
}

export function getAvailableMeasurementTrends(
    assessments: AssessmentData[]
): MeasurementTrend[] {
    return MEASUREMENT_GROUPS
        .flatMap(group => group.fields)
        .map(field =>
            getMeasurementTrend(
                assessments,
                field.key
            )
        )
        .filter(trend => trend.points.length > 0);
}


export type TrendPeriod = 30 | 90 | 180 | 365 | 'all';

export function filterTrendByPeriod(
    trend: MeasurementTrend,
    assessments: AssessmentData[],
    period: TrendPeriod
): MeasurementTrend {
    if (period === 'all') {
        return {
            ...trend,
            points: [...trend.points]
        };
    }

    const validDates = assessments
        .filter(assessment => assessment.status === 'valid')
        .map(assessment => assessment.date)
        .sort();

    const latestDate = validDates[validDates.length - 1];

    if (!latestDate) {
        return {
            ...trend,
            points: []
        };
    }

    const [year, month, day] = latestDate
        .split('-')
        .map(Number);

    if (
        year === undefined ||
        month === undefined ||
        day === undefined
    ) {
        return {
            ...trend,
            points: []
        };
    }

    const latestTimestamp = Date.UTC(
        year,
        month - 1,
        day
    );

    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    const startTimestamp =
        latestTimestamp - period * millisecondsPerDay;

    const filteredPoints = trend.points.filter(point => {
        const [pointYear, pointMonth, pointDay] =
            point.date.split('-').map(Number);

        if (
            pointYear === undefined ||
            pointMonth === undefined ||
            pointDay === undefined
        ) {
            return false;
        }

        const timestamp = Date.UTC(
            pointYear,
            pointMonth - 1,
            pointDay
        );

        return (
            timestamp >= startTimestamp &&
            timestamp <= latestTimestamp
        );
    });

    return {
        ...trend,
        points: filteredPoints
    };
}
