"English" (README.md) | "Português (Brasil)" (README.pt-BR.md)

Mobius Fitness

Um plugin para Obsidian dedicado ao registro de avaliações físicas e ao acompanhamento da evolução corporal, com armazenamento local.

O Mobius Fitness permite registrar avaliações físicas, acompanhar medidas corporais, comparar resultados e visualizar sua evolução ao longo do tempo — diretamente no seu vault do Obsidian.

As avaliações são armazenadas em arquivos Markdown, mantendo seus dados acessíveis, portáteis e sob seu controle.

Funcionalidades

- Avaliações físicas: registre avaliações com datas personalizadas e medidas opcionais.
- Histórico de avaliações: consulte avaliações anteriores e seus respectivos registros.
- Comparação de avaliações: compare duas avaliações para identificar alterações nas medidas corporais.
- Gráficos de evolução: visualize a evolução das medidas ao longo do tempo.
- Filtros por período: analise os últimos 30, 90, 180 ou 365 dias, ou todo o histórico disponível.
- Medidas corporais: acompanhe composição corporal, tronco, braços e pernas.
- Anotações pessoais: registre informações sobre alimentação e observações gerais.
- Armazenamento em Markdown: mantenha os registros dentro do seu vault do Obsidian.
- Interface multilíngue: disponível em português brasileiro e inglês, com detecção automática do idioma e seleção manual.

O Mobius Fitness é focado no acompanhamento de avaliações físicas e complementa aplicativos especializados em treinos, sem a intenção de substituí-los.

Medidas disponíveis

Composição corporal

- Peso corporal (kg)
- Gordura corporal (%)
- Massa corporal magra (kg)

Tronco

- Pescoço
- Ombros
- Peito
- Cintura
- Abdômen
- Quadril

Braços

- Bíceps esquerdo e direito
- Antebraço esquerdo e direito

Pernas

- Coxa esquerda e direita
- Panturrilha esquerda e direita

Todas as medidas são opcionais.

Primeiros passos

1. Instale e habilite o Mobius Fitness no Obsidian.
2. Abra as configurações do plugin e escolha uma pasta para armazenar suas avaliações.
3. Execute o comando de criação de avaliação física ou utilize o ícone do plugin na barra lateral.
4. Selecione a data e informe as medidas que deseja registrar.
5. Adicione anotações e observações, se desejar.
6. Salve a avaliação.

Depois disso, utilize o histórico, a comparação e os gráficos de evolução para acompanhar seus registros.

Armazenamento dos dados

Cada avaliação é salva como um arquivo Markdown na pasta selecionada nas configurações do plugin.

Exemplo:

Avaliações Físicas/
├── MobiusFitness2026-08-10.md
└── MobiusFitness2026-10-28.md

As medidas numéricas são armazenadas nas propriedades YAML (frontmatter), enquanto as anotações pessoais e observações ficam no corpo da nota.

Os arquivos permanecem acessíveis pelo explorador de arquivos e pelo editor Markdown do Obsidian.

Instalação

O Mobius Fitness está sendo preparado para submissão ao diretório oficial de plugins da comunidade Obsidian.

Instalação manual

1. Baixe ou compile os arquivos do plugin.
2. Crie a seguinte pasta dentro do seu vault:

.obsidian/plugins/mobius-fitness/

3. Copie "main.js", "manifest.json" e "styles.css" (caso seja gerado) para essa pasta.
4. Abra o Obsidian e habilite o Mobius Fitness em Configurações → Plugins da comunidade.

Desenvolvimento

Requisitos

- Node.js
- npm
- Obsidian para testes

Instalar dependências

npm ci

Compilar

npm run build

O projeto utiliza TypeScript e a API de plugins do Obsidian.

Idiomas

O Mobius Fitness oferece suporte a:

- Português (Brasil)
- Inglês

Por padrão, o plugin acompanha o idioma configurado no Obsidian. Também é possível selecionar manualmente o idioma nas configurações.

Privacidade

O Mobius Fitness armazena os registros de avaliações localmente no vault do Obsidian.

O plugin não exige cadastro ou serviços externos dedicados para gerenciar as avaliações.

Caso você sincronize seu vault utilizando Obsidian Sync ou outro serviço de sincronização, os arquivos das avaliações também poderão ser armazenados pelo respectivo provedor, conforme sua configuração.

Planejamento

Entre as possíveis melhorias futuras estão:

- Painel com resumo da evolução física recente.
- Metas opcionais para medidas corporais.
- Exportação de dados em CSV.
- Melhorias de usabilidade e acessibilidade em dispositivos móveis.
- Novas opções de visualização e relatórios.

Essas funcionalidades são possibilidades para versões futuras e não estão disponíveis na versão atual.

Aviso importante

O Mobius Fitness é destinado ao registro pessoal de informações e ao acompanhamento da evolução física.

Não oferece diagnósticos médicos nem substitui avaliações ou orientações de profissionais de saúde.

Estado do projeto

Versão 0.1.0 — Em desenvolvimento ativo.

O plugin está sendo preparado para sua primeira versão pública.

Autor

Davi Couto

Licença

0BSD