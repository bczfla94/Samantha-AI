# lead-magnet-pdf — Project Instructions

## What This Is
A code-based pipeline that transforms Samantha's Google Doc content into a premium, branded PDF lead magnet: **"The 5 Step Client Conversion System."**

## How It Works (3-Stage Pipeline)

### Stage 1 — Parse the source doc
```
python3 parse_docx.py
```
- Input: `/Users/brettczarnecki/Downloads/5 Step Client Conversion System.docx`
- Extracts all text (word-for-word) and embedded images
- Output: `content.json` + `images/` folder

### Stage 2 — Build the HTML
```
node build_html.js
```
- Reads `content.json`, applies full brand design
- Output: `output.html` — open this in Chrome to preview before generating PDF

### Stage 3 — Generate the PDF
```
node generate_pdf.js
```
- Uses Puppeteer (headless Chrome) to render `output.html` → PDF
- Output: `5-Step-Client-Conversion-System.pdf`

### Run all three at once
```
npm run all
```

---

## Design System

### Page Types
1. **Cover** — dark bg, gradient title, NLC logo, Samantha photo
2. **Table of Contents** — dark bg, gradient step numbers
3. **Chapter Intro** (×5) — dark bg, large ghost number, gradient chapter title
4. **Content Pages** — white/off-white bg, dark text, purple/magenta accents
5. **Closing CTA** — dark bg, Samantha photo, checklist

### Brand Colors
- `--magenta: #DF69FF`
- `--purple: #7B21BA`
- `--violet: #4B0BA3`
- `--dark: #070300`
- Gradient: `linear-gradient(135deg, #DF69FF 0%, #7B21BA 55%, #4B0BA3 100%)`

### Fonts (Google Fonts)
- **Poppins** — body text, headings
- **Bebas Neue** — display numbers, cover title, chapter titles
- **Dancing Script** — script accent text

### Page Size
- US Letter: 816 × 1056px (8.5 × 11in at 96dpi)
- All page types locked to this exact size via `.pdf-wrapper { width: 816px }`

---

## File Map
```
lead-magnet-pdf/
├── CLAUDE.md           ← this file
├── parse_docx.py       ← Stage 1: .docx → content.json + images/
├── build_html.js       ← Stage 2: content.json → output.html
├── generate_pdf.js     ← Stage 3: output.html → PDF (Puppeteer)
├── package.json        ← Node deps (puppeteer)
├── content.json        ← extracted content (auto-generated, do not edit)
├── images/             ← extracted images (auto-generated)
├── output.html         ← HTML preview (auto-generated)
└── 5-Step-Client-Conversion-System.pdf  ← final output
```

## Key Assets (from lead-magnet project)
- Logo: `../lead-magnet/assets/nlc-logo.png`
- Photo: `../lead-magnet/assets/samantha-hero.png`

## Iteration Flow
1. Make CSS/design changes in `build_html.js`
2. Run `node build_html.js` to rebuild HTML
3. Preview in Chrome (`output.html`)
4. If good, run `node generate_pdf.js` for final PDF
5. Do NOT re-run `parse_docx.py` unless the source .docx changes

## Notes
- `node_modules/` is gitignored — run `npm install` after fresh clone
- `content.json` and `images/` are gitignored — re-generate with `parse_docx.py`
- `output.html` and the final PDF are gitignored — generated artifacts
- The source .docx lives in `~/Downloads/` and is not committed
