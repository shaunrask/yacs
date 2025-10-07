import React, { useMemo, useState, useEffect } from "react";

// ---------------------- Types ----------------------
type Course = { id: string; title: string; credits: number; };
type PlacedCourse = Course & { key: string };
type TermId = `${"FALL"|"SPRING"|"SUMMER"} ${number}`;

// ---------------------- Sample Data ----------------------
const catalog: Course[] = [
  { id: "CSCI-1100", title: "Computer Science 1", credits: 4 },
  { id: "CSCI-1200", title: "Data Structures", credits: 4 },
  { id: "MATH-1010", title: "Calculus 1", credits: 4 },
  { id: "MATH-1020", title: "Calculus 2", credits: 4 },
  { id: "PHYS-1100", title: "Physics 1", credits: 4 },
  { id: "BIOL-1010", title: "Intro to Biology", credits: 4 },
  { id: "STSH-1110", title: "Science, Tech & Society", credits: 4 },
  { id: "IHSS-1200", title: "First-Year Writing", credits: 4 },
];

const requirementBuckets: { title: string; pickOne?: boolean; items: Course[] }[] = [
  {
    title: "Computer Science major",
    items: [
      { id: "CSCI-2200", title: "Foundations of CS", credits: 4 },
      { id: "CSCI-2500", title: "Computer Organization", credits: 4 },
      { id: "CSCI-2600", title: "Principles of Software", credits: 4 },
    ],
  },
  {
    title: "(PICK ONE) Physics 1",
    pickOne: true,
    items: [
      { id: "PHYS-1100", title: "Physics 1", credits: 4 },
      { id: "PHYS-1010", title: "Physics 1 (Alt)", credits: 4 },
    ],
  },
  {
    title: "Philosophy minor",
    items: [
      { id: "PHIL-2100", title: "Intro to Philosophy", credits: 4 },
      { id: "PHIL-2140", title: "Logic", credits: 4 },
      { id: "PHIL-4220", title: "Ethics", credits: 4 },
    ],
  },
];

// ---------------------- Utils ----------------------
function uid(prefix = "c"): string { return `${prefix}_${Math.random().toString(36).slice(2, 9)}`; }
function courseToPlaced(c: Course): PlacedCourse { return { ...c, key: uid("pc") }; }
function termCredits(list: PlacedCourse[]): number { return list.reduce((s, c) => s + c.credits, 0); }

// simple 4-year skeleton
function defaultTerms(startFallYear = 2023): TermId[] {
  const out: TermId[] = [];
  for (let i = 0; i < 4; i++) {
    const y = startFallYear + i;
    out.push(`FALL ${y}`);
    out.push(`SPRING ${y + 1}`);
    out.push(`SUMMER ${y + 1}`);
  }
  return out;
}

// ---------------------- Components ----------------------
const HeaderBar: React.FC<{ total: number; max?: number; onSave: () => void; onAdd: () => void; }>
= ({ total, max = 128, onSave, onAdd }) => (
  <div className="sticky top-0 z-20 bg-header p-2">
    <div className="h-2 w-full rounded bg-muted overflow-hidden">
      {/* use footer as accent */}
      <div className="h-full bg-footer" style={{ width: `${Math.min((total / max) * 100, 100)}%` }} />
    </div>
    <div className="mt-2 flex items-center justify-between">
      <span className="text-foreground/90 text-sm">{total} / {max} credits</span>
      <div className="flex gap-2">
        <button
          onClick={onAdd}
          className="px-3 py-1 rounded-lg bg-surface text-foreground border border-border hover:brightness-110"
        >
          ADD +
        </button>
        <button
          onClick={onSave}
          className="px-3 py-1 rounded-lg bg-footer text-white hover:brightness-110"
        >
          SAVE
        </button>
      </div>
    </div>
  </div>
);

