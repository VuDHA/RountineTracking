import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to generate mock data intensity (0-6)
const generateIntensity = (week: number, day: number) => {
  // Creates a somewhat realistic pattern that's deterministic based on week/day
  const base = ((week * 7) + day) % 6;
  return Math.min(Math.max(base, 0), 6);
};

export function WeeklyHeatmap() {
  // Generate sample heatmap data for demonstration
  const generateHeatmapData = () => {
    const weeks = ["4 weeks ago", "3 weeks ago", "2 weeks ago", "Last week"];
    return weeks.map((label, weekIndex) => {
      const days = Array.from({ length: 7 }).map((_, dayIndex) => {
        const intensity = generateIntensity(weekIndex, dayIndex);
        return { intensity };
      });
      return { label, days };
    });
  };
  
  const heatmapData = generateHeatmapData();
  
  return (
    <div className="mt-8">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Weekly Activity</h4>
      <div className="flex flex-wrap">
        {heatmapData.map((week, weekIndex) => (
          <div key={weekIndex} className="mr-6 mb-4">
            <div className="text-xs text-gray-500 mb-1">{week.label}</div>
            <div className="flex">
              {week.days.map((day, dayIndex) => {
                // Map intensity to color class
                let bgColorClass;
                switch (day.intensity) {
                  case 0: bgColorClass = "bg-green-50"; break;
                  case 1: bgColorClass = "bg-green-100"; break;
                  case 2: bgColorClass = "bg-green-200"; break;
                  case 3: bgColorClass = "bg-green-300"; break;
                  case 4: bgColorClass = "bg-green-400"; break;
                  case 5: bgColorClass = "bg-green-500"; break;
                  case 6: bgColorClass = "bg-green-600"; break;
                  default: bgColorClass = "bg-gray-100";
                }
                
                return (
                  <div 
                    key={dayIndex} 
                    className={`heatmap-cell ${bgColorClass}`}
                    style={{ width: "16px", height: "16px", margin: "2px" }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center text-xs text-gray-600 mt-2">
        <span className="mr-1">Less</span>
        <div className="heatmap-cell bg-green-50" style={{ width: "16px", height: "16px", margin: "2px" }}></div>
        <div className="heatmap-cell bg-green-100" style={{ width: "16px", height: "16px", margin: "2px" }}></div>
        <div className="heatmap-cell bg-green-200" style={{ width: "16px", height: "16px", margin: "2px" }}></div>
        <div className="heatmap-cell bg-green-300" style={{ width: "16px", height: "16px", margin: "2px" }}></div>
        <div className="heatmap-cell bg-green-400" style={{ width: "16px", height: "16px", margin: "2px" }}></div>
        <div className="heatmap-cell bg-green-500" style={{ width: "16px", height: "16px", margin: "2px" }}></div>
        <div className="heatmap-cell bg-green-600" style={{ width: "16px", height: "16px", margin: "2px" }}></div>
        <span className="ml-1">More</span>
      </div>
    </div>
  );
}
