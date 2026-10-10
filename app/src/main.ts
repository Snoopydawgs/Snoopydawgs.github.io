import './style.css';

/* ============================================================
   Jenver Mike Uddon — portfolio behaviour (TypeScript)
   ============================================================ */

const EMAIL = 'jenvermikeuddon@gmail.com';

type SectionId =
  | 'about'
  | 'projects'
  | 'experience'
  | 'skills'
  | 'blog'
  | 'recommendations'
  | 'contact';

const titles: Record<SectionId, string> = {
  about: 'Jenver Mike Uddon — Web Developer',
  projects: 'Projects — Jenver Mike Uddon',
  experience: 'Experience — Jenver Mike Uddon',
  skills: 'Skills — Jenver Mike Uddon',
  blog: 'Blog — Jenver Mike Uddon',
  recommendations: 'Recommendations — Jenver Mike Uddon',
  contact: 'Contact — Jenver Mike Uddon',
};

const $ = <T extends Element = HTMLElement>(sel: string): T | null =>
  document.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string): T[] =>
  Array.from(document.querySelectorAll<T>(sel));

/* ---------- section switching ---------- */
function show(id: SectionId): void {
  $$<HTMLElement>('.pane').forEach((p) => {
    p.hidden = p.id !== `pane-${id}`;
  });
  $$<HTMLElement>('.nav').forEach((n) => {
    const on = n.dataset.go === id;
    n.classList.toggle('active', on);
    if (on) n.setAttribute('aria-current', 'page');
    else n.removeAttribute('aria-current');
  });
  document.title = titles[id];
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$$<HTMLElement>('[data-go]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const go = el.dataset.go as SectionId | undefined;
    if (go) show(go);
  });
});

/* ---------- keyboard shortcuts ---------- */
const keyMap: Record<string, SectionId> = {
  '1': 'about',
  '2': 'projects',
  '3': 'experience',
  '4': 'skills',
  '5': 'blog',
  '6': 'recommendations',
  '7': 'contact',
};

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    togglePalette(true);
    return;
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
    e.preventDefault();
    void copyEmail();
    return;
  }
  const tag = (e.target as HTMLElement | null)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  const dest = keyMap[e.key];
  if (dest) show(dest);
});

/* ---------- theme (system / light / dark) ---------- */
type ThemeMode = 'system' | 'light' | 'dark';
const root = document.documentElement;
const mq = window.matchMedia('(prefers-color-scheme: dark)');
let mode: ThemeMode = 'system';
try {
  mode = (localStorage.getItem('themeMode') as ThemeMode | null) ?? 'system';
} catch {
  /* storage unavailable */
}

const resolve = (m: ThemeMode): 'light' | 'dark' =>
  m === 'system' ? (mq.matches ? 'dark' : 'light') : m;

function applyMode(m: ThemeMode): void {
  mode = m;
  root.setAttribute('data-theme', resolve(m));
  $$<HTMLElement>('.theme-btn[data-theme-set]').forEach((b) =>
    b.classList.toggle('on', b.dataset.themeSet === m)
  );
  try {
    localStorage.setItem('themeMode', m);
  } catch {
    /* storage unavailable */
  }
}

$$<HTMLElement>('.theme-btn[data-theme-set]').forEach((b) =>
  b.addEventListener('click', () => {
    applyMode((b.dataset.themeSet as ThemeMode) ?? 'system');
    blip();
  })
);
mq.addEventListener('change', () => {
  if (mode === 'system') root.setAttribute('data-theme', resolve('system'));
});
applyMode(mode);

/* ---------- sound (subtle UI tick), muted by default ---------- */
let soundOn = false;
try {
  soundOn = localStorage.getItem('soundOn') === '1';
} catch {
  /* storage unavailable */
}
let audioCtx: AudioContext | null = null;

function reflectSound(): void {
  const mb = $('#muteBtn');
  if (!mb) return;
  mb.querySelector<HTMLElement>('.ic-muted')!.hidden = soundOn;
  mb.querySelector<HTMLElement>('.ic-sound')!.hidden = !soundOn;
  mb.classList.toggle('on', soundOn);
}

function blip(): void {
  if (!soundOn) return;
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioCtx = audioCtx ?? new Ctor();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = 520;
    g.gain.setValueAtTime(0.045, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + 0.09);
  } catch {
    /* audio unavailable */
  }
}

$('#muteBtn')?.addEventListener('click', () => {
  soundOn = !soundOn;
  try {
    localStorage.setItem('soundOn', soundOn ? '1' : '0');
  } catch {
    /* storage unavailable */
  }
  reflectSound();
  blip();
});
reflectSound();
$$<HTMLElement>('.nav, .slink, .link-more').forEach((el) =>
  el.addEventListener('click', blip)
);

