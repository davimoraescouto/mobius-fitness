[English](README.md) | [Português (Brasil)](README.pt-BR.md)

# Mobius Fitness

An offline-first Obsidian plugin for tracking physical progress, body measurements, and health-related habits.

Mobius Fitness allows you to record periodic physical assessments in Markdown files, keeping your data organized, accessible, and stored locally in your Obsidian vault.

## Purpose

Mobius Fitness is designed to help you monitor your physical progress over time without replacing dedicated workout-tracking applications.

It complements tools such as Hevy by providing a personal space to record body measurements, nutrition habits, and observations about your physical well-being.

## Current Features

- Create physical assessments with custom dates.
- Optionally record body weight and body composition.
- Track torso, arm, and leg measurements.
- Add free-text notes about nutrition habits.
- Record general observations.
- Store assessments as Markdown files.
- Keep your data locally without requiring an account or internet connection.
- Use the plugin on both desktop and mobile versions of Obsidian.

## Available Measurements

### Body Composition

- Body weight (kg)
- Body fat percentage (%)
- Lean body mass (kg)

### Torso

- Neck
- Shoulders
- Chest
- Waist
- Abdomen
- Hips

### Arms

- Left and right biceps
- Left and right forearms

### Legs

- Left and right thighs
- Left and right calves

All measurements are optional.

## Data Storage

Users can select the folder where physical assessments will be saved through the plugin settings.

Each assessment is stored directly in the selected folder using the following naming convention:

`MobiusFitnessYYYY-MM-DD.md`

Example:

```text
Physical Assessments/
├── MobiusFitness2026-08-10.md
└── MobiusFitness2026-10-28.md
```

Numeric measurements are stored as YAML frontmatter properties, while nutrition habits and general observations are saved in the Markdown note body.

This structure keeps assessment data readable and accessible through Obsidian's native features.

## How to Use

1. Install and enable the plugin in Obsidian.
2. Open the Mobius Fitness settings and select a data folder.
3. Run the **"Mobius Fitness: Nova avaliação física"** command or use the plugin's ribbon icon.
4. Enter the assessment date and any measurements you want to record.
5. Optionally add notes about your nutrition habits and general observations.
6. Save the assessment.

A Markdown file will be created in the configured folder.

## Development

### Requirements

- Node.js
- npm
- Obsidian for plugin testing

### Install Dependencies

```bash
npm ci
```

### Build

```bash
npm run build
```

### Manual Installation for Testing

Copy the generated `main.js`, `manifest.json`, and `styles.css` (if present) into the plugin directory inside your Obsidian vault:

```text
.obsidian/plugins/mobius-fitness/
```

Then enable or reload the plugin in Obsidian.

## Roadmap

### Planned Features

- Physical assessment history.
- Body measurement progress charts.
- Date-range filters.
- Comparison between assessments.

### Future Possibilities

- Import workout records exported from Hevy, depending on supported export formats.
- Combine workout data with physical progress tracking.

## Privacy

All assessment data is stored locally in your Obsidian vault.

Mobius Fitness does not require an account, external service connections, or the transmission of personal information to dedicated servers.

Mobius Fitness is intended for personal tracking and record-keeping purposes. It is not a substitute for professional medical assessment or healthcare advice.

## Project Status

**Under active development.**

Current features are being tested in Obsidian, including on Android devices.

## Author

Davi Couto

## License

0BSD