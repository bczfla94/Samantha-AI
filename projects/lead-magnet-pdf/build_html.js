const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const contentPath = path.join(DIR, 'content.json');
const outputPath = path.join(DIR, 'output.html');
const ASSETS = path.join(DIR, '..', 'lead-magnet', 'assets');
const IMAGES = path.join(DIR, 'images');

// ─── Image → base64 ──────────────────────────────────────────────────────────
function imgToBase64(imgPath) {
  if (!fs.existsSync(imgPath)) return null;
  const data = fs.readFileSync(imgPath);
  const ext = path.extname(imgPath).toLowerCase().replace('.', '');
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
    : ext === 'gif' ? 'image/gif'
    : ext === 'webp' ? 'image/webp'
    : 'image/png';
  return `data:${mime};base64,${data.toString('base64')}`;
}

const nlcLogoB64 = imgToBase64(path.join(ASSETS, 'nlc-logo.png'));
const samanthaB64 = imgToBase64(path.join(ASSETS, 'samantha-hero.png'));
const courseThumbB64 = imgToBase64('/Users/brettczarnecki/Desktop/Becoming Magnetic/cover-photo.png');

// ─── Load content ─────────────────────────────────────────────────────────────
let blocks = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

// ─── Pre-process blocks ───────────────────────────────────────────────────────
// Block 0: document title → use on cover, skip
// Blocks 2–6: rough TOC list items → skip (we build our own)
// Block 7: spacer after TOC
// Block 8: "Step 1: Identifying Your Niche" → force to heading1
const SKIP_INDICES = new Set([0, 1, 2, 3, 4, 5, 6, 7]);

if (blocks[8] && blocks[8].text && blocks[8].text.startsWith('Step 1:')) {
  blocks[8].type = 'heading1';
}

