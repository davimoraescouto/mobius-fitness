
import { moment } from 'obsidian';
import { ptBR } from './pt-BR';
import { en } from './en';

export type LanguagePreference = 'auto' | 'pt-BR' | 'en';

type Translations = typeof en;

type SimpleSection =
    | 'settings'
    | 'commands'
    | 'common'
    | 'assessments'
    | 'assessmentForm'
    | 'assessmentHistory'
    | 'assessmentComparison'
    | 'assessmentTrends'
    | 'measurementValidation';

let currentLanguage: LanguagePreference = 'auto';

export function setLanguage(
    language: LanguagePreference
): void {
    currentLanguage = language;
}

export function getLanguage(): 'pt-BR' | 'en' {
    if (currentLanguage !== 'auto') {
        return currentLanguage;
    }

    const locale = moment.locale().toLowerCase();

    return locale.startsWith('pt')
        ? 'pt-BR'
        : 'en';
}

export function t<
    S extends SimpleSection,
    K extends keyof Translations[S] & string
>(
    section: S,
    key: K
): string {
    const translations: Translations =
        getLanguage() === 'pt-BR'
            ? ptBR
            : en;

    const sectionTranslations = translations[section] as Record<
        string,
        string
    >;

    return sectionTranslations[key] ?? key;
}

export function getMeasurementLabel(
    key: string
): string {
    const translations: Record<string, string> =
        getLanguage() === 'pt-BR'
            ? ptBR.measurements.fields
            : en.measurements.fields;

    return translations[key] ?? key;
}

export function getMeasurementGroupTitle(
    id: string
): string {
    const translations: Record<string, string> =
        getLanguage() === 'pt-BR'
            ? ptBR.measurements.groups
            : en.measurements.groups;

    return translations[id] ?? id;
}
