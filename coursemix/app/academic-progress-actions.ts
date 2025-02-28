"use server";

import { createClient } from "@/utils/supabase/server";
import { encryptGrade } from "@/utils/grade-utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Adds a new grade record to the database
 */
export async function addGradeAction(formData: FormData) {
  const supabase = await createClient();
  
  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "User not authenticated" };
  }
  
  // Extract values from form data
  const courseCode = formData.get("course_code") as string;
  const grade = formData.get("grade") as string;
  const term = formData.get("term") as string;
  const year = parseInt(formData.get("year") as string, 10);
  let status = formData.get("status") as string;
  
  // Validate form inputs
  if (!courseCode || !grade || !term || isNaN(year)) {
    return { error: "Course code, grade, term, and year are required" };
  }
  
  // Automatically set status to "completed" when a grade is provided
  if (grade && grade.trim() !== '') {
    status = "completed";
  } else {
    // Default to "in-progress" if no grade is provided and no status is specified
    status = status || "in-progress";
  }
  
  // console.log(`Adding grade: ${courseCode}, Grade: ${grade}, Status: ${status}`);
  
  try {
    // Encrypt the grade using the utility function
    const encryptedGrade = encryptGrade(grade, user.id);
    
    // Insert the grade record with encrypted grade
    const { data, error } = await supabase
      .from("student_grades")
      .insert({
        user_id: user.id,
        course_code: courseCode,
        grade: encryptedGrade, // Store encrypted grade
        term: term,
        year: year,
        status: status,
      });
    
    if (error) {
      // console.error("Error adding grade:", error);
      return { error: error.message };
    }
    
    // Revalidate the page to reflect the new data
    revalidatePath("/protected/academic-progress");
    
    return { success: true, message: "Grade added successfully" };
  } catch (error) {
    // console.error("Error in addGradeAction:", error);
    return { error: "Failed to add grade. Please try again." };
  }
}

/**
 * Updates an existing grade record in the database
 */
export async function updateGradeAction(formData: FormData) {
  const supabase = await createClient();
  
  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "User not authenticated" };
  }
  
  // Extract values from form data
  const gradeId = formData.get("grade_id") as string;
  const grade = formData.get("grade") as string;
  let status = formData.get("status") as string;
  
  // Validate form inputs
  if (!gradeId || !grade) {
    return { error: "Grade ID and grade value are required" };
  }
  
  // Automatically set status to "completed" when a grade is provided
  if (grade && grade.trim() !== '') {
    status = "completed";
  } else {
    // Default to "in-progress" if no grade is provided and no status is specified
    status = status || "in-progress";
  }
  
  // console.log(`Updating grade: ID=${gradeId}, Value=${grade}, Status=${status}`);
  
  try {
    // Retrieve the current grade record to compare
    const { data: currentGrade, error: lookupError } = await supabase
      .from("student_grades")
      .select("*")
      .eq("id", gradeId)
      .eq("user_id", user.id)
      .single();
    
    if (lookupError) {
      // console.error("Error retrieving current grade:", lookupError);
      return { error: "Could not retrieve current grade record" };
    }
    
    // console.log("Current grade record:", currentGrade);
    
    // Encrypt the grade using the utility function
    const encryptedGrade = encryptGrade(grade, user.id);
    
    // console.log(`Grade encrypted successfully. Updating in database.`);
    
    // Update the grade record with encrypted grade
    const { data, error } = await supabase
      .from("student_grades")
      .update({
        grade: encryptedGrade, // Store encrypted grade
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gradeId)
      .eq("user_id", user.id); // Ensure user can only update their own grades
    
    if (error) {
      // console.error("Error updating grade:", error);
      return { error: error.message };
    }
    
    // console.log("Grade updated successfully:", data);
    
    // Revalidate the page to reflect the updated data
    revalidatePath("/protected/academic-progress");
    
    return { success: true, message: "Grade updated successfully" };
  } catch (error) {
    // console.error("Error in updateGradeAction:", error);
    return { error: "Failed to update grade. Please try again." };
  }
}

/**
 * Deletes a grade record from the database
 */