// Strip author editing notes from text (e.g. "(Move Chapter 3 to chapter 4)")
function cleanText(text) {
  if (!text) return '';
  return text
    // ── existing author note removals ──────────────────────────────────────
    .replace(/\(Move Chapter \d+ to chapter \d+\)/gi, '')
    .replace(/\s*-\s*What makes someone say ['']YES['']/gi, '')
    .replace(/\(What makes someone say YES\s*[—-]+\s*and how to build it step-by-step\)/gi, '')
    .replace(/\(How to turn conversations into clients\s*[—-]+\s*without sounding pushy or awkward\)/gi, '')
    .replace(/\(The real reason you.re not signing clients consistently\s*[—-]+\s*and it.s not your strategy\)/gi, '')
    .replace(/Not a hard pitch\s*[—-]+\s*a natural transition/gi, 'Not a hard pitch, a natural transition')
    // ── video placeholder notes ────────────────────────────────────────────
    .replace(/\(Gym Selfies\)/gi, '')
    .replace(/\(What I eat in a day\)/gi, '')
    .replace(/\(Random Workouts\)/gi, '')
    .replace(/\(Below I made a video about how a client came to me with thyroid[^)]*\)/gi, '')
    .replace(/\(Made a video here about a common misconception[^)]*\)/gi, '')
    .replace(/\(Made below a why diets fail video\)/gi, '')
    .replace(/\(Below I made a video about a common problem[^)]*\)/gi, '')
    .replace(/\(Below I didn.t just show them side by side[^)]*\)/gi, '')
    .replace(/\(Again same concept below[^)]*\)/gi, '')
    // ── content example notes (Samantha's production instructions) ─────────
    .replace(/Example: Can do a 5-7 video[^.]*\./gi, '')
    .replace(/Example: Show a carousel of you wearing baggy clothes[^.]*\./gi, '')
    // ── author-facing instructions reframed for reader ─────────────────────
    .replace(/Do not focus too much on the features or all the mechanics on how your program works\./gi, 'Focus on the transformation, not the mechanics.')
    .replace(/Here's what that looks like in 3 simple steps… \(Give your version of 80% consistency\)/gi, "Here's what that looks like in practice: aim for 80% effort, consistently.")
    .replace(/Here are some example conversations I have had that lead to booked calls\./gi, 'Here are real conversations that led to booked calls.')
    // ── clarity & grammar fixes ────────────────────────────────────────────
    .replace(/One of the biggest mistakes fitness coaches make who are struggling to hit 10K months in their business is/gi, 'One of the biggest mistakes coaches make when trying to hit $10K months is')
    .replace(/2018 I was diagnosed/gi, 'In 2018, I was diagnosed')
    .replace(/Fast forward 2 years later I was able to lose 40 pounds and maintain it effortlessly\./gi, 'Two years later, I lost 40 pounds and kept it off effortlessly.')
    .replace(/way more likely to have a deeper pain to cause them to purchase/gi, 'carrying a deeper, more urgent pain, the kind that drives people to invest')
    .replace(/OH MY GOSH, SHE GETS ME!!!/gi, "oh my gosh, she gets me.")
    .replace(/Over and over again\. Let.s get out of that cycle!/gi, "Over and over again. It's time to break that cycle.")
    .replace(/don.t feel pressured to do so!/gi, "don't feel pressured to do so.")
    .replace(/When people ask the price\. You can respond by saying, that.s a great question and it really depends on your exact needs and time frame in order to get there\. We can develop a roadmap together over a call to go through all of this\. How does that sound\?/gi, 'When someone asks about price, respond: "That\'s a great question, it depends on your specific goals and timeline. Let\'s map that out on a call together. How does that sound?"')
    // ── 10K consistency ────────────────────────────────────────────────────
    .replace(/hit 10K months/gi, 'hit $10K months')
    // ── psychology micro-additions ─────────────────────────────────────────
    // Step 01: Loss Aversion — cost of staying vague
    .replace(/Your niche has to meet them there\./gi, 'Your niche has to meet them there. Every day you post to a vague audience is a day your ideal client finds someone else.')
    // Step 02: Loss Aversion — cost of an unclear offer
    .replace(/If your offer doesn.t clearly answer those… it won.t sell\./gi, "If your offer doesn't clearly answer those… it won't sell. Every unclear offer is an opportunity handed to the coach with a clearer one.")
    // Step 05: Hyperbolic Discounting — "I'll start Monday" reframe
    .replace(/You tell yourself .I.ll start again Monday./gi, 'You tell yourself "I\'ll start again Monday," but Monday is a fantasy. Today is where results actually begin.')
    // ── remove all dashes from copy ────────────────────────────────────────
    .replace(/\s*—\s*/g, ', ')
    .replace(/(\w)-(\w)/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/The follow up problem \(/i, 'The follow up problem\n(');
}

// ─── Chapter definitions ──────────────────────────────────────────────────────
// contentIndex maps display position → chapterBlocks[] index (doc order)
// Doc order: 0=Niche, 1=Content That Converts, 2=An Offer That Sells, 3=DM, 4=Gap
const chapters = [
  { num: '01', title: 'IDENTIFY YOUR NICHE',           contentIndex: 0, subtitle: 'Know exactly who you help and what problem you solve<br>so your content starts attracting the right people.' },
  { num: '02', title: 'AN OFFER THAT SELLS',           contentIndex: 2, subtitle: 'What makes a client say yes and how to build an offer<br>so compelling it sells itself.' },
  { num: '03', title: 'CONTENT THAT CONVERTS',         contentIndex: 1, subtitle: 'A simple posting framework that builds trust and pulls leads in<br>without spending hours filming or editing.' },
  { num: '04', title: 'THE DM CLIENT\nCONVERSION SCRIPT', contentIndex: 3, subtitle: 'How to turn conversations into booked calls naturally,<br>without feeling salesy or awkward.' },
  { num: '05', title: 'THE COMMITMENT GAP',            contentIndex: 4, subtitle: 'The real reason you\'re not signing clients consistently<br>and it has nothing to do with your strategy.' },
];

const tocItems = [
  { num: '01', label: 'Identify Your Niche' },
  { num: '02', label: 'An Offer That Sells' },
  { num: '03', label: 'Content That Converts' },
  { num: '04', label: 'The DM Client Conversion Script' },
  { num: '05', label: 'The Commitment Gap' },
  { num: 'BONUS', label: 'Invite To Private Community<br>With Direct 1:1 Access To Samantha', isBonus: true },
];

// ─── Split blocks into chapters ───────────────────────────────────────────────
const chapterBoundaries = [8]; // Chapter 1 starts at block 8
blocks.forEach((b, i) => {
  if (b.type === 'heading1' && i !== 8) chapterBoundaries.push(i);
});
chapterBoundaries.push(blocks.length);

const chapterBlocks = [];
for (let c = 0; c < chapterBoundaries.length - 1; c++) {
  const start = chapterBoundaries[c];
  const end = chapterBoundaries[c + 1];
  const section = blocks.slice(start, end).filter((b, i) => {
    // Skip the chapter heading itself (first block), keep rest
    if (i === 0 && b.type === 'heading1') return false;
    // Skip blocks in SKIP_INDICES
    if (SKIP_INDICES.has(start + i)) return false;
    return true;
  });
  chapterBlocks.push(section);
}

// ─── HTML helpers ─────────────────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>');
}

function renderBlock(block, imgCount) {
  const text = cleanText(block.text || '');
  switch (block.type) {
    case 'heading2':
      return `<h2 class="section-heading">${escHtml(text)}</h2>`;
    case 'heading3':
      return `<h3 class="sub-heading">${escHtml(text)}</h3>`;
    case 'heading4':
      return `<h4 class="mini-heading">${escHtml(text)}</h4>`;
    case 'list_item':
      return `<li>${escHtml(text)}</li>`;
    case 'callout':
      return `<div class="callout-box"><p>${escHtml(text)}</p></div>`;
    case 'image': {
      const imgFile = block.file;
      const imgPath = path.join(DIR, imgFile);
      const b64 = imgToBase64(imgPath);
      if (!b64) return `<!-- image not found: ${imgFile} -->`;
      // DM screenshots (img_015+) — enlarged for readability
      const imgNum = parseInt(imgFile.replace('images/img_', '').replace(/\.\w+$/, ''));
      const maxW = imgNum >= 15 ? '90%' : '80%';
      return `<div class="img-wrap"><img src="${b64}" style="max-width:${maxW};" alt=""></div>`;
    }
    case 'spacer':
      return '<div class="spacer"></div>';
    case 'paragraph':
    default:
      if (!text) return '<div class="spacer"></div>';
      return `<p>${escHtml(text)}</p>`;
  }
}

