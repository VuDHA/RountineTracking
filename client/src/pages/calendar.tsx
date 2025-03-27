import * as React from "react";
import { CalendarView } from "@/components/habit-tracker/calendar-view";

export default function CalendarPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Calendar</h2>
        <p className="mt-1 text-sm text-gray-600">View your habit completion history</p>
      </div>
      
      {/* Full-width calendar for the calendar page */}
      <div className="max-w-4xl mx-auto">
        <CalendarView />
      </div>
    </div>
  );
}