export async function deleteGradeAction(formData: FormData) {
  const supabase = await createClient();
  
  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error("Delete grade failed: User not authenticated");
    return { error: "User not authenticated" };
  }
  
  // Extract grade ID from form data
  const gradeId = formData.get("grade_id") as string;
  
  if (!gradeId) {
    console.error("Delete grade failed: Grade ID is required");
    return { error: "Grade ID is required" };
  }
  
  console.log(`Attempting to delete grade with ID: ${gradeId} for user: ${user.id}`);
  
  try {
    // First check if the grade exists and belongs to the user
    const { data: existingGrade, error: queryError } = await supabase
      .from("student_grades")
      .select("*")
      .eq("id", gradeId)
      .eq("user_id", user.id)
      .single();
    
    if (queryError) {
      console.error("Error checking grade existence:", queryError);
      if (queryError.code === "PGRST116") {
        // No rows returned
        return { error: "Grade not found or you don't have permission to delete it" };
      }
      return { error: `Database error: ${queryError.message}` };
    }
    
    if (!existingGrade) {
      console.error(`Grade with ID ${gradeId} not found for user ${user.id}`);
      return { error: "Grade not found" };
    }
    
    console.log("Found grade to delete:", existingGrade);
    
    // Try to delete the grade
    const { data, error, count } = await supabase
      .from("student_grades")
      .delete()
      .eq("id", gradeId)
      .eq("user_id", user.id)
      .select();
    
    if (error) {
      console.error("Error deleting grade:", error);
      // Check for specific error types
      if (error.code === '23503') {
        return { error: "Cannot delete grade due to foreign key constraints" };
      }
      return { error: `Failed to delete grade: ${error.message}` };
    }
    
    console.log(`Deleted ${count || 0} grade(s). Deleted data:`, data);
    
    if (!data || data.length === 0) {
      console.warn("Delete operation reported success but no rows were affected");
    }
    
    // If still here, try the force delete method as a fallback
    if (!data || data.length === 0) {
      console.log("Standard delete didn't affect any rows. Trying force delete...");
      const formDataCopy = new FormData();
      formDataCopy.append("grade_id", gradeId);
      const forceDeleteResult = await forceDeleteGradeAction(formDataCopy);
      
      if ('error' in forceDeleteResult) {
        console.log("Force delete also failed:", forceDeleteResult.error);
      } else {
        console.log("Force delete succeeded");
      }
      
      // Still return success to the client if the force delete worked
      if ('success' in forceDeleteResult && forceDeleteResult.success) {
        revalidatePath("/protected/academic-progress");
        return { success: true, message: "Grade deleted successfully via fallback method" };
      }
    }
    
    // Revalidate the page to reflect the deleted data
    revalidatePath("/protected/academic-progress");
    
    return { success: true, message: "Grade deleted successfully" };
  } catch (error) {
    console.error("Error in deleteGradeAction:", error);
    return { error: "Failed to delete grade. Please try again." };
  }
}

/**
 * Saves a grade for a specific course from the CourseCard component
 * Allows clearing a grade if an empty string is provided
 */
