import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import GradesList from "@/components/academic-progress/GradesList";
import CourseList from "@/components/academic-progress/CourseList";
import { decryptGrade } from "@/utils/grade-utils";
import Link from "next/link";
import { Toaster } from "sonner";

export default async function GradesPage() {
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
  
  // Fetch the user's grades
  const { data: grades, error } = await supabase
    .from("student_grades")
    .select("*")
    .eq("user_id", user.id)
    .order("year", { ascending: false })
    .order("term", { ascending: true });
  
  if (error) {
    // console.error("Error fetching grades:", error);
  }
  
  // Decrypt grades for display
  const decryptedGrades: { [id: string]: string } = {};
  
  if (grades) {
    // Keep track of any grades that need to be updated
    const gradesToUpdate: string[] = [];
    
    for (const grade of grades) {
      try {
        // Only attempt to decrypt if the grade field exists and appears to be encrypted
        if (grade.grade && typeof grade.grade === 'string') {
          if (grade.grade.includes(':')) {
            try {
              // Properly handle and log any potential decryption errors
              const decrypted = decryptGrade(grade.grade, user.id);
              decryptedGrades[grade.id] = decrypted;
              // console.log(`Successfully decrypted grade for ${grade.course_code}: ${decrypted}`);
              
              // If the grade has a value but is still marked as "in-progress", mark for status update
              if (grade.status === "in-progress" && decrypted && decrypted.trim() !== '') {
                // console.log(`Marking ${grade.course_code} for status update: in-progress -> completed`);
                gradesToUpdate.push(grade.id);
              }
            } catch (decryptError) {
              // console.error(`Decryption error for ${grade.course_code}:`, decryptError);
              // Store a placeholder value to indicate error
              decryptedGrades[grade.id] = 'Decryption Error';
            }
          } else {
            // For any unencrypted grades
            decryptedGrades[grade.id] = grade.grade;
            // console.log(`Using unencrypted grade for ${grade.course_code}: ${grade.grade}`);
            
            // If the grade has a value but is still marked as "in-progress", mark for status update
            if (grade.status === "in-progress" && grade.grade && grade.grade.trim() !== '') {
              // console.log(`Marking ${grade.course_code} for status update: in-progress -> completed`);
              gradesToUpdate.push(grade.id);
            }
          }
        } else {
          // If grade is missing or null
          decryptedGrades[grade.id] = 'N/A';
          // console.log(`No grade data for ${grade.course_code}`);
        }
      } catch (e) {
        // console.error(`General error processing grade ${grade.id} for ${grade.course_code}:`, e);
        decryptedGrades[grade.id] = 'Error';
      }
    }
    
    // Update any grades that need to be changed from "in-progress" to "completed"
    if (gradesToUpdate.length > 0) {
      // console.log(`Updating ${gradesToUpdate.length} grades from "in-progress" to "completed"`);
      
      // Update grades in bulk
      const { error: updateError } = await supabase
        .from("student_grades")
        .update({ status: "completed" })
        .in("id", gradesToUpdate);
      
      if (updateError) {
        // console.error("Error updating grade statuses:", updateError);
      } else {
        // console.log(`Successfully updated ${gradesToUpdate.length} grades to "completed" status`);
        
        // Update the local grades array to reflect the changes
        grades.forEach(grade => {
          if (gradesToUpdate.includes(grade.id)) {
            grade.status = "completed";
          }
        });
      }
    }
  }
  
  // Debug output all grades and their decrypted values
  // console.log('All grades with decrypted values:');
  // grades?.forEach(grade => {
  //   console.log(`${grade.course_code}: DB value = ${grade.grade}, Decrypted = ${decryptedGrades[grade.id]}, Status = ${grade.status}`);
  // });
  
  // Get user's program
  const { data: programData } = await supabase
    .from("user_profiles")
    .select("program_id")
    .eq("user_id", user.id)
    .single();

  const hasProgram = programData && programData.program_id;
  let programCourses = [];

  // Get all courses that are part of the user's program
  if (hasProgram) {
    const { data: courses, error: coursesError } = await supabase
      .from("program_requirements")
      .select("*")
      .eq("program_id", programData.program_id);
    
    if (coursesError) {
      // console.error("Error fetching program courses:", coursesError);
    } else {
      programCourses = courses || [];
    }
  }

  return (
    <main className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-6">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Academic Progress</h1>
          <p className="text-gray-600 mt-2">
            View your degree progression and manage your course grades.
          </p>
        </div>

        {/* Grades Overview Section */}
        <div className="mb-8">
          <GradesList 
            grades={grades || []} 
            decryptedGrades={decryptedGrades} 
          />
        </div>

        {/* Program Course Display Section */}
        {hasProgram ? (
          programCourses.length > 0 ? (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Program Requirements</h2>
              <CourseList 
                courses={programCourses}
                grades={grades || []}
                decryptedGrades={decryptedGrades}
                userId={user.id}
              />
            </div>
          ) : (
            <div className="my-5 bg-blue-100 rounded-lg shadow-md p-6 border border-blue-200 text-center">
              <h2 className="text-xl font-bold text-gray-800">Program Selected</h2>
              <p className="text-gray-600 mt-2">
                Your program has been selected, but no course requirements were found. 
                Please contact support if you believe this is an error.
              </p>
            </div>
          )
        ) : (
          <div className="my-5 bg-yellow-100 rounded-lg shadow-md p-6 border border-yellow-200 text-center">
            <h2 className="text-xl font-bold text-gray-800">No Program Selected</h2>
            <p className="text-gray-600 mt-2">
              Please <Link href="/protected/profile/edit" className="text-blue-600 hover:underline">select a program</Link> to view your degree requirements.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
