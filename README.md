# Music theory practice companion

A frontend-only Vite + React app for drilling music theory: scale degrees, interval names,
the chromatic scale, the circle of fifths and mode formulas.

Available in English and Spanish: the app opens on a language selection screen, and the
EN / ES switch at the top of every screen changes language at any moment without losing progress.

## Running

```bash
npm install
npm run dev
```

`npm run build` produces a static site in `dist/`.

## Exercises

The exercises are split into two sections, chosen from the list on the left of the exercise menu.

### Section 1

| Block | Exercise |
| --- | --- |
| 0 | How our notes were chosen: a six-part guided tour (octaves, Pythagoras' fifths, the spiral of fifths, the Pythagorean comma, equal temperament), with sound |
| 1 | Major tone degrees and mode names (Way 1: semitones given · Way 2: degrees given) |
| 1 | Semitones to chromatic intervals (Way 1: name the interval · Way 2: count the semitones) |
| 2 | The Chromatic Scale (ascending with sharps, descending with flats) |
| 3 | Becoming familiar with the order of the circle of fifths (Way 1: intervals · Way 2: note names, C at the top) |
| 3 | The mode formulas through the circle of fifths |
| 3 | Individual mode formula practice (each round goes through all seven modes in random order) |

### Section 2 — the modes of the natural keys (C, D, E, F, G, A, B major)

| Block | Exercise |
| --- | --- |
| 1 | Modes of the natural keys: given a note of the key, name its mode (Way 1: whole key · Way 2: one note at a time · Way 3: random key) |
| 1 | Roots of the modes of the natural keys: given a mode, name its root (same three ways) |
| 2 | How to know what the notes of a natural key are: preparation questions, then a guided walkthrough with an animated answer |
| 3 | Notes of the modes of the natural keys (Way 1: chart · Way 2: one mode · Way 3: random key · Way 4: one note) |
| 4 | The sounds of the modes: identify each mode by ear, once each per round |

Ways can be switched freely at any point. Exercises that practise one key start by asking which key to use.

Tiles can be dragged (mouse or touch) or placed by clicking a tile and then a box. Any single
tile can be removed with its × button, dragged back to the bank, or dragged onto another box to swap.
