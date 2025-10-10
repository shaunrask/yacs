import * as React from "react";
import { useSchedule } from "../context/schedule-context";
import type { Course, Meeting } from "../types/schedule";

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
    <label className="flex items-center justify-between gap-2 px-3 py-1 hover:bg-muted rounded">
      <div className="flex items-center gap-2">
        <input
          type="radio"
          className="accent-blue-600"
          checked={checked}
          onChange={onChange}
        />
        <div className="text-sm">
          <div className="font-medium">{meeting.type} {meeting.section}</div>
          <div className="text-xs opacity-80">
            {formatDays(meeting.days)} · {meeting.start}–{meeting.end}
            {meeting.location ? ` · ${meeting.location}` : ""}
            {meeting.instructor ? ` · ${meeting.instructor}` : ""}
          </div>
        </div>
      </div>
      <div className="text-[10px] opacity-70">choose</div>
    </label>
  );
}

export default function ScheduleList() {
  const { courses, removeCourse, clear, catalog, addCourse } = useSchedule();

  const [open, setOpen] = React.useState<Record<string, boolean>>({}); // course.id -> expanded?

  const toggleOpen = (id: string) =>
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  // Replace a course's meetings by removing and re-adding (context doesn't have update)
  const replaceCourseMeetings = (course: Course, newMeetings: Meeting[]) => {
    removeCourse(course.id);
    // maintain other fields; only meetings change
    const updated: Course = { ...course, meetings: newMeetings };
    addCourse(updated);
  };

  const onPickSection = (course: Course, type: string, selected: Meeting) => {
    // ensure only ONE meeting per 'type' is kept
    const others = course.meetings.filter((m) => m.type !== type);
    replaceCourseMeetings(course, [...others, selected]);
  };

  // Helper: all available meetings from catalog for a course id
  const getAllMeetingsForCourse = (courseId: string): Meeting[] => {
    const full = catalog.find((c) => c.id === courseId);
    return full ? full.meetings : [];
  };

  // Group meetings by type
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
        {courses.length > 0 && (
          <button
            className="rounded-md border border-border px-3 py-1 text-sm hover:bg-muted"
            onClick={clear}
          >
            Clear all
          </button>
        )}
      </div>

      {courses.length === 0 ? (
        <p className="text-sm opacity-75">No classes selected yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-surface">
          {courses.map((c) => {
            const expanded = !!open[c.id];
            const allMeetings = getAllMeetingsForCourse(c.id);
            const allByType = groupByType(allMeetings);
            const currentByType = groupByType(c.meetings);

            return (
              <li key={c.id} className="">
                {/* Header row */}
                <div
                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleOpen(c.id)}
                >
                  <span className="font-medium">
                    {c.id} — {c.title}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      className="text-sm underline underline-offset-2 hover:opacity-80"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCourse(c.id);
                      }}
                    >
                      Remove
                    </button>
                    <span className="text-xs opacity-70">
                      {expanded ? "Hide sections ▲" : "Show sections ▼"}
                    </span>
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
                          // currently selected meeting for this type (if any)
                          const current = (currentByType[type] || [])[0] as Meeting | undefined;

                          // sort options by section label (optional)
                          const sortedOptions = [...options].sort((a, b) =>
                            String(a.section).localeCompare(String(b.section), undefined, { numeric: true })
                          );

                          return (
                            <div key={`${c.id}-${type}`} className="rounded-md border border-border">
                              <div className="px-3 py-2 text-sm font-semibold bg-muted/50">
                                {type} Sections
                              </div>
                              <div className="p-2 space-y-1">
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
