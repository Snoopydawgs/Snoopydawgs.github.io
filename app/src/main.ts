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

/* ---------- eyes that follow the cursor ---------- */
const eyes = $$<HTMLElement>('.eye');
if (eyes.length && !window.matchMedia('(hover: none)').matches) {
  window.addEventListener('mousemove', (e: MouseEvent) => {
    eyes.forEach((eye) => {
      const pupil = eye.querySelector<HTMLElement>('.pupil');
      if (!pupil) return;
      const r = eye.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      const reach = r.width * 0.24;
      pupil.style.transform = `translate(${Math.cos(angle) * reach}px, ${Math.sin(angle) * reach}px)`;
    });
  });
}

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
