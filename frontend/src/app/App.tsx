import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Outlet /> 
    </div>
  );
}
