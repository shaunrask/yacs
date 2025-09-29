import React from "react";
import Navbar from "../components/Navbar";
import { ScheduleProvider } from "../context/schedule-context";
import ScheduleList from "../components/ScheduleList";
import WeekScheduler, { CourseEvent } from "../components/ui/WeekScheduler";


function App() {
  //placeholder
  const myEvents: CourseEvent[] = [
    { id: "1", title: "Math", day: 0, start: "09:00", end: "10:00", location: "Room 101" },
    { id: "2", title: "Physics", day: 2, start: "14:00", end: "15:30", location: "Room 202", colorClass: "bg-emerald-500" },
  ];
  return (
    <ScheduleProvider>
      <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 p-4">
        <WeekScheduler 
          events={myEvents} 
          startHour={8}
          endHour={20}
          showWeekend={false}/>
        <ScheduleList />
      </main>
    </div>
    </ScheduleProvider>
  );
}

export default App;
