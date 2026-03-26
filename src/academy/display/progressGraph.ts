/**
 * progressGraph.ts — Graphes de progression des formations
 * ──────────────────────────────────────────────────────────
 * Système flexible : un même composant peut être rendu en cercle SVG ou en barre.
 * La valeur est lue depuis le localStorage __iw_courses_progress (écrit par lessonProgress.ts).
 * Le courseIWID est fourni par le plus proche ancêtre portant data-iw-course-iwid.
 *
 * Attributs attendus sur le wrapper :
 *   data-iw-component="progress-graph"
 *   data-iw-graph-type="circle | line"
 *
 * Enfants pour type "circle" (SVG, viewBox="0 0 100 100", r=40, cx=50, cy=50) :
 *   data-iw-component="progress-graph-arc"    ← path/circle SVG de l'arc de progression
 *   data-iw-component="progress-graph-dot"    ← circle SVG (point de tête d'arc)
 *   data-iw-component="progress-graph-label"  ← texte du pourcentage
 *
 * Enfants pour type "line" :
 *   data-iw-component="progress-graph-bar"    ← élément fill (width en %)
 *   data-iw-component="progress-graph-label"  ← texte du pourcentage
 *
 * Structure localStorage attendue (clé __iw_courses_progress) :
 *   {
 *     "[courseIWID]": {
 *       progress: { total: number | null, completed: number, percentage: number }
 *       ...
 *     }
 *   }
 */

import { STORAGE_KEY_COURSES_PROGRESS } from '$global/storageKeys';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type ProgressStats = {
  total: number | null;
  completed: number;
  percentage: number;
};

// ─────────────────────────────────────────────
// LECTURE DU LOCALSTORAGE
// ─────────────────────────────────────────────

function readProgressFromStorage(courseIWID: string): ProgressStats | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COURSES_PROGRESS);
    if (!raw) return null;
    const all = JSON.parse(raw) as Record<string, { progress: ProgressStats }>;
    return all[courseIWID]?.progress ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// RENDUS
// ─────────────────────────────────────────────

function renderCircle(wrap: HTMLElement, stats: ProgressStats): void {
  const { percentage, total } = stats;
  const clamped = Math.min(Math.max(percentage, 0), 100);

  const arc = wrap.querySelector<SVGGeometryElement>('[data-iw-component="progress-graph-arc"]');
  const dot = wrap.querySelector<SVGCircleElement>('[data-iw-component="progress-graph-dot"]');
  const label = wrap.querySelector<HTMLElement>('[data-iw-component="progress-graph-label"]');

  if (arc) {
    // Rayon et centre lus depuis le SVG — aucune valeur codée en dur
    const r = parseFloat(arc.getAttribute('r') ?? '0');
    const cx = parseFloat(arc.getAttribute('cx') ?? '50');
    const cy = parseFloat(arc.getAttribute('cy') ?? '50');
    const circumference = 2 * Math.PI * r;

    arc.style.strokeDasharray = String(circumference);
    arc.style.strokeDashoffset = String(circumference * (1 - clamped / 100));
    arc.style.display = clamped === 0 ? 'none' : '';

    if (dot) {
      if (clamped === 0) {
        dot.setAttribute('cx', String(cx));
        dot.setAttribute('cy', String(cy - r)); // 12h
        dot.style.display = '';
      } else {
        const angle = (-90 + (clamped / 100) * 360) * (Math.PI / 180);
        dot.setAttribute('cx', String(cx + r * Math.cos(angle)));
        dot.setAttribute('cy', String(cy + r * Math.sin(angle)));
        dot.style.display = 'none';
      }
    }
  }

  if (label) {
    label.textContent = formatLabel(percentage, total);
  }
}

function renderLine(wrap: HTMLElement, stats: ProgressStats): void {
  const { percentage, total } = stats;
  const clamped = Math.min(Math.max(percentage, 0), 100);

  const bar = wrap.querySelector<HTMLElement>('[data-iw-component="progress-graph-bar"]');
  const label = wrap.querySelector<HTMLElement>('[data-iw-component="progress-graph-label"]');

  if (bar) {
    bar.style.width = `${clamped}%`;
  }

  if (label) {
    label.textContent = formatLabel(percentage, total);
  }
}

// ─────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────

/**
 * Formate le label de progression.
 * total inconnu → "0"
 * percentage < 100 → "45%"
 * percentage = 100 → "100"
 */
function formatLabel(percentage: number, total: number | null): string {
  if (total === null) return '0';
  return percentage >= 100 ? '100' : `${Math.round(percentage)}%`;
}

// ─────────────────────────────────────────────
// POINT D'ENTRÉE
// ─────────────────────────────────────────────

/**
 * Parcourt tous les [data-iw-component="progress-graph"] du DOM,
 * lit la progression depuis le localStorage et applique le rendu adapté.
 *
 * À appeler dans window.Webflow.push() après que le localStorage
 * a été synchronisé (syncAllCoursesProgressToStorage).
 */
export function renderProgressGraphs(): void {
  const graphs = document.querySelectorAll<HTMLElement>('[data-iw-component="progress-graph"]');

  console.group('[progress-graph] renderProgressGraphs');
  console.log(`${graphs.length} graph(s) trouvé(s)`);

  graphs.forEach((wrap, i) => {
    const courseParent = wrap.closest<HTMLElement>('[data-iw-course-iwid]');
    const courseIWID = courseParent?.dataset.iwCourseIwid ?? wrap.dataset.iwCourseIwid ?? '';
    const graphType = wrap.dataset.iwGraphType ?? 'circle';
    const stats = readProgressFromStorage(courseIWID);

    console.log(`[${i}] courseIWID="${courseIWID}" type="${graphType}" stats=`, stats);

    if (!courseIWID) {
      console.warn(`[${i}] ⚠️ data-iw-course-iwid manquant ou vide`, wrap);
      return;
    }

    const resolved: ProgressStats = stats ?? { total: null, completed: 0, percentage: 0 };

    if (graphType === 'circle') {
      renderCircle(wrap, resolved);
    } else {
      renderLine(wrap, resolved);
    }
  });

  console.groupEnd();
}
