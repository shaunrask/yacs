import React, { useMemo, useRef, useEffect } from "react";
import { useSchedule } from "../context/schedule-context";
import { Course } from "../types/schedule";

export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Mon, 6=Sun

export type WeekSchedulerProps = {
  events?: Array<{
    key: string;
    id: string;
    title: string;
    location?: string;
    day: DayIndex;
    start: string;
    end: string;
    colorClass?: string;
  }>;
  startHour?: number;
  endHour?: number;
  slotMinutes?: number;
  showWeekend?: boolean;
  onEventClick?: (ev: any) => void;
};

type Interval = {
  key: string;
  id: string;
  day: DayIndex;
  startMin: number;
  endMin: number;
};

export const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const PALETTE = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
  "bg-lime-500",
  "bg-orange-500",
  "bg-sky-500",
] as const;

function useCourseColors(courseIds: string[]) {
  const mapRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const setIds = new Set(courseIds);
    for (const key of Array.from(mapRef.current.keys())) {
      if (!setIds.has(key)) mapRef.current.delete(key);
    }
    if (courseIds.length === 0) mapRef.current.clear();
  }, [courseIds]);

  const getColor = (id: string) => {
    const m = mapRef.current;
    const existing = m.get(id);
    if (existing) return existing;
    const next = PALETTE[m.size % PALETTE.length];
    m.set(id, next);
    return next;
  };

  return getColor;
}

export function parseTimeToMinutes(t: string): number {
  if (!t) return 0;
  const s = t.trim().toUpperCase();
  const ampm = s.match(/^(\d{1,2}):(\d{2})(AM|PM)$/);
  if (ampm) {
    let hh = parseInt(ampm[1], 10);
    const mm = parseInt(ampm[2], 10);
    const mer = ampm[3];
    if (mer === "AM") {
      if (hh === 12) hh = 0;
    } else {
      if (hh !== 12) hh += 12;
    }
    return hh * 60 + mm;
  }
  const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const hh = parseInt(m24[1], 10);
    const mm = parseInt(m24[2], 10);
    return hh * 60 + mm;
  }
  const [h, m] = s.split(":").map((x) => parseInt(x, 10));
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function formatTime12h(totalMinutes: number): string {
  const h24 = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const am = h24 < 12;
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  if (m === 0) return `${h12}${am ? "AM" : "PM"}`;
  return `${h12}:${String(m).padStart(2, "0")}${am ? "AM" : "PM"}`;
}

export function formatClock12h(hhmm: string): string {
  return formatTime12h(parseTimeToMinutes(hhmm));
}

export function computeEventPosition(start: string, end: string, startHour: number, endHour: number) {
  const s = parseTimeToMinutes(start);
  const en = parseTimeToMinutes(end);
  const gridStart = startHour * 60;
  const gridEnd = endHour * 60;
  const clampedStart = clamp(s, gridStart, gridEnd);
  const clampedEnd = clamp(en, gridStart, gridEnd);
  const duration = Math.max(0, clampedEnd - clampedStart);
  const totalMinutes = (endHour - startHour) * 60;
  const topPct = ((clampedStart - gridStart) / totalMinutes) * 100;
  const heightPct = (duration / totalMinutes) * 100;
  return { topPct, heightPct, duration };
}

function clampToGrid(mins: number, startHour: number, endHour: number) {
  return clamp(mins, startHour * 60, endHour * 60);
}

type RenderEvent = {
  key: string;
  id: string;
  title: string;
  location?: string;
  colorClass?: string;
  day: DayIndex;
  start: string;
  end: string;
};

const DAY_MAP: Record<string, DayIndex> = { M: 0, T: 1, W: 2, R: 3, F: 4, S: 5, U: 6 };

function expandCoursesToRenderEvents(courses: Course[]): RenderEvent[] {
  const out: RenderEvent[] = [];
  for (const c of courses) {
    for (const m of c.meetings) {
      for (const d of m.days) {
        const dayIdx = DAY_MAP[d];
        if (dayIdx === undefined) continue;
        out.push({
          key: `${c.id}-${m.section}-${d}`,
          id: c.id,
          title: c.title,
          location: m.location,
          start: m.start,
          end: m.end,
          day: dayIdx,
        });
      }
    }
  }
  return out;
}

function toInterval(
    e: RenderEvent,
    startHour: number,
    endHour: number
  ): Interval | null {
    const s = clampToGrid(parseTimeToMinutes(e.start), startHour, endHour);
    const en = clampToGrid(parseTimeToMinutes(e.end), startHour, endHour);
    if (en <= s) return null;
    return { key: e.key, id: e.id, day: e.day, startMin: s, endMin: en };
  }

function computeConflictingEventKeys(
  events: RenderEvent[],
  startHour: number,
  endHour: number,
  daysToRender: number
): Set<string> {
  const conflictKeys = new Set<string>();

  for (let d = 0; d < daysToRender; d++) {
    const intervals = events
      .filter((e) => e.day === d)
      .map((e) => toInterval(e, startHour, endHour))
      .filter((x): x is Interval => x !== null)
      .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

    const active: Interval[] = [];
    let head = 0;

    for (const curr of intervals) {
      while (head < active.length && active[head].endMin <= curr.startMin) head++;

      if (head < active.length) {
        conflictKeys.add(curr.key);
        for (let i = head; i < active.length; i++) {
          conflictKeys.add(active[i].key);
        }
      }

      active.push(curr);

      let i = active.length - 1;
      while (i - 1 >= head && active[i - 1].endMin > active[i].endMin) {
        const tmp = active[i - 1];
        active[i - 1] = active[i];
        active[i] = tmp;
        i--;
      }
    }
  }

  return conflictKeys;
}

