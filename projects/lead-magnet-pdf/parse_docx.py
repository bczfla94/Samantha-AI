#!/usr/bin/env python3
"""
Parse the .docx file and extract structured content + images to content.json
"""

import json
import os
import sys
from docx import Document
from docx.oxml.ns import qn
from docx.enum.text import WD_ALIGN_PARAGRAPH

DOCX_PATH = "/Users/brettczarnecki/Downloads/5 Step Client Conversion System.docx"
OUTPUT_JSON = os.path.join(os.path.dirname(__file__), "content.json")
IMAGES_DIR = os.path.join(os.path.dirname(__file__), "images")

os.makedirs(IMAGES_DIR, exist_ok=True)

def get_paragraph_style(para):
    style_name = para.style.name.lower() if para.style else ""
    text = para.text.strip()

    if "heading 1" in style_name:
        return "heading1"
    elif "heading 2" in style_name:
        return "heading2"
    elif "heading 3" in style_name:
        return "heading3"
    elif "heading 4" in style_name:
        return "heading4"
    elif "list bullet" in style_name or "list number" in style_name:
        return "list_item"
    elif style_name.startswith("list"):
        return "list_item"
    else:
        return "paragraph"

def has_image(para):
    return para._element.find('.//' + qn('a:blip')) is not None or \
           para._element.find('.//' + qn('v:imagedata')) is not None

def extract_runs_formatting(para):
    """Check if any run is bold or italic for callout detection."""
    bold_count = sum(1 for r in para.runs if r.bold)
    return bold_count > 0

def is_likely_callout(para):
    """Detect if paragraph looks like a callout/tip/action item."""
    text = para.text.strip().lower()
    triggers = ["action step", "key takeaway", "remember:", "tip:", "note:",
                "action item", "exercise:", "your task", "pro tip", "important:",
                "✓", "→", "➜", "⚡", "💡", "🔑"]
    return any(text.startswith(t) for t in triggers)

def main():
    print(f"Parsing: {DOCX_PATH}")
    doc = Document(DOCX_PATH)

    blocks = []
    image_count = 0
    style_names_seen = set()

    # Track all relationships for images
    image_rels = {}
    for rel in doc.part.rels.values():
        if "image" in rel.reltype:
            image_rels[rel.rId] = rel

    for para in doc.paragraphs:
        style_names_seen.add(para.style.name if para.style else "None")
        text = para.text.strip()

        # Check for inline images in this paragraph
        for elem in para._element.iter():
            tag = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
            if tag == 'blip':
                # It's an image
                r_embed = elem.get(qn('r:embed'))
                if r_embed and r_embed in image_rels:
                    rel = image_rels[r_embed]
                    img_data = rel.target_part.blob
                    content_type = rel.target_part.content_type
                    ext = "png"
                    if "jpeg" in content_type or "jpg" in content_type:
                        ext = "jpg"
                    elif "gif" in content_type:
                        ext = "gif"
                    elif "webp" in content_type:
                        ext = "webp"

                    image_count += 1
                    filename = f"img_{image_count:03d}.{ext}"
                    filepath = os.path.join(IMAGES_DIR, filename)
                    with open(filepath, 'wb') as f:
                        f.write(img_data)
                    blocks.append({"type": "image", "file": f"images/{filename}"})
                    print(f"  Saved image: {filename}")

        if not text:
            blocks.append({"type": "spacer"})
            continue

        style_type = get_paragraph_style(para)

        # Detect list items by bullet/numbering XML even if style not set
        if para._element.find('.//' + qn('w:numPr')) is not None:
            style_type = "list_item"

        # Detect callout boxes
        if style_type == "paragraph" and is_likely_callout(para):
            style_type = "callout"

        # Detect alignment
        alignment = None
        if para.alignment == WD_ALIGN_PARAGRAPH.CENTER:
            alignment = "center"

        block = {"type": style_type, "text": text}
        if alignment:
            block["align"] = alignment

        blocks.append(block)

    # Remove consecutive spacers
    cleaned = []
    prev_spacer = False
    for block in blocks:
        if block["type"] == "spacer":
            if not prev_spacer:
                cleaned.append(block)
            prev_spacer = True
        else:
            prev_spacer = False
            cleaned.append(block)

    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(cleaned, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Done! {len(cleaned)} blocks extracted, {image_count} images saved.")
    print(f"✓ Output: {OUTPUT_JSON}")
    print(f"\nStyles found in document:")
    for s in sorted(style_names_seen):
        print(f"  - {s}")

if __name__ == "__main__":
    main()
