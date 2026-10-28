
export interface MeasurementField {
    key: string;
    label: string;
    unit: string;
}

export interface MeasurementGroup {
    id: string;
    title: string;
    fields: MeasurementField[];
}

export const MEASUREMENT_GROUPS: MeasurementGroup[] = [
    {
        id: 'body-composition',
        title: 'Composição corporal',
        fields: [
            { key: 'peso_kg', label: 'Peso corporal', unit: 'kg' },
            { key: 'gordura_corporal_pct', label: 'Gordura corporal', unit: '%' },
            { key: 'massa_magra_kg', label: 'Massa corporal magra', unit: 'kg' }
        ]
    },
    {
        id: 'torso',
        title: 'Tronco',
        fields: [
            { key: 'pescoco_cm', label: 'Pescoço', unit: 'cm' },
            { key: 'ombros_cm', label: 'Ombros', unit: 'cm' },
            { key: 'peito_cm', label: 'Peito', unit: 'cm' },
            { key: 'cintura_cm', label: 'Cintura', unit: 'cm' },
            { key: 'abdomen_cm', label: 'Abdômen', unit: 'cm' },
            { key: 'quadril_cm', label: 'Quadril', unit: 'cm' }
        ]
    },
    {
        id: 'arms',
        title: 'Braços',
        fields: [
            { key: 'biceps_esquerdo_cm', label: 'Bíceps esquerdo', unit: 'cm' },
            { key: 'biceps_direito_cm', label: 'Bíceps direito', unit: 'cm' },
            { key: 'antebraco_esquerdo_cm', label: 'Antebraço esquerdo', unit: 'cm' },
            { key: 'antebraco_direito_cm', label: 'Antebraço direito', unit: 'cm' }
        ]
    },
    {
        id: 'legs',
        title: 'Pernas',
        fields: [
            { key: 'coxa_esquerda_cm', label: 'Coxa esquerda', unit: 'cm' },
            { key: 'coxa_direita_cm', label: 'Coxa direita', unit: 'cm' },
            { key: 'panturrilha_esquerda_cm', label: 'Panturrilha esquerda', unit: 'cm' },
            { key: 'panturrilha_direita_cm', label: 'Panturrilha direita', unit: 'cm' }
        ]
    }
];

export function parseMeasurement(
    value: string,
    label: string
): number | null {
    const trimmed = value.trim();

    if (!trimmed) {
        return null;
    }

    const normalized = trimmed.replace(',', '.');

    if (!/^\d+(\.\d+)?$/.test(normalized)) {
        throw new Error(
            `Informe um valor válido para "${label}".`
        );
    }

    const number = Number(normalized);

    if (!Number.isFinite(number)) {
        throw new Error(
            `Valor inválido para "${label}".`
        );
    }

    return number;
}
