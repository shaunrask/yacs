import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ScheduleProvider } from "../context/schedule-context";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScheduleProvider>
        <Navbar />
        <Outlet /> 
      </ScheduleProvider>
    </div>
  );
}
