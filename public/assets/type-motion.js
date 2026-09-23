// Display type is split only where it acts as a visual element. Paragraphs,
// links and controls stay as ordinary text so they remain easy to read.
const displaySelector = '.landing-line, .introduction h2, .practice-heading h2, .page-intro h1, .case-intro h1, .section-heading h2, .burst-heading h2, .finale-copy h2, .footer-main h2, .now-teaser h2';
let entranceObserver;

function splitDisplayText(heading) {
  if (heading.dataset.typeReady) return;
  const label = heading.innerText.replace(/\s+/g, ' ').trim();
  if (!label) return;
  if (heading.matches('.landing-line')) heading.setAttribute('aria-hidden', 'true');
  else heading.setAttribute('aria-label', label);

  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.parentElement?.closest('.sr-only') || !node.textContent.trim()
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  let index = 0;
  for (const node of nodes) {
    const fragment = document.createDocumentFragment();
    const pieces = node.textContent.match(/\s+|[A-Za-z0-9]+(?:[-+./'][A-Za-z0-9]+)*[.,!?;:]?|[^\s]/gu) || [];
    for (const piece of pieces) {
      if (/^\s+$/.test(piece)) { fragment.append(document.createTextNode(piece)); continue; }
      const word = piece.length > 1 ? document.createElement('span') : null;
      if (word) word.className = 'type-word';
      for (const character of Array.from(piece)) {
        const frame = document.createElement('span');
        const face = document.createElement('span');
        frame.className = 'type-glyph';
        frame.setAttribute('aria-hidden', 'true');
        frame.style.setProperty('--glyph-index', String(Math.min(index++, 22)));
        face.className = 'type-glyph-face';
        face.textContent = character;
        frame.append(face);
        (word || fragment).append(frame);
      }
      if (word) fragment.append(word);
    }
    node.replaceWith(fragment);
  }
  heading.dataset.typeReady = 'true';
  heading.classList.add('kinetic-type', 'type-pending');
}

export function setupTypography(root, disabled = false) {
  entranceObserver?.disconnect();
  if (disabled) return;
  const headings = [...root.querySelectorAll(displaySelector)];
  headings.forEach(splitDisplayText);
  const finaleHeading = root.querySelector('.finale-copy h2');
  if (finaleHeading) finaleHeading.classList.remove('type-pending');
  finaleHeading?.classList.add('type-finale');
  entranceObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.remove('type-pending');
      entranceObserver.unobserve(entry.target);
    }
  }, { threshold: .1, rootMargin: '0px 0px -7% 0px' });
  headings.filter(heading => heading !== finaleHeading).forEach(heading => entranceObserver.observe(heading));
}

export function activateGlyph(event, disabled = false) {
  if (disabled || event.button !== 0) return false;
  const glyph = event.target.closest('.type-glyph');
  if (!glyph || glyph.closest('.type-pending')) return false;
  const face = glyph.querySelector('.type-glyph-face');
  face.getAnimations().forEach(animation => animation.cancel());
  face.animate([
    { transform: 'translate3d(0,0,0) rotateY(0deg)' },
    { transform: 'translate3d(0,-.16em,12px) rotateY(105deg)', offset: .34 },
    { transform: 'translate3d(0,-.035em,4px) rotateY(325deg)', offset: .76 },
    { transform: 'translate3d(0,0,0) rotateY(360deg)' }
  ], { duration: 700, easing: 'cubic-bezier(.22,.78,.25,1)' });
  for (const neighbor of [glyph.previousElementSibling, glyph.nextElementSibling]) {
    if (!neighbor?.classList.contains('type-glyph')) continue;
    neighbor.querySelector('.type-glyph-face').animate([
      { transform: 'translateY(0) rotateY(0deg)' },
      { transform: 'translateY(-.045em) rotateY(18deg)', offset: .42 },
      { transform: 'translateY(0) rotateY(0deg)' }
    ], { duration: 470, delay: 65, easing: 'ease-out' });
  }
  return true;
}

export function scrubHeroTypography(lines, progress) {
  if (progress <= .01 && !lines.some(line => line.classList.contains('type-scrolling'))) return;
  for (const [lineIndex, line] of lines.entries()) {
    line.classList.add('type-scrolling');
    const faces = line.querySelectorAll('.type-glyph-face');
    for (const [glyphIndex, face] of faces.entries()) {
      const start = .13 + lineIndex * .12 + glyphIndex * .006;
      const range = .42;
      const raw = Math.min(1, Math.max(0, (progress - start) / range));
      const eased = raw * raw * (3 - 2 * raw);
      face.style.setProperty('--glyph-exit', (eased * 110).toFixed(2) + '%');
    }
  }
}

export function scrubFinaleTypography(heading, progress) {
  if (!heading?.classList.contains('type-finale')) return;
  const lines = heading.querySelectorAll(':scope > span');
  for (const [lineIndex, line] of lines.entries()) {
    for (const [glyphIndex, face] of line.querySelectorAll('.type-glyph-face').entries()) {
      const start = 14 + lineIndex * 10 + glyphIndex * .45;
      const raw = Math.min(1, Math.max(0, (progress - start) / 19));
      const eased = raw * raw * (3 - 2 * raw);
      face.style.setProperty('--glyph-final-out', ((1 - eased) * 108).toFixed(2) + '%');
    }
  }
}

export function exitTypography(root, disabled = false) {
  if (disabled) return [];
  const headings = [...root.querySelectorAll('.kinetic-type:not(.type-pending)')]
    .filter(heading => {
      const box = heading.getBoundingClientRect();
      return box.bottom > 0 && box.top < innerHeight;
    }).slice(0, 2);
  return headings.flatMap(heading => [...heading.querySelectorAll('.type-glyph-face')].map((face, index) =>
    face.animate([
      { transform: 'translate3d(0,0,0)', opacity: 1 },
      { transform: 'translate3d(0,108%,0)', opacity: .25 }
    ], { duration: 255, delay: Math.min(index, 12) * 9, easing: 'cubic-bezier(.5,0,.8,.3)', fill: 'forwards' })
  ));
}
