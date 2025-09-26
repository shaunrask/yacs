import React from "react";
import Navbar from "../components/Navbar";
import { ScheduleProvider } from "../context/schedule-context";
import ScheduleList from "../components/ScheduleList";

function App() {
  return (
    <ScheduleProvider>
      <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 p-4">
        <div className="h-[60vh] w-full box-border border-4 bg-surface text-3xl font-bold items-center justify-center flex">
          Schedule Calendar
        </div>
        <ScheduleList />
      </main>
    </div>
    </ScheduleProvider>
  );
}

export default App;