export default function WeekScheduler({
  events,
  startHour = 8,
  endHour = 20,
  slotMinutes = 60,
  showWeekend = true,
  onEventClick,
}: WeekSchedulerProps) {
  const { courses } = useSchedule();
  const daysToRender = showWeekend ? 7 : 5;
  const totalMinutes = (endHour - startHour) * 60;

  const eventsExpanded: RenderEvent[] = useMemo(() => {
    return events && events.length ? (events as RenderEvent[]) : expandCoursesToRenderEvents(courses);
  }, [events, courses]);

  const courseIds = useMemo(
    () => Array.from(new Set(eventsExpanded.map((e) => e.id))),
    [eventsExpanded]
  );
  const getColor = useCourseColors(courseIds);

  const layout = useMemo(() => {
    return (eventsExpanded || [])
      .map((e) => {
        const { topPct, heightPct } = computeEventPosition(e.start, e.end, startHour, endHour);
        return { ...e, topPct, heightPct, colorClass: getColor(e.id) };
      })
      .filter((e) => e.heightPct > 0);
  }, [eventsExpanded, startHour, endHour, getColor]);

  const timeMarks = useMemo(() => {
    const marks: { label: string; minutes: number }[] = [];
    const step = slotMinutes;
    for (let t = startHour * 60; t <= endHour * 60; t += step) {
      const hh = Math.floor(t / 60);
      const mm = t % 60;
      marks.push({
        label: `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`,
        minutes: t,
      });
    }
    return marks;
  }, [startHour, endHour, slotMinutes]);

  const conflictKeys = useMemo(() => {
    return computeConflictingEventKeys(eventsExpanded || [], startHour, endHour, daysToRender);
  }, [eventsExpanded, startHour, endHour, daysToRender]);

  const conflicts= useMemo(() => {
    const set = new Set<string>();
    const byKey = new Map(eventsExpanded.map(e => [e.key, e]));
    for (const k of conflictKeys) {
      const ev = byKey.get(k);
      if (ev) set.add(ev.title);
    }
    return Array.from(set);
  }, [conflictKeys, eventsExpanded]);

  let conflictOutput = "Cannot show schedule due to conflicts in:\n";

  return (
    <div className="w-full h-[720px] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
      {conflicts.length > 0 && (
          <div className="relative border-l">
            <div className="flex items-center justify-center h-full p-3 text-center text-sm font-semibold text-red-600">
              {conflictOutput += conflicts.map((title, i) => {
                return " " + title;
              })}
            </div>
          </div>
        )}
      <div className="grid" style={{ gridTemplateColumns: `80px repeat(${daysToRender}, 1fr)` }}>
        <div className="bg-zinc-100 dark:bg-zinc-700 p-3 border-b border-zinc-200 dark:border-zinc-800" aria-hidden="true" />
        {Array.from({ length: daysToRender }).map((_, d) => (
          <div
            key={d}
            className="bg-zinc-100 dark:bg-zinc-700 p-3 text-sm font-semibold text-zinc-700 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 text-center"
          >
            {dayNames[d]}
          </div>
        ))}
      </div>


      {conflicts.length === 0 && <div className="grid h-[calc(100%-44px)] mt-3 mb-3" style={{ gridTemplateColumns: `80px repeat(${daysToRender}, 1fr)` }}>
        <div className="relative">
          <div className="absolute inset-0">
            {timeMarks.map((m, i) =>
              m.minutes % 60 === 0 ? (
                <div
                  key={i}
                  className="absolute left-0 right-0 flex items-center justify-end pr-2 text-xs text-zinc-500"
                  style={{ top: `${((m.minutes - startHour * 60) / totalMinutes) * 100}%` }}
                >
                  <span className="translate-y-[-50%] select-none">{formatTime12h(m.minutes)}</span>
                </div>
              ) : null
            )}
          </div>
        </div>

        {conflicts.length === 0 && Array.from({ length: daysToRender }).map((_, d) => (
          <div key={d} className="relative border-l border-zinc-100 dark:border-zinc-800">
            <div className="absolute inset-0 p-1">
              {layout
                .filter((e) => e.day === d)
                .map((e) => {
                  const start12 = formatClock12h(e.start);
                  const end12 = formatClock12h(e.end);
                  const titleLabel = `${e.title} • ${start12}–${end12}${e.location ? ` @ ${e.location}` : ""}`;

                  return (
                    <button
                      key={e.key}
                      onClick={() => onEventClick?.(e)}
                      className={`group absolute w-[96%] left-[2%] rounded-xl ${e.colorClass} text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400/60 transition`}
                      style={{ top: `${e.topPct}%`, height: `${e.heightPct}%` }}
                      title={titleLabel}
                    >
                      <div className="h-full w-full p-2 flex flex-col items-center justify-center overflow-hidden relative">
                        <div className="overflow-y-auto scrollbar-hide p-2 text-center">
                          <div className="absolute inset-0 text-[9px] p-1 text-left font-medium opacity-90">{start12}–{end12}</div>
                          <div className="w-full text-center text-[10px] sm:text-[12px] font-semibold leading-tight whitespace-pre-wrap break-words">
                            {e.title}
                          </div>
                          {e.location && (
                            <div className="absolute bottom-0 left-0 p-1 text-[9px] opacity-90 whitespace-pre-wrap break-words">
                              {e.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}
