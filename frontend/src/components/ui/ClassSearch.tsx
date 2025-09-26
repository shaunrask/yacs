import * as React from "react"
import { createPortal } from "react-dom"
import { Check as CheckIcon, Search as SearchIcon, X as XIcon } from "lucide-react"
import { cn } from "../../lib/utils"

//placeholder data
const classesData = [
  { value: "CSCI-1100", label: "CSCI-1100 — Computer Science I" },
  { value: "MATH-2010", label: "MATH-2010 — Multivariable Calculus" },
  { value: "PHYS-1200", label: "PHYS-1200 — Physics I" },
  { value: "ITWS-1100", label: "ITWS-1100 — Intro to ITWS" },
  { value: "ECSE-2610", label: "ECSE-2610 — Electric Circuits" },
]

type ClassSearchProps = {
  dropdownContainerId?: string
}

export function ClassSearch({ dropdownContainerId = "class-search-results-slot" }: ClassSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [value, setValue] = React.useState<string | null>(null)

  const wrapperRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const dropdownRef = React.useRef<HTMLDivElement | null>(null)

  const [portalEl, setPortalEl] = React.useState<Element | null>(null)
  React.useEffect(() => {
    setPortalEl(document.getElementById(dropdownContainerId) || null)
  }, [dropdownContainerId])

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (
        wrapperRef.current &&
        (wrapperRef.current.contains(t) || (dropdownRef.current && dropdownRef.current.contains(t)))
      ) {
        return
      }
      setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  const filtered = classesData.filter((c) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return c.label.toLowerCase().includes(q) || c.value.toLowerCase().includes(q)
  })

  const isOpen = open || query.length > 0

  const dropdown = isOpen ? (
    <div
      ref={dropdownRef}
      className={cn(
        "mt-2 w-full overflow-hidden rounded-md border border-border bg-surface shadow-sm"
      )}
      role="listbox"
      aria-label="Search results"
    >
      {filtered.length === 0 ? (
        <div className="p-3 text-sm opacity-80">No classes found.</div>
      ) : (
        <ul className="max-h-64 overflow-auto divide-y divide-border">
          {filtered.map((c) => {
            const selected = value === c.value
            return (
              <li
                key={c.value}
                className={cn(
                  "flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-muted"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setValue(c.value)
                  setQuery("")
                  setOpen(false)
                  inputRef.current?.blur()
                }}
                role="option"
                aria-selected={selected}
              >
                <span className="truncate">{c.label}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  ) : null

  return (
    <>
      <div
        ref={wrapperRef}
        className={cn(
          "flex w-full items-center gap-2 rounded-md border bg-white",
          "border-border px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-ring"
        )}
        onClick={() => {
          setOpen(true)
          inputRef.current?.focus()
        }}
      >
        <SearchIcon className="h-4 w-4 opacity-60" aria-hidden="true" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!isOpen) setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={
            value
              ? value
              : `Search classes`
          }
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
              e.stopPropagation()
              setQuery("")
              setOpen(true)
              inputRef.current?.focus()
            }}
            aria-label="Clear search"
          >
            <XIcon className="h-4 w-4 opacity-60" />
          </button>
        )}
      </div>

      {portalEl && dropdown ? createPortal(dropdown, portalEl) : null}
    </>
  )
}

export default ClassSearch
