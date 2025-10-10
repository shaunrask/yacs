import * as React from "react";
import { createPortal } from "react-dom";
import { Search as SearchIcon, X as XIcon, Check as CheckIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { useSchedule } from "../../context/schedule-context";
import type { Course, Meeting } from "../../types/schedule";

function pickDefaultMeetings(c: Course): Meeting[] {
  // Pick the first meeting for each meeting.type in the order they appear.
  const chosen = new Map<string, Meeting>();
  for (const m of c.meetings) {
    if (!chosen.has(m.type)) chosen.set(m.type, m);
  }
  return Array.from(chosen.values());
}

export function ClassSearch({ dropdownContainerId = "class-search-results-slot" }: { dropdownContainerId?: string }) {
  const { catalog, addCourse, hasCourse } = useSchedule(); // <- read from context

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);

  const [portalEl, setPortalEl] = React.useState<Element | null>(null);
  React.useEffect(() => {
    setPortalEl(document.getElementById(dropdownContainerId) || null);
  }, [dropdownContainerId]);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        (wrapperRef.current && wrapperRef.current.contains(t)) ||
        (dropdownRef.current && dropdownRef.current.contains(t))
      ) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = React.useMemo(() => {
    const items = Array.isArray(catalog) ? catalog : [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) =>
      c.id.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
    );
  }, [catalog, query]);

  const isOpen = open || query.length > 0;

  const dropdown = isOpen ? (
    <div
      ref={dropdownRef}
      className={cn("w-full overflow-hidden bg-header text-input-foreground")}
      role="listbox"
      aria-label="Search results"
    >
      {filtered.length === 0 ? (
        <div className="p-3 text-sm opacity-80">No classes found.</div>
      ) : (
        <ul className="max-h-40 overflow-auto divide-y divide-border overscroll-contain">
          {filtered.map((c) => {
            const already = hasCourse(c.id);
            return (
              <li
                key={c.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2 px-3 h-10",
                  already ? "opacity-60 cursor-not-allowed" : "hover:bg-muted"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (already) return;
                  // add course with ONLY the first section per meeting type
                  const selectedMeetings = pickDefaultMeetings(c);
                  const selectedCourse: Course = { ...c, meetings: selectedMeetings };
                  addCourse(selectedCourse);
                  setQuery("");
                  setOpen(true);
                  inputRef.current?.focus();
                }}
                role="option"
                aria-selected={already}
                aria-disabled={already}
              >
                <CheckIcon className={cn("h-4 w-4", already ? "opacity-100" : "opacity-0")} />
                <span className="truncate">{c.id} - {c.title}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  ) : null;

  return (
    <>
      <div
        ref={wrapperRef}
        className={cn(
          "flex w-full items-center gap-2 rounded-md border bg-white dark:bg-black",
          "border-border px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-ring"
        )}
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        <SearchIcon className="h-4 w-4 opacity-60" aria-hidden="true" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder="Search classes"
          className="flex-1 bg-transparent text-foreground placeholder:opacity-60 outline-none"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
        />
        {query && (
          <button
            type="button"
            className="rounded p-1 hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              setQuery("");
              setOpen(true);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            <XIcon className="h-4 w-4 opacity-60" />
          </button>
        )}
      </div>

      {portalEl && dropdown ? createPortal(dropdown, portalEl) : null}
    </>
  );
}

export default ClassSearch;
