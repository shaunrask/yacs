import React, { createContext, useContext, useMemo, useState } from "react";

export type Course = { value: string; label: string };

type ScheduleCtx = {
  courses: Course[];
  addCourse: (c: Course) => void;
  removeCourse: (value: string) => void;
  clear: () => void;
  hasCourse: (value: string) => boolean;
};

const ScheduleContext = createContext<ScheduleCtx | undefined>(undefined);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);

  const addCourse = (c: Course) =>
    setCourses((prev) => (prev.some((x) => x.value === c.value) ? prev : [...prev, c]));

  const removeCourse = (value: string) =>
    setCourses((prev) => prev.filter((x) => x.value !== value));

  const clear = () => setCourses([]);

  const hasCourse = (value: string) => courses.some((x) => x.value === value);

  const value = useMemo(() => ({ courses, addCourse, removeCourse, clear, hasCourse }), [courses]);

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used within a ScheduleProvider");
  return ctx;
}
