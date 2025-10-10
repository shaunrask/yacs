import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import type { Course } from "../types/schedule";
import { parseCoursesFromCsvText } from "../lib/parseSchedule"; 

type ScheduleCtx = {
  courses: Course[];               
  addCourse: (c: Course) => void;
  removeCourse: (id: string) => void;
  clear: () => void;
  hasCourse: (id: string) => boolean;

  catalog: Course[];
  loadCsv: (path: string) => Promise<void>;
};

const ScheduleContext = createContext<ScheduleCtx | undefined>(undefined);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [catalog, setCatalog] = useState<Course[]>([]); 

  const addCourse = (c: Course) => {
    setCourses((prev) => (prev.some((x) => x.id === c.id) ? prev : [...prev, c]));
  };
  const removeCourse = (id: string) =>
    setCourses((prev) => prev.filter((x) => x.id !== id));
  const clear = () => setCourses([]);
  const hasCourse = (id: string) => courses.some((x) => x.id === id);

  const loadCsv = useCallback(async (path: string) => {
    const res = await fetch(path);
    const text = await res.text();
    const parsed = parseCoursesFromCsvText(text); 
    setCatalog(parsed);
  }, []);

  const value = useMemo(
    () => ({ courses, addCourse, removeCourse, clear, hasCourse, catalog, loadCsv }),
    [courses, catalog]
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used within a ScheduleProvider");
  return ctx;
}