function renderBlockGroup(blocks) {
  let html = '';
  let inList = false;

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const next = blocks[i + 1];

    if (b.type === 'list_item') {
      if (!inList) {
        html += '<ul class="content-list">';
        inList = true;
      }
      html += renderBlock(b);
      if (!next || next.type !== 'list_item') {
        html += '</ul>';
        inList = false;
      }
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += renderBlock(b);
    }
  }
  if (inList) html += '</ul>';
  return html;
}

// ─── Page templates ───────────────────────────────────────────────────────────
function coverPage() {
  const logoHtml = nlcLogoB64
    ? `<img class="cover-logo" src="${nlcLogoB64}" alt="Next Level Coach">`
    : `<div class="cover-logo-text">NLC</div>`;
  const samHtml = samanthaB64
    ? `<img class="cover-photo" src="${samanthaB64}" alt="Samantha">`
    : '';

  return `
<div class="page page-dark cover-page">
  <div class="cover-inner">
    <div class="cover-top">
      ${logoHtml}
      <span class="cover-brand">NEXT LEVEL COACH</span>
    </div>
    <div class="cover-content">
      <p class="cover-eyebrow">STEP BY STEP GUIDE</p>
      <h1 class="cover-title">
        <span class="ct-main">THE 5 STEP</span>
        <span class="ct-sub">CLIENT CONVERSION SYSTEM</span>
      </h1>
      <p class="cover-sub">The exact framework I used to go from $0 to $50K/months<br>as an Online Fitness Coach. The proven system that works<br>even if you have a small following and no ad spend.</p>
      <div class="cover-divider"></div>
      <p class="cover-author">BY <span class="cover-author-name">SAMANTHA CZARNECKI</span></p>
    </div>
    ${samHtml}
    <div class="cover-glow"></div>
  </div>
</div>`;
}

function tocPage() {
  const items = tocItems.map(item => `
    <div class="toc-item">
      <span class="${item.isBonus ? 'toc-num-bonus' : 'toc-num'}">${item.num}</span>
      <span class="toc-label">${item.label}</span>
      <span class="toc-dots"></span>
    </div>`).join('');

  return `
<div class="page page-dark toc-page">
  <div class="toc-inner">
    <p class="toc-eyebrow">WHAT'S INSIDE</p>
    <h2 class="toc-title">Table of Contents</h2>
    <div class="toc-divider"></div>
    <div class="toc-list">${items}</div>
    <p class="toc-tagline">The exact framework to go from posting with no results to signing paying clients consistently</p>
  </div>
</div>`;
}

function chapterIntroPage(chapter) {
  return `
<div class="page page-dark chapter-intro">
  <div class="chapter-intro-inner">
    <div class="chapter-bg-num">${chapter.num}</div>
    <div class="chapter-intro-content">
      <p class="chapter-eyebrow">STEP ${chapter.num}</p>
      <h2 class="chapter-title">${chapter.title.replace(/\n/g, '<br>')}</h2>
      <div class="chapter-divider"></div>
      <p class="chapter-subtitle">${chapter.subtitle}</p>
    </div>
  </div>
</div>`;
}

function contentSection(chapterIdx, contentBlocks) {
  const ch = chapters[chapterIdx];
  let bodyHtml = renderBlockGroup(contentBlocks);
  if (chapterIdx === 0) {
    // Swap Strong: ↔ Stronger: in this chapter (source labels are inverted from desired)
    bodyHtml = bodyHtml.replace(/<h3 class="sub-heading">Stronger:<\/h3>/g, '<h3 class="sub-heading">__TEMP__:</h3>');
    bodyHtml = bodyHtml.replace(/<h3 class="sub-heading">Strong:<\/h3>/g, '<h3 class="sub-heading">Stronger:</h3>');
    bodyHtml = bodyHtml.replace(/<h3 class="sub-heading">__TEMP__:<\/h3>/g, '<h3 class="sub-heading">Strong:</h3>');
  }
  return `
<div class="content-section">
  <div class="content-header">
    <span class="content-step-tag">STEP ${ch.num}</span>
    <span class="content-step-title">${ch.title.replace(/\n/g, ' ')}</span>
  </div>
  <div class="content-body">
    ${bodyHtml}
  </div>
</div>`;
}

