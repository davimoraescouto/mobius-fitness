Mobius Fitness

An offline-first physical assessment and body measurement tracker for Obsidian.

Mobius Fitness helps you record physical assessments, track body measurements, compare results, and visualize your progress over time — directly inside your Obsidian vault.

Your assessment records are stored as Markdown files, keeping your data accessible, portable, and under your control.

Features

- Physical assessments: Record assessments with custom dates and optional measurements.
- Assessment history: Browse previous assessments and review recorded measurements.
- Assessment comparison: Compare two assessments to identify changes in body measurements.
- Progress charts: Visualize measurement trends over time.
- Date filters: Explore trends using 30, 90, 180, or 365-day periods, or view all available records.
- Flexible measurements: Track body composition, torso, arms, and legs.
- Personal notes: Record nutrition-related notes and general observations.
- Local Markdown storage: Keep assessment records inside your Obsidian vault.
- Multilingual interface: Available in English and Brazilian Portuguese, with automatic language detection and manual selection.

Mobius Fitness focuses on physical assessments and complements dedicated workout-tracking applications rather than replacing them.

Supported Measurements

Body Composition

- Body weight (kg)
- Body fat percentage (%)
- Lean body mass (kg)

Torso

- Neck
- Shoulders
- Chest
- Waist
- Abdomen
- Hips

Arms

- Left and right biceps
- Left and right forearms

Legs

- Left and right thighs
- Left and right calves

All measurements are optional.

Getting Started

1. Install and enable Mobius Fitness in Obsidian.
2. Open the plugin settings and choose a folder for your assessment records.
3. Run the command to create a new physical assessment or use the plugin's ribbon icon.
4. Select an assessment date and enter the measurements you want to record.
5. Add optional notes and observations.
6. Save your assessment.

You can then use the history, comparison, and progress features to review your data over time.

Data Storage

Each assessment is saved as a Markdown file in the folder selected in the plugin settings.

Example:

Physical Assessments/
├── MobiusFitness2026-08-10.md
└── MobiusFitness2026-10-28.md

Numeric measurements are stored as YAML frontmatter properties, while personal notes and observations are stored in the Markdown body.

Assessment files remain accessible through Obsidian's native file browser and Markdown editor.

Installation

Mobius Fitness is currently being prepared for submission to the Obsidian Community Plugins directory.

Manual Installation

1. Download or build the plugin files.
2. Create the following folder inside your Obsidian vault:

.obsidian/plugins/mobius-fitness/

3. Copy "main.js", "manifest.json", and "styles.css" (if generated) into that folder.
4. Open Obsidian and enable Mobius Fitness under Settings → Community plugins.

Development

Requirements

- Node.js
- npm
- Obsidian for testing

Install Dependencies

npm ci

Build

npm run build

The project uses TypeScript and the Obsidian Plugin API.

Language Support

Mobius Fitness currently supports:

- English
- Português (Brasil)

By default, the plugin follows the language configured in Obsidian. You can also select your preferred language manually in the plugin settings.

Privacy

Mobius Fitness stores assessment records locally in your Obsidian vault.

The plugin does not require an account or a dedicated external service to manage your assessments.

If you synchronize your vault using Obsidian Sync or another synchronization provider, your assessment files may also be stored by that provider according to its configuration.

Roadmap

Potential future improvements include:

- A dashboard summarizing recent physical progress.
- Optional measurement goals.
- CSV export.
- Improved mobile usability and accessibility.
- Additional visualization and reporting options.

These features are ideas for future development and are not included in the current release.

Disclaimer

Mobius Fitness is intended for personal record-keeping and progress tracking.

It does not provide medical diagnoses or replace professional medical assessment or healthcare advice.

Project Status

Version 0.1.0 — Under active development.

The plugin is being prepared for its first public release.

Author

Davi Couto

License

0BSD