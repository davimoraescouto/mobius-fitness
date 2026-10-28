
export const ptBR = {
    settings: {
        title: 'Configurações',
        dataFolder: 'Pasta de dados',
        dataFolderDescription:
            'Pasta onde serão armazenadas as avaliações físicas.',
        language: 'Idioma',
        languageDescription:
            'Idioma utilizado na interface do Mobius Fitness.',
        automatic: 'Automático (idioma do Obsidian)',
        portuguese: 'Português (Brasil)',
        english: 'English'
    },

    commands: {
        newAssessment: 'Nova avaliação física',
        assessmentHistory: 'Histórico de avaliações físicas',
        compareAssessments: 'Comparar avaliações físicas',
        assessmentTrends: 'Evolução corporal'
    },

    common: {
        save: 'Salvar',
        cancel: 'Cancelar',
        close: 'Fechar',
        date: 'Data',
        observations: 'Observações',
        confirm: 'Confirmar',
        noData: 'Nenhum dado disponível'
    },

    assessments: {
        new: 'Nova avaliação física',
        history: 'Histórico de avaliações físicas',
        comparison: 'Comparar avaliações físicas',
        trends: 'Evolução corporal',
        weight: 'Peso',
        bodyFat: 'Gordura corporal',
        leanMass: 'Massa magra'
    },

    assessmentForm: {
        introduction:
            'Preencha apenas as medidas que você registrou.',
        date: 'Data da avaliação',
        dateDescription:
            'Informe a data no formato AAAA-MM-DD.',
        datePlaceholder: 'AAAA-MM-DD',
        optional: 'Opcional',
        diet: 'Rotina alimentar',
        dietDescription:
            'Descreva seus hábitos alimentares neste período.',
        dietPlaceholder:
            'Ex.: Café da manhã reforçado, uso de hipercalórico...',
        observations: 'Observações',
        observationsPlaceholder:
            'Ex.: Mais disposição, melhora no condicionamento...',
        save: 'Salvar avaliação',
        saveSuccess:
            'Avaliação física salva com sucesso!',
        saveError: 'Erro ao salvar avaliação.'
    },


    assessmentHistory: {
        title: 'Histórico de avaliações físicas',
        countOne: '1 avaliação encontrada.',
        countMany: '{count} avaliações encontradas.',
        noAssessments:
            'Nenhuma avaliação física encontrada na pasta configurada.',
        openError:
            'Não foi possível abrir a avaliação.',
        invalidAssessment:
            'Não foi possível interpretar os dados desta avaliação.',
        noMeasurements:
            'Sem medidas registradas.',
        metadataPending: 'Metadados ainda não disponíveis.',
        yamlMissing: 'Frontmatter YAML ausente ou não reconhecido.',
        yamlNotAtStart: 'Frontmatter YAML fora do início do arquivo.',
        invalidAssessmentType: 'Tipo de avaliação ausente ou inválido.'
    },


    assessmentComparison: {
        title: 'Comparar avaliações físicas',
        minimumAssessments:
            'São necessárias pelo menos duas avaliações válidas para realizar uma comparação.',
        previousAssessment: 'Avaliação anterior',
        currentAssessment: 'Avaliação recente',
        compare: 'Comparar',
        selectValid: 'Selecione duas avaliações válidas.',
        compareError: 'Não foi possível comparar as avaliações.',
        noCommonMeasurements:
            'As avaliações não possuem medidas em comum.',
        previous: 'Anterior',
        current: 'Atual',
        variation: 'Variação',
        notAvailable: 'N/D',
        percentagePoints: 'p.p.',
        invalidSelection:
            'Selecione duas avaliações válidas para comparar.',
        invalidDateOrder:
            'A avaliação anterior deve ter uma data mais antiga.'
    },


    assessmentTrends: {
        title: 'Evolução corporal',
        noMeasurements: 'Nenhuma medida corporal disponível.',
        period: 'Período',
        periodDescription: 'Intervalo de avaliações exibido no gráfico.',
        allHistory: 'Todo o histórico',
        days30: '30 dias',
        days90: '90 dias',
        days180: '180 dias',
        year1: '1 ano',
        measurement: 'Medida',
        measurementDescription: 'Selecione a medida para visualizar a evolução.',
        measurementNotFound: 'Medida não encontrada.',
        noDataInPeriod: 'Nenhuma avaliação com esta medida no período selecionado.',
        onlyOneAssessment: 'Existe apenas uma avaliação com esta medida no período selecionado. São necessárias pelo menos duas para desenhar o gráfico.',
        assessmentCountOne: '1 avaliação com esta medida no período selecionado.',
        assessmentCountMany: '{count} avaliações com esta medida no período selecionado.',
        selectedAssessment: 'Avaliação selecionada',
        date: 'Data',
        chartAriaLabel: 'Gráfico de evolução de {measurement}',
        invalidDate: 'Data inválida: {date}',
        unknownMeasurement: 'Medida desconhecida: {measurement}',
    },
    measurementValidation: {
        invalidInput: 'Informe um valor válido para "{measurement}".',
        invalidValue: 'Valor inválido para "{measurement}".'
    },

    measurements: {
        groups: {
            'body-composition': 'Composição corporal',
            torso: 'Tronco',
            arms: 'Braços',
            legs: 'Pernas'
        },
        fields: {
            peso_kg: 'Peso corporal',
            gordura_corporal_pct: 'Gordura corporal',
            massa_magra_kg: 'Massa corporal magra',
            pescoco_cm: 'Pescoço',
            ombros_cm: 'Ombros',
            peito_cm: 'Peito',
            cintura_cm: 'Cintura',
            abdomen_cm: 'Abdômen',
            quadril_cm: 'Quadril',
            biceps_esquerdo_cm: 'Bíceps esquerdo',
            biceps_direito_cm: 'Bíceps direito',
            antebraco_esquerdo_cm: 'Antebraço esquerdo',
            antebraco_direito_cm: 'Antebraço direito',
            coxa_esquerda_cm: 'Coxa esquerda',
            coxa_direita_cm: 'Coxa direita',
            panturrilha_esquerda_cm: 'Panturrilha esquerda',
            panturrilha_direita_cm: 'Panturrilha direita'
        }
    }

} as const;
