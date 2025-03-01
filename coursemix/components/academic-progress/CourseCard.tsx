"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { saveGradeAction, deleteGradeAction, forceDeleteGradeAction, toggleCourseStatusAction } from "@/app/academic-progress-actions";
import { useRouter } from "next/navigation";
import { Plus, Minus } from "lucide-react";

interface CourseCardProps {
  courseCode: string;
  creditWeight: number;
  minGrade?: string;
  requirementType?: string;
  requirementId: string;
  existingGrade?: string;
  userId: string;
  gradeId?: string;
  status?: string;
}

export default function CourseCard({
  courseCode,
  creditWeight,
  minGrade,
  requirementType,
  requirementId,
  existingGrade,
  userId,
  gradeId,
  status,
}: CourseCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [grade, setGrade] = useState(existingGrade || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasGrade, setHasGrade] = useState(!!existingGrade);
  const [isInProgress, setIsInProgress] = useState(status === "in-progress");
  const router = useRouter();
  
  // Update local state when props change
  useEffect(() => {
    setGrade(existingGrade || "");
    setHasGrade(!!existingGrade);
    setIsInProgress(status === "in-progress");
  }, [existingGrade, status]);

  const validateGrade = (gradeValue: string): boolean => {
    // Handle numeric grades
    const numericGrade = parseFloat(gradeValue);
    if (!isNaN(numericGrade)) {
      return numericGrade >= 0 && numericGrade <= 100;
    }
    
    // Handle letter grades (always valid since they're predefined)
    const validLetterGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
    return validLetterGrades.includes(gradeValue.toUpperCase());
  };

  const handleSaveGrade = async () => {
    if (!grade.trim()) return;
    
    // Validate the grade before saving
    if (!validateGrade(grade)) {
      toast.error("Please enter a valid grade (0-100 for numeric grades)");
      return;
    }

    // Validate requirementId is present
    if (!requirementId) {
      toast.error("Cannot save grade: Missing requirement ID");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use the server action to save the grade with requirementId
      const result = await saveGradeAction(courseCode, grade, userId, requirementId);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Grade saved successfully");
        setIsEditing(false);
        setHasGrade(true);
        // Refresh the page data
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving grade:", error);
      toast.error("Failed to save grade");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGrade = async () => {
    if (!confirm("Are you sure you want to delete this grade?")) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let result;
      
      if (!gradeId) {
        toast.error("Cannot delete grade: missing ID");
        setIsSubmitting(false);
        return;
      }
      
      console.log(`Attempting to delete grade with ID: ${gradeId}`);
      
      // Primary method: use deleteGradeAction with the grade ID
      const formData = new FormData();
      formData.append('grade_id', gradeId);
      
      result = await deleteGradeAction(formData);
      
      // If the primary method fails, try the force delete method
      if ('error' in result && result.error) {
        console.log("Primary delete method failed, trying force delete method:", result.error);
        
        // Force delete method
        const forceFormData = new FormData();
        forceFormData.append('grade_id', gradeId);
        result = await forceDeleteGradeAction(forceFormData);
        
        // If force delete also fails, try the saveGradeAction with empty string
        if ('error' in result && result.error) {
          console.log("Force delete method failed, trying empty grade method:", result.error);
          
          // Final fallback: use saveGradeAction with empty string to clear the grade
          // Pass the requirementId to ensure we're targeting the specific course requirement
          result = await saveGradeAction(courseCode, "", userId, requirementId);
        }
      }
      
      if ('error' in result && result.error) {
        toast.error(result.error);
      } else {
        // Update local state immediately
        setGrade("");
        setHasGrade(false);
        
        toast.success("Grade deleted successfully");
        
        // Force a complete refresh to ensure data is reloaded from the server
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error("Error deleting grade:", error);
      toast.error("Failed to delete grade");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleInProgress = async () => {
    if (!requirementId) {
      toast.error("Cannot update status: Missing requirement ID");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await toggleCourseStatusAction(courseCode, userId, requirementId);
      
      if ('error' in result && result.error) {
        toast.error(result.error);
      } else {
        // Use the status from the server response if available, otherwise toggle the current state
        const newStatus = result.isInProgress !== undefined ? Boolean(result.isInProgress) : !isInProgress;
        setIsInProgress(newStatus);
        
        if ('message' in result) {
          toast.success(result.message);
        } else {
          toast.success(newStatus 
            ? `${courseCode} added to in-progress courses` 
            : `${courseCode} removed from in-progress courses`);
        }
        
        // Refresh the page data
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating course status:", error);
      toast.error("Failed to update course status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = () => {
    if (isInProgress) return "border-blue-400 bg-blue-50";
    if (!existingGrade) return "border-gray-200 bg-white";
    
    const gradeToCheck = existingGrade;
    const numericGrade = parseFloat(gradeToCheck);
    
    // Convert letter grades to numeric values for comparison
    const getNumericValue = (grade: string) => {
      const letterGrades: { [key: string]: number } = {
        'A+': 90, 'A': 85, 'A-': 80,
        'B+': 77, 'B': 73, 'B-': 70,
        'C+': 67, 'C': 63, 'C-': 60,
        'D+': 57, 'D': 53, 'D-': 50,
        'F': 0
      };
      return letterGrades[grade.toUpperCase()] || 0;
    };

    // If there's a minimum grade requirement
    if (minGrade) {
      const studentGradeValue = isNaN(numericGrade) ? getNumericValue(gradeToCheck) : numericGrade;
      const minGradeValue = isNaN(parseFloat(minGrade)) ? getNumericValue(minGrade) : parseFloat(minGrade);
      
      return studentGradeValue >= minGradeValue 
        ? "border-green-400 bg-green-50" 
        : "border-red-400 bg-red-50";
    }
    
    // If no minimum grade requirement, check if passing (>= 50)
    if (isNaN(numericGrade)) {
      // For letter grades
      const numericValue = getNumericValue(gradeToCheck);
      return numericValue >= 50 
        ? "border-green-400 bg-green-50" 
        : "border-red-400 bg-red-50";
    } else {
      // For numeric grades
      return numericGrade >= 50 
        ? "border-green-400 bg-green-50" 
        : "border-red-400 bg-red-50";
    }
  };

  return (
    <div className={`rounded-lg shadow-md p-4 border ${getStatusColor()} transition-all hover:shadow-lg`}
        data-requirement-id={requirementId}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800">{courseCode}</h3>
              {!isInProgress && !hasGrade && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleInProgress}
                  disabled={isSubmitting}
                  className="h-6 w-6 text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-0.5"
                  title="Add to Progress"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              {isInProgress && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleInProgress}
                  disabled={isSubmitting}
                  className="h-6 w-6 text-red-600 hover:text-red-800 hover:bg-red-50 p-0.5"
                  title="Remove from Progress"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">{creditWeight} credits</span>
              {minGrade && (
                <span className="ml-2">
                  • Min. grade: <span className="font-medium">{minGrade}</span>
                </span>
              )}
              
              {requirementType && (
                <div className="mt-1">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                    {requirementType}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Show grade value in top right */}
          {hasGrade && existingGrade && !isEditing && (
            <div className="text-xl font-bold">
              {existingGrade}
            </div>
          )}
        </div>

        {/* Grade editing and buttons at bottom */}
        <div className="flex justify-end mt-4">
          {isEditing ? (
            <div className="flex flex-col items-end gap-2">
              <Input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Enter grade"
                className="w-24 text-right"
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSaveGrade}
                  disabled={isSubmitting}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              {hasGrade && existingGrade ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                  {gradeId && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200"
                      onClick={handleDeleteGrade}
                      disabled={isSubmitting}
                    >
                      Delete
                    </Button>
                  )}
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Add Grade
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 