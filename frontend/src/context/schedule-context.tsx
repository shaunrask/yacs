import React, { createContext, useContext, useMemo, useState } from "react";
import { Course } from "../components/ui/WeekScheduler";

type ScheduleCtx = {
  courses: Course[];
  addCourse: (c: Course) => void;
  removeCourse: (id: string) => void;
  clear: () => void;
  hasCourse: (id: string) => boolean;
};

const ScheduleContext = createContext<ScheduleCtx | undefined>(undefined);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);

  const addCourse = (c: Course) =>
    setCourses((prev) => (prev.some((x) => x.id === c.id) ? prev : [...prev, c]));

  const removeCourse = (id: string) =>
    setCourses((prev) => prev.filter((x) => x.id !== id)); 

  const clear = () => setCourses([]);

  const hasCourse = (id: string) => courses.some((x) => x.id === id);

  const value = useMemo(() => ({ courses, addCourse, removeCourse, clear, hasCourse }), [courses]);

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used within a ScheduleProvider");
  return ctx;
}