function bonusPage() {
  const courseHtml = courseThumbB64
    ? `<img class="bp-course-img" src="${courseThumbB64}" alt="Becoming Magnetic">`
    : '';

  return `
<div class="page page-dark bonus-page">
  <div class="bp-atmosphere">
    <div class="bp-atm-orange"></div>
    <div class="bp-atm-purple"></div>
    <div class="bp-atm-ring"></div>
  </div>
  <div class="bp-inner">

    <div class="bp-top">
      <div class="bp-stamp">
        <span class="bp-stamp-line"></span>
        <span class="bp-stamp-text">EXCLUSIVE BONUS</span>
        <span class="bp-stamp-line"></span>
      </div>
      <h2 class="bp-headline">
        <span class="bp-hl-white">YOU'VE GOT THE SYSTEM.</span>
        <span class="bp-hl-fire">NOW LET'S BUILD IT TOGETHER.</span>
      </h2>
      <p class="bp-tagline">You've got the framework. Coaches who implement it with support sign clients faster than those who go it alone. That support starts here.</p>
    </div>

    <div class="bp-columns">
      <div class="bp-left">
        <div class="bp-community-header">
          <div class="bp-community-rule"></div>
          <span class="bp-community-name">SAMANTHA'S PRIVATE COMMUNITY</span>
        </div>
        <p class="bp-credibility">Samantha built her fitness coaching business to consistent <strong class="bp-strong">$50K+ months</strong> using this exact system. Not just from the system, but from surrounding herself with the right people during the process.<br><br>Inside <strong class="bp-strong">Samantha's Private Community</strong>, she gives you the direct access and guided support to do the same while surrounded by coaches who are on the exact same path.</p>
        <div class="bp-pillars">
          <div class="bp-pillar">
            <span class="bp-pillar-arrow">→</span>
            <div>
              <strong class="bp-pillar-title">Direct 1:1 Access to Samantha</strong>
              <p class="bp-pillar-desc">When you hit a wall implementing this system, you don't have to guess. Bring it directly to Samantha and get the answer that moves you forward.</p>
            </div>
          </div>
          <div class="bp-pillar">
            <span class="bp-pillar-arrow">→</span>
            <div>
              <strong class="bp-pillar-title">Coaches Who Are Growing Right Now</strong>
              <p class="bp-pillar-desc">Real coaches actively using this system sharing what's working, what's not, and how to keep going.</p>
            </div>
          </div>
          <div class="bp-pillar">
            <span class="bp-pillar-arrow">→</span>
            <div>
              <strong class="bp-pillar-title">Accountability That Keeps You Executing</strong>
              <p class="bp-pillar-desc">The gap between coaches who sign clients and coaches who don't isn't knowledge. It's support and encouragement. This community keeps you in motion.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bp-right">
        <div class="bp-also-label">
          <span class="bp-also-line"></span>
          <span class="bp-also-text">ALSO INSIDE</span>
          <span class="bp-also-line"></span>
        </div>
        <div class="bp-course-float">
          <div class="bp-course-glow"></div>
          <div class="bp-course-card">
            ${courseHtml}
            <div class="bp-free-badge">FREE</div>
          </div>
        </div>
        <p class="bp-course-name">BECOMING MAGNETIC</p>
        <p class="bp-course-subtitle">Fitness Business Accelerator</p>
        <p class="bp-course-desc">Video training that picks up where this guide leaves off, built to get fitness coaches to consistent $10K+ months. Step by step.</p>
        <ul class="bp-course-bullets">
          <li>10 detailed chapters</li>
          <li>Client Acquisition, Sales Calls, Retention, and more</li>
          <li>Built for coaches at any stage of growth</li>
        </ul>
        <a class="bp-cta" href="https://nextlevelcoach.ai/coach/becoming-magnetic">
          <span class="bp-cta-text">CLAIM YOUR SPOT IN THE COMMUNITY</span>
        </a>
      </div>
    </div>

  </div>
</div>`;
}

