import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { Separator } from "./ui/Separator"
import ClassSearch from './ui/ClassSearch';
import ThemeToggle from './theme/ThemeToggle';

function Navbar() {
  return (
    <>
    <div className="flex justify-between items-center p-4 text-input-foreground bg-header border-b border-b-border">
    <div className="flex items-center space-x-4">
      <a href="" className="text-xl font-semibold">YACS</a>
      <ClassSearch />
    </div>
    <div className="flex items-center space-x-3 h-6 invisible sm:visible">
      <a href="#semester">Semester</a>
      <Separator orientation="vertical" />
      <a href="#professors">Professors</a>
      <Separator orientation="vertical" />
      <a href="#schedule">Schedule</a>
      <ThemeToggle />
    </div>
    <Bars3Icon className="absolute top-[24px] left-[90%] h-6 w-6 sm:hidden"/>
    </div>
    <div id="class-search-results-slot" className="w-full"></div>
    </>
  );
}
export default Navbar;