/* ---------- copy email ---------- */
async function copyEmail(): Promise<void> {
  try {
    await navigator.clipboard.writeText(EMAIL);
    const btn = $<HTMLButtonElement>('#copyEmail');
    if (btn) {
      const old = btn.textContent ?? 'copy email';
      btn.textContent = 'copied ✓';
      btn.classList.add('done');
      window.setTimeout(() => {
        btn.textContent = old;
        btn.classList.remove('done');
      }, 1500);
    }
    const k = $('#copyEmailK');
    if (k) {
      k.classList.add('done');
      window.setTimeout(() => k.classList.remove('done'), 1200);
    }
    blip();
  } catch {
    window.location.href = `mailto:${EMAIL}`;
  }
}
$('#copyEmail')?.addEventListener('click', () => void copyEmail());
$('#copyEmailK')?.addEventListener('click', () => void copyEmail());

/* ---------- contact form (opens a pre-filled email; no backend) ---------- */
const form = $<HTMLFormElement>('#contactForm');
if (form) {
  const note = $('#cformNote');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $<HTMLInputElement>('#cfName')?.value.trim() ?? '';
    const email = $<HTMLInputElement>('#cfEmail')?.value.trim() ?? '';
    const msg = $<HTMLTextAreaElement>('#cfMsg')?.value.trim() ?? '';
    if (!name || !email || !msg) {
      if (note) note.textContent = 'Please fill in all fields.';
      return;
    }
    const subject = encodeURIComponent(`Project inquiry from ${name}`);
    const body = encodeURIComponent(`${msg}\n\n— ${name} (${email})`);
    if (note) note.textContent = 'Opening your email app…';
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    blip();
  });
}

