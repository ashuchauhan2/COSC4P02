import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Constants for the timetable
const TIMETABLE_START = 7; // Change to 7:00 AM to show one hour before
const TIMETABLE_END = 23; // Keep end time the same
const HOURS_COUNT = TIMETABLE_END - TIMETABLE_START;

const dayLetterMapping = {
  Monday: "M",
  Tuesday: "T",
  Wednesday: "W",
  Thursday: "R",
  Friday: "F",
};

// Add constant for online course types
const ONLINE_COURSE_TYPES = ["ASY", "ASO", "SYN", "SYO", "ONM", "HYF", "PRO"];

const TimeTable = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatTime = (hour, minute) => {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Toronto",
    });
  };

  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const normalized = timeStr.replace(/:/g, "");
    let [start, end] = timeStr
      .replace(/:/g, "")
      .split("-")
      .map((part) => part.trim());

    // Function to parse 3 or 4 digit time
    const parseTimeComponent = (time) => {
      // For 3 digits (e.g., "900"), take first digit as hour and last two as minutes
      if (time.length === 3) {
        return {
          hour: parseInt(time.substring(0, 1), 10),
          minute: parseInt(time.substring(1), 10),
        };
      }
      // For 4 digits (e.g., "0900" or "1430"), take first two digits as hour and last two as minutes
      else if (time.length === 4) {
        return {
          hour: parseInt(time.substring(0, 2), 10),
          minute: parseInt(time.substring(2), 10),
        };
      }
      // Handle unexpected formats
      return { hour: 0, minute: 0 };
    };

    const startTime = parseTimeComponent(start);
    const endTime = parseTimeComponent(end);

    return {
      startHour: startTime.hour,
      startMinute: startTime.minute,
      endHour: endTime.hour,
      endMinute: endTime.minute,
    };
  };

  const isCourseActive = (course) => {
    const torontoNow = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Toronto" })
    );
    const formattedToday = torontoNow.toLocaleDateString("sv-SE");
    return (
      formattedToday >= course.start_date && formattedToday <= course.end_date
    );
  };

  // Calculate position and height for course blocks
  const calculateCoursePosition = (timeObj) => {
    // Helper to convert any hour to 24-hour format
    const normalizeHour = (hour) => {
      // Ensure the hour is between 0 and 23
      return hour >= 0 && hour <= 23 ? hour : 0;
    };

    // Convert start and end hours to 24-hour format
    const startHour = normalizeHour(timeObj.startHour);
    const endHour = normalizeHour(timeObj.endHour);

    // Calculate minutes since timetable start (8 AM)
    // For debugging
    // console.log("Start Hour:", startHour, "End Hour:", endHour);

    const startMinutesSinceTimetableStart = Math.max(
      0,
      (startHour - TIMETABLE_START) * 60 + timeObj.startMinute
    );

    const endMinutesSinceTimetableStart = Math.max(
      0,
      (endHour - TIMETABLE_START) * 60 + timeObj.endMinute
    );

    const totalMinutesInTimetable = HOURS_COUNT * 60;

    // For debugging
    // console.log(
    //   "Start minutes since timetable start:",
    //   startMinutesSinceTimetableStart
    // );
    // console.log(
    //   "End minutes since timetable start:",
    //   endMinutesSinceTimetableStart
    // );
    // console.log("Total minutes in timetable:", totalMinutesInTimetable);

    const top =
      (startMinutesSinceTimetableStart / totalMinutesInTimetable) * 100;
    const height =
      ((endMinutesSinceTimetableStart - startMinutesSinceTimetableStart) /
        totalMinutesInTimetable) *
      100;

    // For debugging
    // console.log("Calculated position:", { top, height });

    return { top, height };
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("User not logged in");

        const { data: enrollments, error: enrollmentsError } = await supabase
          .from("enrollments")
          .select(
            `
            id,
            course_id,
            courses (
              id,
              course_code,
              class_type,
              course_days,
              class_time,
              start_date,
              end_date,
              instructor
            )
          `
          )
          .eq("user_id", user.id)
          .eq("status", "enrolled");

        if (enrollmentsError) throw enrollmentsError;

        const fetchedCourses = enrollments
          .filter((enrollment) => enrollment.courses)
          .map((enrollment) => ({
            ...enrollment.courses,
            enrollment_id: enrollment.id,
          }));

        setCourses(fetchedCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading)
    return <div className="text-center p-4">Loading schedule...</div>;
  if (error)
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;

  const activeCourses = courses.filter(isCourseActive);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayAbbreviations = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
  };

  return (
    <div className="w-full h-[calc(100vh-8rem)] max-w-5xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-6 flex-grow">
          {/* Time Labels */}
          <div className="relative border-r border-gray-200">
            <div className="h-12 border-b border-gray-200 bg-gray-50"></div>
            <div className="relative h-[calc(100%-3rem)]">
              {Array.from({ length: HOURS_COUNT }, (_, i) => {
                const hour = TIMETABLE_START + i;
                // Skip rendering the 7am label
                if (hour === 7) return null;
                return (
                  <div
                    key={i}
                    className={`absolute w-full text-xs font-semibold pr-2 flex items-center justify-end ${
                      hour < 8 ? "text-gray-400" : "text-gray-600"
                    }`}
                    style={{
                      top: `${(i / HOURS_COUNT) * 100}%`,
                      height: `${(1 / HOURS_COUNT) * 100}%`,
                      transform: "translateY(-50%)",
                    }}
                  >
                    {formatTime(hour, 0)}
                    <div className="absolute right-0 w-2 h-[1px] bg-gray-500" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day Columns */}
          {days.map((day) => {
            const dayLetter = dayLetterMapping[day];
            const coursesForDay = activeCourses.filter((course) =>
              course.course_days.includes(dayLetter)
            );

            return (
              <div key={day} className="relative border-r border-gray-200">
                {/* Day Header */}
                <div className="h-12 border-b border-gray-200 bg-gray-50 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-700">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{dayAbbreviations[day]}</span>
                  </span>
                </div>

                {/* Course Container */}
                <div className="relative h-[calc(100%-3rem)]">
                  {/* Hour Grid Lines */}
                  {Array.from({ length: HOURS_COUNT }, (_, i) => (
                    <div key={`grid-${i}`}>
                      <div
                        className={`absolute w-full border-t ${
                          TIMETABLE_START + i === 8
                            ? "border-gray-300"
                            : "border-gray-200"
                        }`}
                        style={{ top: `${(i / HOURS_COUNT) * 100}%` }}
                      />
                      <div
                        className="absolute w-full border-t border-gray-100 border-dashed"
                        style={{ top: `${((i + 0.5) / HOURS_COUNT) * 100}%` }}
                      />
                    </div>
                  ))}

                  {/* Add final border line at bottom */}
                  <div
                    className="absolute w-full border-t border-gray-300"
                    style={{ bottom: "0" }}
                  />

                  {/* Pre-8am shaded area with "No Classes" text */}
                  <div
                    className="absolute w-full bg-gray-50/50 flex items-center justify-center"
                    style={{
                      top: 0,
                      height: `${(1 / HOURS_COUNT) * 100}%`,
                    }}
                  >
                    <span className="text-[10px] text-gray-600 font-bold">
                      <p className="">No Classes</p>
                    </span>
                  </div>

                  {/* Post-10pm shaded area with "No Classes" text */}
                  <div
                    className="absolute w-full bg-gray-50/50 flex items-center justify-center"
                    style={{
                      bottom: 0,
                      height: `${(1 / HOURS_COUNT) * 100}%`,
                    }}
                  >
                    <span className="text-[10px] text-gray-600 font-bold">
                      <p className="">No Classes</p>
                    </span>
                  </div>

                  {/* Course Blocks */}
                  {coursesForDay.map((course) => {
                    const timeObj = parseTime(course.class_time);
                    if (!timeObj) return null;

                    const { top, height } = calculateCoursePosition(timeObj);
                    const colorHash = course.course_code
                      .split("")
                      .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
                    const hue = colorHash % 360;

                    return (
                      <div
                        key={`${course.enrollment_id}-${dayLetter}`}
                        className="absolute left-1 right-1 rounded-md shadow-sm backdrop-blur-sm 
                                 transition-transform hover:scale-[1.02] cursor-pointer z-10"
                        style={{
                          top: `${top}%`,
                          height: `${height}%`,
                          backgroundColor: `hsla(${hue}, 70%, 85%, 0.9)`,
                          border: `1px solid hsla(${hue}, 70%, 75%, 1)`,
                        }}
                      >
                        <div className="p-1.5 h-full flex flex-col">
                          <div className="font-bold text-[11px] text-gray-800">
                            {course.course_code}
                          </div>
                          <div className="text-[9px] text-gray-600">
                            {course.class_type}
                          </div>
                          {course.instructor && (
                            <div className="text-[8px] text-gray-500 mt-auto truncate">
                              {course.instructor}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Online Courses Section */}
        {activeCourses.some(
          (course) => !course.class_time && ONLINE_COURSE_TYPES.includes(course.class_type)
        ) && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Online Courses
            </h3>
            <div className="flex flex-wrap gap-2">
              {activeCourses
                .filter(
                  (course) => !course.class_time && ONLINE_COURSE_TYPES.includes(course.class_type)
                )
                .map((course) => {
                  const colorHash = course.course_code
                    .split("")
                    .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
                  const hue = colorHash % 360;

                  return (
                    <div
                      key={course.id}
                      className="p-2 rounded-md shadow-sm backdrop-blur-sm 
                               transition-transform hover:scale-[1.02] cursor-pointer"
                      style={{
                        backgroundColor: `hsla(${hue}, 70%, 85%, 0.9)`,
                        border: `1px solid hsla(${hue}, 70%, 75%, 1)`,
                      }}
                    >
                      <div className="font-bold text-sm text-gray-800">
                        {course.course_code}
                      </div>
                      <div className="text-xs text-gray-600">
                        {course.class_type === "ASY" ? "Asynchronous Online" :
                         course.class_type === "ASO" ? "Asynchronous Online, In-Person Exam" :
                         course.class_type === "SYN" ? "Synchronous Online" :
                         course.class_type === "SYO" ? "Synchronous Online, In-Person Exam" :
                         course.class_type === "ONM" ? "Online Mixed" :
                         course.class_type === "HYF" ? "Hybrid Flexible" :
                         course.class_type === "PRO" ? "Project Course" :
                         "Online"}
                      </div>
                      {course.instructor && (
                        <div className="text-xs text-gray-500 mt-1">
                          {course.instructor}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTable;
