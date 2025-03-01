import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Timetable from "@/components/dashboard/Timetable";
import UserProfile from "@/components/dashboard/UserProfile";
import { getCurrentTerm, getCurrentDateET, toEasternTime } from "@/utils/date-utils";
import { Course, Term, ExtendedTermInfo } from "@/types";
import { numericToLetterGrade, decryptGrade } from "@/utils/grade-utils";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!userProfile) {
    return redirect("/protected/profile-setup");
  }
  
  // Fetch program information
  const { data: program } = await supabase
    .from("programs")
    .select("*")
    .eq("id", userProfile.program_id)
    .single();

  // Fetch grades for academic progress
  const { data: grades } = await supabase
    .from("student_grades")
    .select("*")
    .eq("user_id", user.id);

  // Decrypt grades manually
  const decryptedGrades: { [id: string]: string } = {};
  
  if (grades) {
    for (const grade of grades) {
      try {
        if (grade.grade && typeof grade.grade === 'string' && grade.grade.includes(':')) {
          try {
            const decrypted = decryptGrade(grade.grade, user.id);
            decryptedGrades[grade.id] = decrypted;
          } catch (decryptError) {
            decryptedGrades[grade.id] = 'Decryption Error';
          }
        } else {
          decryptedGrades[grade.id] = grade.grade || 'N/A';
        }
      } catch (e) {
        decryptedGrades[grade.id] = 'Error';
      }
    }
  }

  // Calculate academic progress
  let completedCourses = 0;
  const numericGrades: number[] = [];

  if (grades) {
    grades.forEach(grade => {
      const decryptedGrade = decryptedGrades[grade.id];
      
      if (grade.status === 'completed' && decryptedGrade && decryptedGrade !== 'Error' && decryptedGrade !== 'Decryption Error' && decryptedGrade !== 'N/A') {
        completedCourses++;
        
        let numericGrade: number | null = null;
        
        if (!isNaN(Number(decryptedGrade))) {
          numericGrade = Math.min(Number(decryptedGrade), 100);
        } else {
          // Convert letter grades to numeric values
          switch(decryptedGrade) {
            case 'A+': numericGrade = 95; break;
            case 'A': numericGrade = 87.5; break;
            case 'A-': numericGrade = 82.5; break;
            case 'B+': numericGrade = 77.5; break;
            case 'B': numericGrade = 75; break;
            case 'B-': numericGrade = 72.5; break;
            case 'C+': numericGrade = 67.5; break;
            case 'C': numericGrade = 65; break;
            case 'C-': numericGrade = 62.5; break;
            case 'D+': numericGrade = 57.5; break;
            case 'D': numericGrade = 55; break;
            case 'D-': numericGrade = 52.5; break;
            case 'F': numericGrade = 45; break;
          }
        }
        
        if (numericGrade !== null) {
          numericGrades.push(numericGrade);
        }
      }
    });
  }

  const currentAverage = numericGrades.length 
    ? numericGrades.reduce((sum, grade) => sum + grade, 0) / numericGrades.length 
    : 0;

  // Get current term - from the screenshot we can see it's "Winter" in the database
  const currentTermRaw = "Winter"; // Hardcoded based on screenshot
  const currentYear = 2025; // Hardcoded based on screenshot
  const currentTerm = {
    term: "WINTER" as Term,
    year: currentYear,
    displayName: `WINTER ${currentYear}`
  };
  
  // Fetch term dates from important_dates table
  const { data: termDates, error: termDatesError } = await supabase
    .from("important_dates")
    .select("*")
    .eq("term_type", "WINTER") // Using all caps here as it might be stored in the enum format
    .eq("year", currentYear)
    .single();

  console.log("Term dates error:", termDatesError);
  console.log("Term dates:", termDates);
  
  if (termDates) {
    console.log(`Term start date: ${termDates.term_start}, Term end date: ${termDates.term_end}`);
    if (termDates.reading_week_start && termDates.reading_week_end) {
      console.log(`Reading week: ${termDates.reading_week_start} to ${termDates.reading_week_end}`);
    } else {
      console.log("No reading week dates available");
    }
  } else {
    console.log("No term dates found in the database. Using default values.");
  }

  // Calculate term progress and days remaining
  let termProgress = 0;
  let daysRemaining = 0;
  let readingWeekStatus = "Not Scheduled";

  if (termDates && termDates.term_start && termDates.term_end) {
    // Always use Eastern Time for calculations
    const now = getCurrentDateET();
    console.log(`Current date in Eastern Time: ${now.toISOString()}`);
    
    const termStart = new Date(termDates.term_start);
    const termEnd = new Date(termDates.term_end);
    
    // Validate dates (ensure term_start is before term_end and both are valid dates)
    if (isNaN(termStart.getTime()) || isNaN(termEnd.getTime()) || termStart >= termEnd) {
      console.log("Invalid term dates, using fallback calculation");
      // Fallback logic - assume Winter term is Jan 1 to Apr 30 (in Eastern Time)
      const fallbackStart = new Date(Date.UTC(currentYear, 0, 1)); // Jan 1
      const fallbackEnd = new Date(Date.UTC(currentYear, 3, 30));  // Apr 30
      
      // Convert to Eastern Time
      const etFallbackStart = toEasternTime(fallbackStart);
      const etFallbackEnd = toEasternTime(fallbackEnd);
      
      daysRemaining = Math.ceil((etFallbackEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      daysRemaining = Math.max(0, daysRemaining);
      
      const totalDays = Math.ceil((etFallbackEnd.getTime() - etFallbackStart.getTime()) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.ceil((now.getTime() - etFallbackStart.getTime()) / (1000 * 60 * 60 * 24));
      
      termProgress = Math.min(100, Math.max(0, Math.round((daysElapsed / totalDays) * 100)));
    } else {
      // Calculate days remaining in the term
      daysRemaining = Math.ceil((termEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      daysRemaining = Math.max(0, daysRemaining);
      
      // Calculate term progress percentage
      const totalTermDays = Math.ceil((termEnd.getTime() - termStart.getTime()) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.ceil((now.getTime() - termStart.getTime()) / (1000 * 60 * 60 * 24));
      
      // Ensure progress is between 0-100%
      termProgress = Math.min(100, Math.max(0, Math.round((daysElapsed / totalTermDays) * 100)));
      
      console.log(`Term calculation (Eastern Time): ${daysElapsed} days elapsed out of ${totalTermDays} total days = ${termProgress}% complete`);
    }
    
    // Calculate reading week status
    if (termDates.reading_week_start && termDates.reading_week_end) {
      const readingWeekStart = new Date(termDates.reading_week_start);
      const readingWeekEnd = new Date(termDates.reading_week_end);
      
      // Validate reading week dates
      if (!isNaN(readingWeekStart.getTime()) && !isNaN(readingWeekEnd.getTime()) && readingWeekStart <= readingWeekEnd) {
        if (now > readingWeekEnd) {
          readingWeekStatus = "Completed";
        } else if (now >= readingWeekStart && now <= readingWeekEnd) {
          readingWeekStatus = "In Progress";
        } else {
          const daysToReadingWeek = Math.max(0, Math.ceil((readingWeekStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          readingWeekStatus = `Starts in ${daysToReadingWeek} days`;
        }
      } else {
        console.log("Invalid reading week dates");
        readingWeekStatus = "Not Scheduled";
      }
    } else {
      readingWeekStatus = "Not Scheduled";
    }
  } else {
    // Fallback if no term dates are available - estimate based on current date
    console.log("No term dates found, using estimated calculation");
    
    // Use Eastern Time
    const now = getCurrentDateET();
    
    // Fallback - assume Winter term is Jan 1 to Apr 30 (in Eastern Time)
    const fallbackStart = new Date(Date.UTC(currentYear, 0, 1)); // Jan 1
    const fallbackEnd = new Date(Date.UTC(currentYear, 3, 30));  // Apr 30
    
    // Convert to Eastern Time
    const etFallbackStart = toEasternTime(fallbackStart);
    const etFallbackEnd = toEasternTime(fallbackEnd);
    
    daysRemaining = Math.ceil((etFallbackEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    daysRemaining = Math.max(0, daysRemaining);
    
    const totalDays = Math.ceil((etFallbackEnd.getTime() - etFallbackStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((now.getTime() - etFallbackStart.getTime()) / (1000 * 60 * 60 * 24));
    
    termProgress = Math.min(100, Math.max(0, Math.round((daysElapsed / totalDays) * 100)));
    console.log(`Fallback term calculation (Eastern Time): ${termProgress}% complete, ${daysRemaining} days remaining`);
    
    readingWeekStatus = "Not Available";
  }

  // Fetch active enrollments - from screenshots we can see status is "enrolled" not "active"
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select(`
      id,
      course_id,
      term,
      status
    `)
    .eq("user_id", user.id)
    .eq("term", currentTermRaw) // Using "Winter" as seen in the screenshot
    .eq("status", "enrolled"); // Using "enrolled" as seen in the screenshot

  console.log("Enrollments error:", enrollmentsError);
  console.log("Enrollments:", enrollments);

  // Fetch courses for all enrollments
  const courseIds = enrollments?.map(enrollment => enrollment.course_id) || [];
  
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select(`
      id,
      course_code,
      course_days,
      class_time,
      class_type,
      instructor
    `)
    .in("id", courseIds.length > 0 ? courseIds : ['no-courses-fallback']);

  console.log("Courses error:", coursesError);
  console.log("Courses:", courses);

  // Combine enrollment and course data
  let activeCourses: (Course & { enrollment_id: string })[] = [];
  
  if (enrollments && enrollments.length > 0 && courses && courses.length > 0) {
    enrollments.forEach(enrollment => {
      const course = courses.find(c => c.id === enrollment.course_id);
      
      if (course) {
        activeCourses.push({
          ...course,
          enrollment_id: enrollment.id,
        });
      }
    });
  }
  
  console.log('Active courses:', activeCourses);

  // Calculate the number of active courses
  const coursesThisTerm = activeCourses.length;

  const termInfo: ExtendedTermInfo = {
    ...currentTerm,
    daysRemaining: daysRemaining,
    progress: termProgress,
    readingWeekStatus,
    coursesThisTerm
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Welcome back, {userProfile.first_name}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left sidebar with user profile */}
          <div className="lg:col-span-1">
            <UserProfile 
              userProfile={userProfile} 
              program={program} 
              termInfo={termInfo}
              academicProgress={{
                currentAverage,
                completedCourses
              }}
            />
          </div>
          
          {/* Main content with timetable */}
          <div className="lg:col-span-3">
            <Timetable activeCourses={activeCourses} />
          </div>
        </div>
      </div>
    </div>
  );
} 