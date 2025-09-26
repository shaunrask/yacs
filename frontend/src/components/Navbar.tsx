import React from 'react';
import { Separator } from "./ui/Separator"
import ClassSearch from './ui/ClassSearch';

function Navbar() {
  return (
    <>
    <div className="flex justify-between items-center p-4 text-input-foreground bg-header border-b-4 border-b-border">
    <div className="flex items-center space-x-4">
      <a href="#home">YACS</a>
      <ClassSearch />
    </div>
    <div className="flex items-center space-x-4 h-6">
      <a href="#semester">Semester</a>
      <Separator orientation="vertical" />
      <a href="#professors">Professors</a>
      <Separator orientation="vertical" />
      <a href="#schedule">Schedule</a>
      <Separator orientation="vertical" />
      <a href="#more">More</a>
    </div>
    </div>
    <div id="class-search-results-slot" className="w-full"></div>
    </>
  );
}
export default Navbar;
