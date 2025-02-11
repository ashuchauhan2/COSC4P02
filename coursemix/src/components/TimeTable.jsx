import React from 'react';

const TimeTable = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 border">Time</th>
            {days.map((day) => (
              <th key={day} className="p-3 border font-semibold">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour) => (
            <tr key={hour}>
              <td className="p-3 border text-center font-medium">
                {`${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`}
              </td>
              {days.map((day) => (
                <td key={`${day}-${hour}`} className="p-3 border">
                  {/* Course slots will be populated here later */}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimeTable; 