/* ---------- clickable project cards -> GitHub ---------- */
const repos: Record<string, string> = {
  'Health Management System': 'https://github.com/Snoopydawgs',
  'Norte Cafe — Online Ordering System': 'https://github.com/Snoopydawgs/NorteCafe',
  'School Internship Management System': 'https://github.com/Snoopydawgs',
  'Rise and Shine': 'https://github.com/Snoopydawgs',
  'Personal Portfolio': 'https://github.com/Snoopydawgs/Snoopydawgs.github.io',
};
$$<HTMLElement>('.proj').forEach((card) => {
  const name = card.dataset.proj;
  const url = name ? repos[name.trim()] : undefined;
  if (!url) return;
  card.setAttribute('role', 'link');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${name!.trim()} — view on GitHub`);
  const open = (): void => {
    window.open(url, '_blank', 'noopener');
  };
  card.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('a')) open();
  });
  card.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') open();
  });
});

/* ---------- nav hover tooltip (desktop only) ---------- */
if (!window.matchMedia('(hover: none)').matches) {
  const tip = $('#tooltip');
  const tT = tip?.querySelector<HTMLElement>('.tip-title');
  const tB = tip?.querySelector<HTMLElement>('.tip-body');
  if (tip && tT && tB) {
    $$<HTMLElement>('.nav[data-tip]').forEach((n) => {
      n.addEventListener('mouseenter', () => {
        tT.textContent = n.dataset.tipTitle ?? '';
        tB.textContent = n.dataset.tip ?? '';
        const r = n.getBoundingClientRect();
        tip.style.top = `${r.top + r.height / 2}px`;
        tip.style.left = `${r.right + 14}px`;
        tip.classList.add('show');
      });
      n.addEventListener('mouseleave', () => tip.classList.remove('show'));
    });
  }
}

/* ---------- interactive dithered portrait ----------
   The portrait is drawn as a live halftone on a canvas; dots near the
   pointer bloom and drift, so the dither reacts as the cursor moves. */
(function initDither(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('.portrait-canvas');
  if (!canvas) return;
  if (window.matchMedia('(hover: none)').matches) {
    canvas.remove(); // mobile/touch: keep the static image fallback
    return;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let gray: Uint8ClampedArray | null = null;
  let GW = 0;
  let GH = 0;
  const mouse = { x: -9999, y: -9999, active: false };
  let raf = 0;

  const img = new Image();
  img.src = '/portrait-gray.png';
  img.onload = () => {
    const pw = 220;
    const ph = Math.round(pw * (img.height / img.width));
    const off = document.createElement('canvas');
    off.width = pw;
    off.height = ph;
    const og = off.getContext('2d');
    if (!og) return;
    og.drawImage(img, 0, 0, pw, ph);
    gray = og.getImageData(0, 0, pw, ph).data;
    GW = pw;
    GH = ph;
    sizeCanvas();
    draw();
  };

  function sizeCanvas(): void {
    const r = canvas!.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas!.width = Math.max(1, Math.round(r.width * dpr));
    canvas!.height = Math.max(1, Math.round(r.height * dpr));
  }

  function sample(fx: number, fy: number): number {
    if (!gray) return 255;
    const gx = Math.min(GW - 1, Math.max(0, Math.round(fx * (GW - 1))));
    const gy = Math.min(GH - 1, Math.max(0, Math.round(fy * (GH - 1))));
    return gray[(gy * GW + gx) * 4];
  }

  function draw(): void {
    if (!gray || !ctx) return;
    const W = canvas!.width;
    const H = canvas!.height;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#141414';

    const cols = 118;
    const cell = W / cols;
    const rows = Math.round(H / cell);
    const R = W * 0.3; // pointer influence radius
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        let px = (i + 0.5) * cell;
        let py = (j + 0.5) * cell;
        const b = sample(i / cols, j / rows);
        let rad = ((255 - b) / 255) * cell * 0.72;
        if (mouse.active) {
          const dx = px - mouse.x;
          const dy = py - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < R) {
            const f = 1 - dist / R;
            const infl = f * f;
            rad *= 1 + infl * 1.1; // bloom near the pointer
            const push = infl * cell * 1.4; // gentle liquid drift
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);
            px += nx * push;
            py += ny * push;
          }
        }
        if (rad > 0.35) {
          ctx.beginPath();
          ctx.arc(px, py, rad, 0, 6.2832);
          ctx.fill();
        }
      }
    }
  }

  function schedule(): void {
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); });
  }

  window.addEventListener('mousemove', (e: MouseEvent) => {
    const r = canvas!.getBoundingClientRect();
    const dpr = canvas!.width / r.width;
    mouse.x = (e.clientX - r.left) * dpr;
    mouse.y = (e.clientY - r.top) * dpr;
    mouse.active = true;
    schedule();
  });
  window.addEventListener('mouseout', (e: MouseEvent) => {
    if (!e.relatedTarget) { mouse.active = false; schedule(); }
  });
  window.addEventListener('resize', () => { sizeCanvas(); draw(); });
})();

/* ---------- command palette ---------- */
interface PaletteItem {
  label: string;
  hint: string;
  act: () => void;
}

const palette = $('#palette');
const paletteInput = $<HTMLInputElement>('#paletteInput');
const paletteList = $('#paletteList');

const items: PaletteItem[] = [
  { label: 'About', hint: 'section', act: () => show('about') },
  { label: 'Projects', hint: 'section', act: () => show('projects') },
  { label: 'Experience', hint: 'section', act: () => show('experience') },
  { label: 'Skills', hint: 'section', act: () => show('skills') },
  { label: 'Blog', hint: 'section', act: () => show('blog') },
  { label: 'Recommendations', hint: 'section', act: () => show('recommendations') },
  { label: 'Contact', hint: 'section', act: () => show('contact') },
  { label: 'Copy email', hint: 'action', act: () => void copyEmail() },
  { label: 'Download résumé', hint: 'file', act: () => { window.location.href = 'resume.pdf'; } },
  { label: 'Open GitHub', hint: 'link', act: () => window.open('https://github.com/Snoopydawgs', '_blank', 'noopener') },
  { label: 'Open LinkedIn', hint: 'link', act: () => window.open('https://www.linkedin.com/in/jenver-uddon-b26123420', '_blank', 'noopener') },
  { label: 'Open Facebook', hint: 'link', act: () => window.open('https://www.facebook.com/khassellll', '_blank', 'noopener') },
];

let active = 0;
let filtered: PaletteItem[] = items.slice();

function render(): void {
  if (!paletteList) return;
  paletteList.innerHTML = '';
  filtered.forEach((it, i) => {
    const li = document.createElement('li');
    li.className = `pal-item${i === active ? ' active' : ''}`;
    li.setAttribute('role', 'option');
    li.innerHTML = `<span>${it.label}</span><span class="pal-hint">${it.hint}</span>`;
    li.addEventListener('mouseenter', () => {
      active = i;
      paint();
    });
    li.addEventListener('click', () => choose(i));
    paletteList.appendChild(li);
  });
}
function paint(): void {
  if (!paletteList) return;
  Array.from(paletteList.children).forEach((li, i) =>
    (li as HTMLElement).classList.toggle('active', i === active)
  );
}
function filter(): void {
  const q = (paletteInput?.value ?? '').trim().toLowerCase();
  filtered = items.filter((it) => it.label.toLowerCase().includes(q));
  active = 0;
  render();
}
function choose(i: number): void {
  const it = filtered[i];
  if (!it) return;
  togglePalette(false);
  blip();
  it.act();
}
function togglePalette(open: boolean): void {
  if (!palette) return;
  if (open) {
    palette.hidden = false;
    if (paletteInput) paletteInput.value = '';
    filter();
    requestAnimationFrame(() => paletteInput?.focus());
  } else {
    palette.hidden = true;
  }
}

$('#openPalette')?.addEventListener('click', () => togglePalette(true));
paletteInput?.addEventListener('input', filter);
paletteInput?.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    active = Math.min(active + 1, filtered.length - 1);
    paint();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    active = Math.max(active - 1, 0);
    paint();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    choose(active);
  } else if (e.key === 'Escape') {
    togglePalette(false);
  }
});
palette?.addEventListener('click', (e) => {
  if (e.target === palette) togglePalette(false);
});