const TermColumn: React.FC<{
  id: TermId;
  items: PlacedCourse[];
  onDropCourse: (term: TermId, c: Course) => void;
  onRemove: (term: TermId, key: string) => void;
}> = ({ id, items, onDropCourse, onRemove }) => {
  const credits = termCredits(items);
  return (
    <div className="rounded-lg bg-surface border border-border p-3 min-h-[160px]">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-semibold text-foreground">{id.split(" ")[0]} {id.split(" ")[1]}</div>
          <div className="text-xs text-foreground/70">credits: {String(credits).padStart(2, "0")}</div>
        </div>
        {credits >= 20 && <span className="text-[16px]" style={{ color: "var(--footer)" }} title="Heavy load">❗</span>}
      </div>

      {/* Drop area */}
      <div
        className="mt-3 rounded-lg border border-dashed border-border p-2"
        style={{ backgroundColor: "color-mix(in oklab, var(--surface), var(--background) 35%)" }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const payload = e.dataTransfer.getData("text/plain");
          if (!payload) return;
          try {
            const c = JSON.parse(payload) as Course;
            onDropCourse(id, c);
          } catch {}
        }}
      >
        {items.length === 0 && (
          <div className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            Drop some classes here!
          </div>
        )}
        <ul className="space-y-2">
          {items.map((c) => (
            <li key={c.key} className="flex items-center justify-between rounded-md bg-background px-2 py-1 border border-border">
              <div className="text-sm text-foreground truncate" title={`${c.id} : ${c.title}`}>
                <b>{c.id}</b> : {c.title}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground/80">{c.credits}cr</span>
                <button
                  className="text-xs"
                  style={{ color: "var(--foreground)", opacity: 0.7 }}
                  onClick={() => onRemove(id, c.key)}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const CatalogCard: React.FC<{ c: Course }>= ({ c }) => (
  <div
    className="rounded-md border border-border bg-background px-3 py-2 text-foreground cursor-grab select-none"
    draggable
    onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify(c))}
    title={`${c.id} • ${c.title}`}
  >
    <div className="text-sm font-medium truncate">{c.id} : {c.title}</div>
    <div className="text-xs" style={{ color: "var(--foreground)", opacity: 0.7 }}>{c.credits} credits</div>
  </div>
);

const RightSidebar: React.FC<{ }> = () => (
  <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-2 lg:h-[calc(100vh-16px)] overflow-auto space-y-4">
    {requirementBuckets.map((b, i) => (
      <div key={i} className="rounded-lg border border-border bg-surface">
        <div className="px-3 py-2 border-b border-border text-foreground flex items-center justify-between">
          <span>{b.title}</span>
          {b.pickOne && <span className="text-xs" style={{ color: "var(--foreground)", opacity: 0.7 }}>(pick one)</span>}
        </div>
        <div className="p-2 space-y-2">
          {b.items.map((c) => (
            <CatalogCard key={c.id} c={c} />
          ))}
        </div>
      </div>
    ))}
  </aside>
);

// ---------------------- Main Page ----------------------
const STORAGE_KEY = "four_year_plan_v1";
type PlanState = Record<TermId, PlacedCourse[]>;

export default function FourYearPlannerPage() {
  const terms = useMemo(() => defaultTerms(2023), []);
  const [plan, setPlan] = useState<PlanState>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { try { return JSON.parse(raw); } catch {} }
    const empty: PlanState = Object.fromEntries(terms.map((t) => [t, []])) as PlanState;
    empty["FALL 2023"] = [courseToPlaced(catalog[0]), courseToPlaced(catalog[2]), courseToPlaced(catalog[5])];
    empty["SPRING 2024"] = [courseToPlaced(catalog[1]), courseToPlaced(catalog[3])];
    return empty;
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(plan)); }, [plan]);
  const totalCredits = useMemo(() => Object.values(plan).flat().reduce((s, c) => s + c.credits, 0), [plan]);

  function handleDrop(term: TermId, c: Course)   { setPlan((p) => ({ ...p, [term]: [...p[term], courseToPlaced(c)] })); }
  function handleRemove(term: TermId, key: string){ setPlan((p) => ({ ...p, [term]: p[term].filter((x) => x.key !== key) })); }
  function handleSave() { alert("Plan saved locally (localStorage)"); }
  function handleAdd()  {
    const firstEmpty = terms.find((t) => plan[t].length === 0) ?? terms[0];
    handleDrop(firstEmpty as TermId, catalog[0]);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderBar total={totalCredits} onSave={handleSave} onAdd={handleAdd} />

      <div className="mx-auto max-w-7xl px-3 py-4 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Left: terms grid */}
        <main className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {terms.map((t) => (
              <TermColumn key={t} id={t} items={plan[t]} onDropCourse={handleDrop} onRemove={handleRemove} />
            ))}
          </div>

          {/* Notes card */}
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>NOTES</div>
            <ul className="text-sm" style={{ color: "var(--foreground)", opacity: 0.75 }}>
              <li>All computer science majors must declare a concentration sophomore year.</li>
              <li>Meet with your advisor to confirm your four-year plan and requirements.</li>
              <li>YACS is not responsible for scheduling mishaps.</li>
            </ul>
          </div>
        </main>

        {/* Right: requirements / draggable catalog */}
        <RightSidebar />
      </div>

      {/* Bottom catalog scroller */}
      <div className="sticky bottom-0 bg-header border-t border-border">
        <div className="mx-auto max-w-7xl px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm" style={{ color: "var(--foreground)", opacity: 0.9 }}>Catalog (drag to term)</div>
            <input
              placeholder="Search catalog…"
              className="px-2 py-1 rounded-md bg-input text-[color:var(--input-foreground)] border border-border text-sm"
              onChange={(e) => {
                const q = e.target.value.toLowerCase();
                const items = document.querySelectorAll<HTMLElement>("[data-catalog-item]");
                items.forEach((el) => {
                  const text = (el.dataset.text || "").toLowerCase();
                  el.style.display = text.includes(q) ? "" : "none";
                });
              }}
            />
          </div>
          <div className="grid grid-flow-col auto-cols-[260px] gap-2 overflow-x-auto pb-2">
            {catalog.map((c) => (
              <div key={c.id} data-catalog-item data-text={`${c.id} ${c.title}`}>
                <CatalogCard c={c} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
