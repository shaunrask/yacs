// src/components/ClassSearch.tsx
import * as React from "react";
import { createPortal } from "react-dom";
import { Search as SearchIcon, X as XIcon, Check as CheckIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { useSchedule } from "../../context/schedule-context";
import { Course } from "./WeekScheduler";

// placeholder data
const classesData: Course[] = [
  { id: "CSCI-1100", title: "Computer Science I", day: 0, start: "09:00", end: "10:00", location: "Room 101" },
  { id: "CSCI-1300", title: "Data Structures", day: 2, start: "14:00", end: "15:30", location: "Room 202", colorClass: "bg-emerald-500" },
  { id: "MATH-2010", title: "Multivariable Calculus & Linear Algebra", day: 1, start: "11:00", end: "12:15", location: "Room 303", colorClass: "bg-red-300" },
  { id: "PHYS-1200", title: "Physics II for Engineers", day: 3, start: "13:00", end: "14:15", location: "Room 404", colorClass: "bg-red-500" },
  { id: "ITWS-1100", title: "Information Technology & Web Science", day: 4, start: "10:00", end: "11:15", location: "Room 505", colorClass: "bg-yellow-500" },
  { id: "ECSE-2610", title: "Computer Components & Operations", day: 0, start: "15:00", end: "16:15", location: "Room 606", colorClass: "bg-purple-500" },
  { id: "HIST-1010", title: "History of the United States to 1877", day: 2, start: "09:30", end: "10:45", location: "Room 707", colorClass: "bg-pink-500" },
  { id: "CHEM-1100", title: "Chemistry I", day: 1, start: "14:30", end: "15:45", location: "Room 808", colorClass: "bg-teal-500" },
  { id: "BIO-1200", title: "Biology I: Introduction to Cell & Molecular Biology", day: 3, start: "08:00", end: "09:15", location: "Room 909", colorClass: "bg-orange-500" },
];


type ClassSearchProps = { dropdownContainerId?: string };

export function ClassSearch({ dropdownContainerId = "class-search-results-slot" }: ClassSearchProps) {
  const { addCourse, hasCourse } = useSchedule();

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
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = classesData.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return c.id.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
  });

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
                  addCourse(c);        
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
          "flex w-full items-center gap-2 rounded-md border bg-white",
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
