import { useSchedule } from "../context/schedule-context";

export default function ScheduleList() {
  const { courses, removeCourse, clear } = useSchedule();

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
          {courses.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-3 py-2">
              <span>{c.id} - {c.title}</span>
              <button
                className="text-sm underline underline-offset-2 hover:opacity-80"
                onClick={() => removeCourse(c.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
