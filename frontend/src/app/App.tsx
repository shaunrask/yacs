import React from "react";
import Navbar from "../components/Navbar";
import { ScheduleProvider } from "../context/schedule-context";
import ScheduleList from "../components/ScheduleList";
import WeekScheduler, { Course } from "../components/ui/WeekScheduler";


function App() {
  return (
    <ScheduleProvider>
      <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 p-4">
        <WeekScheduler 
          events={[]} 
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
