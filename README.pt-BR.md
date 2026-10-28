[English](README.md) | [Português (Brasil)](README.pt-BR.md)

# Mobius Fitness

Um plugin para Obsidian dedicado ao acompanhamento da evolução física e dos hábitos relacionados à saúde.

O Mobius Fitness permite registrar avaliações corporais periódicas em arquivos Markdown, mantendo seus dados organizados, acessíveis e armazenados localmente no seu vault.

## Objetivo

Acompanhar a evolução física ao longo do tempo sem substituir aplicativos especializados em execução de treinos.

O Mobius Fitness complementa ferramentas como o Hevy, oferecendo um espaço pessoal para registrar medidas corporais, alimentação e observações.

## Funcionalidades atuais

- Cadastro de avaliações físicas por data.
- Registro opcional de peso e composição corporal.
- Registro de medidas de tronco, braços e pernas.
- Campo livre para rotina alimentar.
- Campo livre para observações gerais.
- Organização em arquivos Markdown.
- Armazenamento local, sem necessidade de conta ou internet.
- Compatibilidade com Obsidian para desktop e dispositivos móveis.

## Medidas disponíveis

### Composição corporal

- Peso corporal (kg)
- Gordura corporal (%)
- Massa corporal magra (kg)

### Tronco

- Pescoço
- Ombros
- Peito
- Cintura
- Abdômen
- Quadril

### Braços

- Bíceps esquerdo e direito
- Antebraço esquerdo e direito

### Pernas

- Coxa esquerda e direita
- Panturrilha esquerda e direita

Todas as medidas são opcionais.

## Armazenamento

O usuário escolhe nas configurações a pasta onde deseja salvar suas avaliações.

Cada avaliação é armazenada diretamente nessa pasta, seguindo a nomenclatura:

`MobiusFitnessYYYY-MM-DD.md`

Exemplo:

```text
Avaliações Físicas/
├── MobiusFitness2026-08-10.md
└── MobiusFitness2026-10-28.md
```

Os valores numéricos são registrados nas propriedades YAML, enquanto a rotina alimentar e as observações ficam no corpo da nota.

## Como utilizar

1. Instale e habilite o plugin no Obsidian.
2. Nas configurações do Mobius Fitness, selecione a pasta de dados.
3. Execute o comando "Mobius Fitness: Nova avaliação física" ou utilize o ícone do plugin.
4. Informe a data e as medidas desejadas.
5. Registre sua rotina alimentar e observações, se desejar.
6. Salve a avaliação.

O arquivo Markdown será criado na pasta configurada.

## Desenvolvimento

Requisitos:

- Node.js
- npm
- Obsidian para testar o plugin

Instale as dependências:

```bash
npm ci
```

Compile:

```bash
npm run build
```

Para testar manualmente, copie `main.js`, `manifest.json` e `styles.css` para a pasta do plugin no vault:

```text
.obsidian/plugins/mobius-fitness/
```

Depois, habilite ou recarregue o plugin no Obsidian.

## Planejamento

### Próximas funcionalidades

- Histórico de avaliações físicas.
- Gráficos de evolução das medidas corporais.
- Filtros por período.
- Comparação entre avaliações.

### Funcionalidades futuras

- Importação de registros de treino exportados do Hevy, conforme os formatos disponíveis.
- Integração dos dados de treino com o acompanhamento físico.

## Privacidade

Os dados são armazenados localmente no vault do Obsidian.

O plugin não exige cadastro, conexão com serviços externos ou envio de informações pessoais para servidores próprios.

O Mobius Fitness é uma ferramenta de registro e acompanhamento pessoal. Não substitui avaliação ou orientação de profissionais de saúde.

## Estado do projeto

Em desenvolvimento.

As funcionalidades atuais estão sendo testadas no Obsidian, incluindo dispositivos Android.

## Autor

Davi Couto

## Licença

0BSD
