import * as React from "react";
import { useSchedule } from "../context/schedule-context";
import type { Course, Meeting } from "../types/schedule";
import { Button } from "./ui/button";

function formatDays(ds: string[]) {
  return (ds || []).join("");
}

function SectionRow({
  meeting,
  checked,
  onChange,
}: {
  meeting: Meeting;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center justify-center rounded w-full">
      <Button
        type="button"
        onClick={onChange}
        className={[
          "w-full text-left justify-start",   
          "min-w-0",                          
          "h-30",                            
          checked ? "bg-background hover:bg-muted/50" : "hover:bg-muted",
        ].join(" ")}
      >
        <div className="flex items-start gap-2 w-full min-w-0">
          <div className="text-sm w-full min-w-0">
            <div className="font-medium truncate">
              {meeting.type} {meeting.section}
            </div>
            <div className="text-xs opacity-80 whitespace-normal break-words leading-snug">
              {formatDays(meeting.days)} · {meeting.start}–{meeting.end}
              {meeting.location ? ` · ${meeting.location}` : ""}
              {meeting.instructor ? ` · ${meeting.instructor}` : ""}
            </div>
          </div>
        </div>
      </Button>
    </label>
  );
}

export default function ScheduleList() {
  const { courses, removeCourse, clear, catalog, addCourse } = useSchedule();

  // --- Keep a stable display order by course.id ---
  const orderRef = React.useRef<Map<string, number>>(new Map());
  React.useEffect(() => {
    // Assign an index to any course.id that doesn't have one yet
    const map = orderRef.current;
    let maxIndex = Math.max(-1, ...Array.from(map.values()));
    for (let i = 0; i < courses.length; i++) {
      const id = courses[i].id;
      if (!map.has(id)) {
        maxIndex += 1;
        map.set(id, maxIndex);
      }
    }
    // Optionally prune removed ids
    const currentIds = new Set(courses.map(c => c.id));
    for (const id of Array.from(map.keys())) {
      if (!currentIds.has(id)) map.delete(id);
    }
  }, [courses]);

  const displayCourses = React.useMemo(() => {
    const map = orderRef.current;
    return [...courses].sort((a, b) => {
      const ia = map.get(a.id) ?? 0;
      const ib = map.get(b.id) ?? 0;
      return ia - ib;
    });
  }, [courses]);

  const [open, setOpen] = React.useState<Record<string, boolean>>({});
  const toggleOpen = (id: string) =>
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  // Replace a course's meetings by removing and re-adding (id stays same).
  // Visual order is preserved by the orderRef-based sort above.
  const replaceCourseMeetings = (course: Course, newMeetings: Meeting[]) => {
    removeCourse(course.id);
    const updated: Course = { ...course, meetings: newMeetings };
    addCourse(updated);
    // No need to touch orderRef since id is unchanged.
  };

  const onPickSection = (course: Course, type: string, selected: Meeting) => {
    const others = course.meetings.filter((m) => m.type !== type);
    replaceCourseMeetings(course, [...others, selected]);
  };

  const getAllMeetingsForCourse = (courseId: string): Meeting[] => {
    const full = catalog.find((c) => c.id === courseId);
    return full ? full.meetings : [];
  };

  const groupByType = (meetings: Meeting[]): Record<string, Meeting[]> => {
    return meetings.reduce<Record<string, Meeting[]>>((acc, m) => {
      (acc[m.type] ||= []).push(m);
      return acc;
    }, {});
  };

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Schedule</h2>
        {displayCourses.length > 0 && (
          <button
            className="rounded-md border border-border px-3 py-1 text-sm hover:bg-muted"
            onClick={clear}
          >
            Clear all
          </button>
        )}
      </div>

      {displayCourses.length === 0 ? (
        <p className="text-sm opacity-75">No classes selected yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-surface">
          {displayCourses.map((c) => {
            const expanded = !!open[c.id];
            const allMeetings = getAllMeetingsForCourse(c.id);
            const allByType = groupByType(allMeetings);
            const currentByType = groupByType(c.meetings);

            return (
              <li key={c.id}>
                {/* Header row */}
                <div
                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleOpen(c.id)}
                >
                  <span className="font-medium truncate">
                    {c.id} — {c.title}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs opacity-70">
                      {expanded ? "Hide sections ▲" : "Show sections ▼"}
                    </span>
                    <button
                      className="text-sm hover:opacity-60"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCourse(c.id);
                      }}
                      aria-label={`Remove ${c.id}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Expanded: section pickers grouped by type */}
                {expanded && (
                  <div className="px-3 pb-3">
                    {Object.keys(allByType).length === 0 ? (
                      <div className="text-sm opacity-75 px-2 py-2">
                        No section data available for this class.
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-3">
                        {Object.entries(allByType).map(([type, options]) => {
                          const current = (currentByType[type] || [])[0] as Meeting | undefined;
                          const sortedOptions = [...options].sort((a, b) =>
                            String(a.section).localeCompare(String(b.section), undefined, { numeric: true })
                          );

                          return (
                            <div key={`${c.id}-${type}`} className="rounded-md border border-border min-w-0">
                              <div className="px-3 py-2 text-sm font-semibold bg-muted/50">
                                {type} Sections
                              </div>
                              <div className="p-2 space-y-1 min-w-0">
                                {sortedOptions.map((opt) => (
                                  <SectionRow
                                    key={`${c.id}-${type}-${opt.section}`}
                                    meeting={opt}
                                    checked={
                                      current
                                        ? current.section === opt.section && current.type === opt.type
                                        : false
                                    }
                                    onChange={() => onPickSection(c, type, opt)}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
