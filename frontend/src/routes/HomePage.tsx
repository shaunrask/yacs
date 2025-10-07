import React from "react";
import { ScheduleProvider } from "../context/schedule-context";
import ScheduleList from "../components/ScheduleList";
import WeekScheduler from "../components/ui/WeekScheduler";

export default function HomePage() {
  return (
    <ScheduleProvider>
      <main className="flex-1 p-4">
        <WeekScheduler events={[]} startHour={8} endHour={20} showWeekend={false} />
        <ScheduleList />
      </main>
    </ScheduleProvider>
  );
}
