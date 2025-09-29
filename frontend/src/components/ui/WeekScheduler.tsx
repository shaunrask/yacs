import React, { useMemo } from "react";
import { useSchedule } from "../../context/schedule-context";

export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Mon, 6=Sun

export type Course = {
  id: string;
  title: string;
  day: DayIndex; 
  start: string; 
  end: string;   
  location?: string;
  instructor?: string;
  colorClass?: string; // optional color
};

export type WeekSchedulerProps = {
  events: Course[]; 
  startHour?: number; 
  endHour?: number;  
  slotMinutes?: number; 
  showWeekend?: boolean;
  onEventClick?: (ev: Course) => void;
};

export const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function parseTimeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
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

export function computeEventPosition(
  start: string,
  end: string,
  startHour: number,
  endHour: number
) {
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

export default function WeekScheduler({
  events = [], 
  startHour = 8,
  endHour = 20,
  slotMinutes = 60,
  showWeekend = true,
  onEventClick,
}: WeekSchedulerProps) {
  const { courses } = useSchedule();
  const daysToRender = showWeekend ? 7 : 5;
  const totalMinutes = (endHour - startHour) * 60;
  events = courses;

  const layout = useMemo(() => {
    return (events || [])
      .map((e) => {
        const { topPct, heightPct } = computeEventPosition(
          e.start,
          e.end,
          startHour,
          endHour
        );
        return { ...e, topPct, heightPct };
      })
      .filter((e) => e.heightPct > 0);
  }, [events, startHour, endHour]);

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

  return (
    <div className="w-full h-[720px] max-h-[80vh] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
      <div className="grid" style={{ gridTemplateColumns: `80px repeat(${daysToRender}, 1fr)` }}>
        <div className="bg-zinc-50 dark:bg-zinc-800 p-3 border-b border-zinc-200 dark:border-zinc-800" aria-hidden="true" />
        {Array.from({ length: daysToRender }).map((_, d) => (
          <div
            key={d}
            className="bg-zinc-50 dark:bg-zinc-800 p-3 text-sm font-semibold text-zinc-700 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 text-center"
          >
            {dayNames[d]}
          </div>
        ))}
      </div>

      <div className="grid h-[calc(100%-44px)] mt-3 mb-3" style={{ gridTemplateColumns: `80px repeat(${daysToRender}, 1fr)` }}>
        <div className="relative">
          <div className="absolute inset-0">
            {timeMarks.map((m, i) => (
              m.minutes % 60 === 0 ? (
                <div
                  key={i}
                  className="absolute left-0 right-0 flex items-center justify-end pr-2 text-xs text-zinc-500"
                  style={{ top: `${((m.minutes - startHour * 60) / totalMinutes) * 100}%` }}
                >
                  <span className="translate-y-[-50%] select-none">{formatTime12h(m.minutes)}</span>
                </div>
              ) : null
            ))}
          </div>
        </div>

        {Array.from({ length: daysToRender }).map((_, d) => (
          <div key={d} className="relative border-l border-zinc-100 dark:border-zinc-800">
            <div className="absolute inset-0">
              {timeMarks.map((m, i) => (
                <div
                  key={i}
                  className={`absolute left-0 right-0 border-t ${m.minutes % 60 === 0 ? "border-zinc-200 dark:border-zinc-800" : "border-zinc-100 dark:border-zinc-900"}`}
                  style={{ top: `${((m.minutes - startHour * 60) / totalMinutes) * 100}%` }}
                />
              ))}
            </div>

            <div className="absolute inset-0 p-1">
              {layout
                .filter((e) => e.day === d)
                .map((e) => {
                  const start12 = formatClock12h(e.start);
                  const end12 = formatClock12h(e.end);
                  const label = `${e.title} from ${start12} to ${end12}${e.location ? ` at ${e.location}` : ""}`;
                  const titleLabel = `${e.title} • ${start12}–${end12}${e.location ? ` @ ${e.location}` : ""}`;
                  return (
                    <button
                      key={e.id}
                      onClick={() => onEventClick?.(e)}
                      className={`group absolute w-[96%] left-[2%] rounded-xl ${e.colorClass ?? "bg-blue-500"} text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400/60 transition`}
                      style={{ top: `${e.topPct}%`, height: `${e.heightPct}%` }}
                      aria-label={label}
                      title={titleLabel}
                    >
                      <div className="h-full w-full p-2 flex flex-col items-start justify-between">
                        <div className="text-[10px] font-medium opacity-90">{start12}–{end12}</div>
                        <div className="text-[12px] font-semibold leading-tight">{e.title}</div>
                        {e.location && (
                          <div className="text-[10px] opacity-90">{e.location}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}