function closingPage() {
  return `
<div class="page page-dark closing-page">
  <div class="closing-inner">
    <div class="closing-content">
      <h2 class="closing-title">Stop Posting And Praying.<br><span class="closing-accent">Start Signing.</span></h2>
      <p class="closing-sub">You now have the complete 5 step system. The only thing left is to put it to work.</p>
    </div>
  </div>
</div>`;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Dancing+Script:wght@600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; }
body {
  font-family: 'Poppins', sans-serif;
  background: #2a2a2a;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Variables ── */
:root {
  --magenta: #DF69FF;
  --violet: #4B0BA3;
  --purple: #7B21BA;
  --dark: #070300;
  --dark2: #0d0a1a;
  --white: #ffffff;
  --off-white: #FAFAFA;
  --text: #1a1a1a;
  --text-muted: #555;
  --gradient: linear-gradient(135deg, #DF69FF 0%, #7B21BA 55%, #4B0BA3 100%);
  --gradient-text: linear-gradient(135deg, #DF69FF 0%, #7B21BA 55%, #4B0BA3 100%);
  --page-w: 816px;
  --page-h: 1056px;
  --pad: 72px;
}

/* ── Locked wrapper — everything stays 816px wide ── */
.pdf-wrapper {
  width: var(--page-w);
  margin: 0 auto;
}

/* ── Page base ── */
.page {
  width: var(--page-w);
  height: var(--page-h);
  position: relative;
  overflow: hidden;
  page-break-before: always;
  page-break-after: always;
}
.page:first-child { page-break-before: auto; }
.page-dark { background: var(--dark); color: var(--white); }

/* ── COVER PAGE ── */
.cover-page {
  background: radial-gradient(ellipse at 70% 40%, rgba(123,33,186,0.35) 0%, transparent 60%),
              radial-gradient(ellipse at 20% 80%, rgba(75,11,163,0.25) 0%, transparent 50%),
              var(--dark);
  display: flex; align-items: stretch;
}
.cover-inner {
  width: 100%; height: 100%; padding: 4px 72px 58px;
  display: flex; flex-direction: column; justify-content: space-between;
  position: relative;
}
.cover-top {
  display: flex; flex-direction: column; align-items: center;
  gap: 0px; width: 100%;
  position: relative; z-index: 1;
}
.cover-logo {
  height: 120px; width: auto; margin-top: -12px;
}
.cover-brand {
  font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 12px;
  letter-spacing: 0.18em; color: rgba(255,255,255,0.92);
  margin-top: -28px;
}
.cover-content { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 38px 0; position: relative; z-index: 1; }
.cover-eyebrow {
  font-size: 10px; font-weight: 700; letter-spacing: 0.25em;
  color: var(--magenta); margin-bottom: 18px;
}
.cover-title {
  font-family: 'Bebas Neue', 'Poppins', sans-serif;
  font-size: 72px; line-height: 1.0; font-weight: 400;
  margin-bottom: 24px;
  text-shadow: 0 0 60px rgba(223,105,255,0.2);
}
.ct-main {
  display: block; font-size: 96px; line-height: 1.0;
  color: var(--white);
}
.ct-sub {
  display: block; font-size: 58px; line-height: 1.1; white-space: nowrap;
  background: var(--gradient-text); -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
.cover-sub {
  font-size: 14px; font-weight: 400; line-height: 1.7;
  color: rgba(255,255,255,0.72); margin-bottom: 36px;
}
.cover-divider {
  width: 60px; height: 3px;
  background: var(--gradient); border-radius: 2px; margin-bottom: 22px;
}
.cover-author { font-size: 11px; letter-spacing: 0.12em; color: rgba(255,255,255,0.45); }
.cover-author-name { color: rgba(255,255,255,0.85); font-weight: 600; }
.cover-photo {
  position: absolute; left: 46%; bottom: 0;
  height: 90%; width: auto; object-fit: contain;
  object-position: bottom left;
  opacity: 0.92;
  z-index: 0;
  mask-image: linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%),
              linear-gradient(to top, transparent 0%, black 8%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 14%, rgba(0,0,0,1) 86%, transparent 100%),
                      linear-gradient(to top, transparent 0%, rgba(0,0,0,1) 8%);
  -webkit-mask-composite: destination-in;
  mask-composite: intersect;
}
.cover-glow {
  position: absolute; bottom: -80px; right: 30%;
  width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(223,105,255,0.12) 0%, transparent 70%);
  pointer-events: none;
}

/* ── TOC PAGE ── */
.toc-page {
  background: radial-gradient(ellipse at 30% 60%, rgba(123,33,186,0.25) 0%, transparent 60%), var(--dark);
}
.toc-inner {
  padding: 77px 82px;
  height: var(--page-h); display: flex; flex-direction: column; justify-content: center;
}
.toc-eyebrow {
  font-size: 10px; font-weight: 700; letter-spacing: 0.25em;
  color: var(--magenta); margin-bottom: 16px;
}
.toc-title {
  font-family: 'Bebas Neue', sans-serif; font-size: 56px; font-weight: 400;
  background: linear-gradient(135deg, #E880FF 0%, #A040D0 55%, #7B21BA 100%); -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  margin-bottom: 24px;
}
.toc-divider { width: 50px; height: 3px; background: var(--gradient); border-radius: 2px; margin-bottom: 40px; }
.toc-list { display: flex; flex-direction: column; gap: 0; margin-bottom: 48px; }
.toc-item {
  display: flex; align-items: center; gap: 18px;
  padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,0.07);
}
.toc-item:first-child { border-top: 1px solid rgba(255,255,255,0.07); }
.toc-num {
  font-family: 'Bebas Neue', sans-serif; font-size: 28px;
  background: var(--gradient-text); -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  width: 90px; flex-shrink: 0;
}
.toc-num-bonus {
  font-family: 'Bebas Neue', sans-serif; font-size: 28px;
  background: linear-gradient(135deg, #F5C842 0%, #F08060 55%, #E05090 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  width: 90px; flex-shrink: 0;
}
.toc-label { font-size: 15px; font-weight: 500; color: rgba(255,255,255,0.88); flex: 1; }
.toc-dots { flex: 1; height: 1px; background: rgba(255,255,255,0.12); margin: 0 16px; max-width: 1.5in; }
.toc-tagline {
  font-family: 'Poppins', sans-serif; font-size: 13px; font-style: italic; font-weight: 300;
  color: rgba(255,255,255,0.4); text-align: center;
  padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.07);
}

/* ── CHAPTER INTRO ── */
.chapter-intro {
  background: radial-gradient(ellipse at 80% 20%, rgba(223,105,255,0.18) 0%, transparent 55%),
              radial-gradient(ellipse at 10% 90%, rgba(75,11,163,0.3) 0%, transparent 50%),
              var(--dark);
  display: flex; align-items: center;
}
.chapter-intro-inner {
  width: 100%; padding: 82px;
  display: flex; flex-direction: column; justify-content: center;
  height: var(--page-h); position: relative;
}
.chapter-bg-num {
  position: absolute; right: -0.2in; top: 50%;
  transform: translateY(-50%);
  font-family: 'Bebas Neue', sans-serif; font-size: 320px;
  color: rgba(255,255,255,0.04); line-height: 1;
  user-select: none; pointer-events: none;
  letter-spacing: -0.02em;
}
.chapter-intro-content { position: relative; z-index: 1; }
.chapter-eyebrow {
  font-size: 11px; font-weight: 700; letter-spacing: 0.3em;
  color: var(--magenta); margin-bottom: 24px;
}
.chapter-title {
  font-family: 'Bebas Neue', sans-serif; font-size: 74px; line-height: 1.0;
  font-weight: 400;
  background: var(--gradient-text); -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  margin-bottom: 30px; max-width: 5.5in;
}
.chapter-divider { width: 60px; height: 3px; background: var(--gradient); border-radius: 2px; margin-bottom: 24px; }
.chapter-subtitle { font-size: 16px; color: rgba(255,255,255,0.65); font-weight: 300; max-width: 620px; line-height: 1.7; }

/* ── CONTENT SECTION ── */
.content-section {
  width: var(--page-w);
  page-break-before: always;
  background: var(--off-white);
  padding: 0;
}
.content-header {
  background: var(--dark);
  padding: 18px var(--pad);
  display: flex; align-items: center; gap: 16px;
  border-bottom: 3px solid transparent;
  border-image: var(--gradient) 1;
}
.content-step-tag {
  font-size: 9px; font-weight: 800; letter-spacing: 0.28em;
  background: var(--gradient); -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
.content-step-title {
  font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
  color: rgba(255,255,255,0.5); text-transform: uppercase;
}
.content-body {
  padding: 48px var(--pad) 72px;
  width: 100%;
}

/* Typography — content pages */
.content-body p {
  font-size: 10.5pt; line-height: 1.8;
  color: var(--text); margin-bottom: 14px;
  orphans: 3; widows: 3;
}
.content-body h2.section-heading {
  font-size: 19pt; font-weight: 700;
  background: var(--gradient-text); -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  margin: 36px 0 14px; line-height: 1.25; text-transform: capitalize;
  page-break-after: avoid;
}
.content-body h3.sub-heading {
  font-size: 13pt; font-weight: 700; color: var(--purple);
  margin: 24px 0 10px; line-height: 1.3; text-transform: capitalize;
  page-break-after: avoid;
}
.content-body h4.mini-heading {
  font-size: 11pt; font-weight: 700; color: var(--text);
  margin: 18px 0 8px; text-transform: uppercase; letter-spacing: 0.05em;
  page-break-after: avoid;
}
.content-body ul.content-list {
  margin: 8px 0 16px 0; padding-left: 0; list-style: none;
}
.content-body ul.content-list li {
  font-size: 10.5pt; line-height: 1.75; color: var(--text);
  padding: 3px 0 3px 22px; position: relative;
}
.content-body ul.content-list li::before {
  content: '';
  position: absolute; left: 0; top: 11px;
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--gradient);
}
.content-body .callout-box {
  background: rgba(123,33,186,0.07);
  border-left: 3px solid var(--magenta);
  border-radius: 0 8px 8px 0;
  padding: 16px 20px; margin: 20px 0;
  page-break-inside: avoid;
}
.content-body .callout-box p {
  margin: 0; font-weight: 500; color: var(--purple);
}
.content-body .img-wrap {
  text-align: center; margin: 24px 0;
  page-break-inside: avoid;
}
.content-body .img-wrap img {
  max-width: 80%; height: auto; border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  display: inline-block;
}
.content-body .spacer { height: 8px; }

/* ── BONUS PAGE ── */
.bonus-page { background: var(--dark); overflow: hidden; }
.bp-atmosphere { position: absolute; inset: 0; pointer-events: none; }
.bp-atm-orange {
  position: absolute; top: -120px; left: -80px;
  width: 520px; height: 520px; border-radius: 50%;
  background: radial-gradient(circle, rgba(245,200,66,0.09) 0%, transparent 65%);
}
.bp-atm-purple {
  position: absolute; bottom: -100px; right: -60px;
  width: 460px; height: 460px; border-radius: 50%;
  background: radial-gradient(circle, rgba(75,11,163,0.3) 0%, transparent 65%);
}
.bp-atm-ring {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 720px; height: 720px; border-radius: 50%;
  border: 1px solid rgba(245,200,66,0.04);
}
.bp-inner {
  position: relative; z-index: 1;
  width: 100%; height: var(--page-h);
  padding: 44px 72px; display: flex; flex-direction: column;
}
.bp-top { margin-bottom: 20px; }
.bp-stamp {
  display: flex; align-items: center; gap: 12px; margin-bottom: 14px;
}
.bp-stamp-line {
  flex: 0 0 32px; height: 1px;
  background: linear-gradient(90deg, #F5C842, #F08060);
}
.bp-stamp-text {
  font-size: 13px; font-weight: 700; letter-spacing: 0.3em;
  background: linear-gradient(135deg, #F5C842 0%, #F08060 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
.bp-headline {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 52px; line-height: 1.0; font-weight: 400; margin-bottom: 14px;
}
.bp-hl-white { display: block; color: var(--white); white-space: nowrap; }
.bp-hl-fire {
  display: block;
  white-space: nowrap;
  background: linear-gradient(90deg, #F5C842 0%, #F08060 50%, #E05090 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
.bp-tagline {
  font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.85); max-width: 500px;
}
/* KEY: columns stretch to fill remaining height */
.bp-columns { display: flex; gap: 44px; flex: 1; align-items: stretch; }
/* KEY: left is a flex column — pillars absorb extra space */
.bp-left { flex: 1; display: flex; flex-direction: column; }
.bp-community-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
}
.bp-community-rule {
  width: 24px; height: 2px; flex-shrink: 0;
  background: linear-gradient(90deg, #F5C842, #F08060);
}
.bp-community-name {
  font-size: 13px; font-weight: 700; letter-spacing: 0.18em; white-space: nowrap;
  background: linear-gradient(135deg, #F5C842 0%, #F08060 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
.bp-credibility {
  font-size: 14px; line-height: 1.75; color: rgba(255,255,255,0.72); margin-bottom: 18px;
}
.bp-strong { color: rgba(255,255,255,0.95); font-weight: 600; }
/* KEY: pillars grow to fill available space, evenly distributed */
.bp-pillars { display: flex; flex-direction: column; flex: 1; justify-content: space-evenly; gap: 0; margin-bottom: 22px; }
.bp-pillar {
  display: flex; gap: 12px; align-items: flex-start;
  padding: 16px 18px;
  background: rgba(245,200,66,0.04);
  border: 1px solid rgba(245,200,66,0.1);
  border-radius: 6px;
}
.bp-pillar-arrow {
  font-size: 13px; font-weight: 800; flex-shrink: 0; margin-top: 1px;
  background: linear-gradient(135deg, #F5C842, #F08060);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
.bp-pillar-title {
  display: block; font-size: 14px; font-weight: 700;
  color: rgba(255,255,255,0.90); margin-bottom: 4px; white-space: nowrap;
}
.bp-pillar-desc { font-size: 12px; line-height: 1.55; color: rgba(255,255,255,0.68); margin: 0; }
.bp-cta {
  display: block; text-align: center; text-decoration: none;
  background: linear-gradient(135deg, #F5C842 0%, #F08060 55%, #E05090 100%);
  border-radius: 5px; padding: 14px 20px; margin-top: 20px;
}
.bp-cta-text {
  display: block; font-size: 11.5px; font-weight: 800;
  letter-spacing: 0.1em; color: #0a0005; text-transform: uppercase; white-space: nowrap;
}
.bp-cta-sub {
  display: block; font-size: 11px; font-weight: 500;
  color: rgba(10,0,5,0.6); margin-top: 3px; letter-spacing: 0.05em;
}
/* KEY: right is a flex column — course float grows to fill space */
.bp-right { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; margin-left: -16px; }
.bp-also-label {
  display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
}
.bp-also-line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, rgba(245,200,66,0.35), rgba(240,128,96,0.15));
}
.bp-also-text {
  font-size: 13px; font-weight: 700; letter-spacing: 0.28em; white-space: nowrap;
  background: linear-gradient(135deg, #F5C842 0%, #F08060 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
.bp-course-float { position: relative; margin-bottom: 22px; display: flex; flex-direction: column; justify-content: flex-start; }
.bp-course-glow {
  position: absolute; inset: -20px; z-index: 0;
  background: radial-gradient(ellipse at center, rgba(245,200,66,0.2) 0%, rgba(240,128,96,0.1) 40%, transparent 70%);
}
.bp-course-card {
  position: relative; z-index: 1;
  transform: perspective(500px) rotateY(-6deg) rotateZ(1deg);
  border-radius: 10px; overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(245,200,66,0.25),
    0 12px 40px rgba(245,200,66,0.15),
    0 24px 70px rgba(240,128,96,0.12);
}
.bp-course-img { width: 100%; height: auto; display: block; transform: scale(1.18); transform-origin: center center; }
.bp-free-badge {
  position: absolute; top: 12px; left: 12px;
  background: linear-gradient(135deg, #F5C842 0%, #F08060 100%);
  color: #0a0005; font-size: 11px; font-weight: 800;
  letter-spacing: 0.2em; padding: 6px 14px; border-radius: 20px;
}
.bp-course-name {
  font-family: 'Bebas Neue', sans-serif; font-size: 32px; line-height: 1.0;
  background: linear-gradient(135deg, #F5C842 0%, #F08060 55%, #E05090 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  margin-bottom: 4px;
}
.bp-course-subtitle {
  font-size: 12px; font-weight: 700; letter-spacing: 0.12em;
  color: rgba(255,255,255,0.85); text-transform: uppercase; margin-bottom: 10px;
}
.bp-course-desc { font-size: 14px; line-height: 1.65; color: rgba(255,255,255,0.68); }
.bp-course-bullets {
  list-style: none; padding: 0; margin: 10px 0 0 0;
}
.bp-course-bullets li {
  font-size: 12px; line-height: 1.6; color: rgba(255,255,255,0.65);
  padding-left: 14px; position: relative; margin-bottom: 3px; white-space: nowrap;
}
.bp-course-bullets li::before {
  content: "✓"; position: absolute; left: 0;
  background: linear-gradient(135deg, #F5C842, #F08060);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  font-weight: 700; font-size: 11px;
}

/* ── CLOSING PAGE ── */
.closing-page {
  background: radial-gradient(ellipse at 30% 50%, rgba(123,33,186,0.3) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 80%, rgba(75,11,163,0.25) 0%, transparent 50%),
              var(--dark);
  display: flex; align-items: stretch;
}
.closing-inner {
  width: 100%; padding: 60px 82px;
  display: flex; align-items: flex-end; gap: 48px;
  height: var(--page-h); position: relative;
}
.closing-photo {
  position: absolute; right: 0; bottom: 0;
  height: 88%; width: auto; object-fit: contain; object-position: bottom;
  opacity: 0.85;
  mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 15%),
              linear-gradient(to top, transparent 0%, rgba(0,0,0,1) 10%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 15%),
                      linear-gradient(to top, transparent 0%, rgba(0,0,0,1) 10%);
  -webkit-mask-composite: destination-in; mask-composite: intersect;
}
.closing-content { max-width: 4.5in; position: relative; z-index: 1; }
.closing-eyebrow {
  font-size: 10px; font-weight: 700; letter-spacing: 0.28em;
  color: var(--magenta); margin-bottom: 20px;
}
.closing-title {
  font-family: 'Bebas Neue', sans-serif; font-size: 74px; line-height: 1.0;
  color: var(--white); margin-bottom: 20px; white-space: nowrap;
}
.closing-accent {
  background: var(--gradient-text); -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
.closing-sub {
  font-size: 14px; color: rgba(255,255,255,0.65); line-height: 1.7; margin-bottom: 32px; white-space: nowrap;
}
.closing-steps { display: flex; flex-direction: column; gap: 10px; margin-bottom: 36px; }
.closing-step {
  font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.85);
  display: flex; align-items: center; gap: 10px;
}
.closing-step::before {
  content: ''; width: 6px; height: 6px; border-radius: 50%;
  background: var(--gradient); flex-shrink: 0;
}
.closing-brand { padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.12); }
.closing-brand-name {
  display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.2em;
  color: rgba(255,255,255,0.5); margin-bottom: 4px;
}
.closing-brand-tag { font-size: 10px; color: rgba(255,255,255,0.3); }

/* ── Print ── */
@media print {
  @page { size: letter; margin: 0; }
  body { margin: 0; }
  .page { page-break-inside: avoid; }
}
`;

// ─── Build full HTML ───────────────────────────────────────────────────────────
let body = '';
body += coverPage();
body += tocPage();

for (let i = 0; i < chapters.length; i++) {
  body += chapterIntroPage(chapters[i]);
  const docIdx = chapters[i].contentIndex;
  if (chapterBlocks[docIdx]) {
    body += contentSection(i, chapterBlocks[docIdx]);
  }
}

body += bonusPage();
body += closingPage();

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=816">
<title>5 Step Client Conversion System</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Dancing+Script:wght@600;700&family=Bebas+Neue&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
<div class="pdf-wrapper">
${body}
</div>
</body>
</html>`;

fs.writeFileSync(outputPath, html, 'utf8');
console.log(`✓ HTML written to: ${outputPath}`);
console.log(`  Open in Chrome to preview before generating PDF.`);