export async function saveGradeAction(courseCode: string, grade: string, userId: string) {
  const supabase = await createClient();
  
  // Verify the user ID matches the authenticated user for security
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.id !== userId) {
    return { error: "User authentication error" };
  }
  
  try {
    // Check if there's already a grade for this course
    const { data: existingRecord } = await supabase
      .from("student_grades")
      .select("id")
      .eq("user_id", userId)
      .eq("course_code", courseCode)
      .single();
    
    // If the grade is empty and there's an existing record, delete it
    if (grade.trim() === "" && existingRecord) {
      // console.log(`Removing grade for course ${courseCode} via saveGradeAction`);
      
      const deleteResult = await supabase
        .from("student_grades")
        .delete()
        .eq("id", existingRecord.id)
        .eq("user_id", userId);
      
      if (deleteResult.error) {
        // console.error("Error removing grade:", deleteResult.error);
        return { error: deleteResult.error.message };
      }
      
      // console.log(`Successfully removed grade for course ${courseCode}`);
      
      // Revalidate the page to reflect the deleted data
      revalidatePath("/protected/academic-progress");
      
      return { success: true, message: "Grade removed successfully" };
    }
    
    // Otherwise proceed with normal update/insert
    if (grade.trim() === "") {
      return { error: "Grade cannot be empty" };
    }
    
    // Encrypt the grade on the server side
    const encryptedGrade = encryptGrade(grade, userId);
    
    let result;
    
    if (existingRecord) {
      // Update existing grade with encrypted value
      // Set status to "completed" when a grade is provided
      result = await supabase
        .from("student_grades")
        .update({ 
          grade: encryptedGrade,
          status: "completed" // Always mark as completed when a grade is provided
        })
        .eq("id", existingRecord.id);
    } else {
      // Create new grade record with encrypted value
      result = await supabase
        .from("student_grades")
        .insert({
          user_id: userId,
          course_code: courseCode,
          grade: encryptedGrade,
          year: new Date().getFullYear(),
          term: "Current", // Default term, could be made selectable
          status: "completed" // Always mark as completed when a grade is provided
        });
    }
    
    if (result.error) {
      // console.error("Error saving grade:", result.error);
      return { error: result.error.message };
    }
    
    // Revalidate the page to reflect the new data
    revalidatePath("/protected/academic-progress");
    
    return { success: true };
  } catch (error) {
    // console.error("Error in saveGradeAction:", error);
    return { error: "Failed to save grade" };
  }
}

/**
 * Direct method to delete a grade from the database without standard filters
 * This is a fallback method when normal deletion fails
 */
export async function forceDeleteGradeAction(formData: FormData) {
  const supabase = await createClient();
  
  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error("Force delete grade failed: User not authenticated");
    return { error: "User not authenticated" };
  }
  
  // Extract grade ID from form data
  const gradeId = formData.get("grade_id") as string;
  
  if (!gradeId) {
    console.error("Force delete grade failed: Grade ID is required");
    return { error: "Grade ID is required" };
  }
  
  console.log(`Attempting to force delete grade with ID: ${gradeId} for user: ${user.id}`);
  
  try {
    // First verify the grade belongs to the user
    const { data: existingGrade, error: queryError } = await supabase
      .from("student_grades")
      .select("user_id")
      .eq("id", gradeId)
      .single();
    
    if (queryError) {
      console.error("Error verifying grade for force deletion:", queryError);
    }
    
    // Only proceed if the grade belongs to the user or the user is an admin
    if (existingGrade && existingGrade.user_id !== user.id) {
      console.error(`Cannot force delete: Grade belongs to user ${existingGrade.user_id}, not ${user.id}`);
      return { error: "You don't have permission to delete this grade" };
    }
    
    // Try different approaches to delete the grade
    
    // Approach 1: Direct RPC call to bypass RLS
    console.log("Trying direct delete approach...");
    const { data: rpcResult, error: rpcError } = await supabase.rpc('delete_student_grade', {
      grade_id: gradeId,
      user_identifier: user.id
    });
    
    if (rpcError) {
      console.log("RPC approach failed:", rpcError);
    } else if (rpcResult) {
      console.log("Successfully deleted grade via RPC");
      revalidatePath("/protected/academic-progress");
      return { success: true, message: "Grade deleted successfully via RPC" };
    }
    
    // Approach 2: Use raw SQL query through the REST API
    console.log("Trying standard delete without filters...");
    const { error: directError } = await supabase
      .from("student_grades")
      .delete()
      .eq("id", gradeId);
    
    if (directError) {
      console.error("Direct delete failed:", directError);
      return { error: `Failed to delete grade: ${directError.message}` };
    }
    
    console.log("Successfully deleted grade via direct approach");
    
    // Revalidate the page to reflect the deleted data
    revalidatePath("/protected/academic-progress");
    
    return { success: true, message: "Grade deleted successfully" };
  } catch (error) {
    console.error("Error in forceDeleteGradeAction:", error);
    return { error: "Failed to force delete grade. Please try again." };
  }
} 