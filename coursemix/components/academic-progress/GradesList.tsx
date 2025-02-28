'use client';

import { useState } from 'react';
import { numericToLetterGrade, calculateGPA } from '@/utils/grade-utils';
import { updateGradeAction, deleteGradeAction, forceDeleteGradeAction } from '@/app/academic-progress-actions';
import { useRouter } from 'next/navigation';

type TermType = 'Fall' | 'Winter' | 'Spring' | 'Summer';

interface Grade {
  id: string;
  course_code: string;
  grade: string;
  term: string;
  year: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface GroupedGrades {
  [year: number]: {
    [term in TermType]?: Grade[];
  };
}

interface GradesListProps {
  grades: Grade[];
  decryptedGrades: { [id: string]: string };
}

export default function GradesList({ grades, decryptedGrades }: GradesListProps) {
  const router = useRouter();
  const [editGradeId, setEditGradeId] = useState<string | null>(null);
  const [editGradeValue, setEditGradeValue] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Group grades by year and term
  const groupedGrades: GroupedGrades = {};
  
  grades.forEach(grade => {
    if (!groupedGrades[grade.year]) {
      groupedGrades[grade.year] = {};
    }
    
    if (!groupedGrades[grade.year][grade.term as TermType]) {
      groupedGrades[grade.year][grade.term as TermType] = [];
    }
    
    // Use type assertion to fix TypeScript error
    const termGrades = groupedGrades[grade.year][grade.term as TermType];
    if (termGrades) {
      termGrades.push(grade);
    }
  });
  
  // Sort years in descending order (most recent first)
  const sortedYears = Object.keys(groupedGrades)
    .map(Number)
    .sort((a, b) => b - a);
  
  // Calculate GPA for each term and year
  const termGPAs: { [key: string]: number } = {};
  const yearGPAs: { [key: number]: number } = {};
  const allGrades: string[] = [];
  
  // Process each grade for GPA calculation
  grades.forEach(grade => {
    const decryptedGrade = decryptedGrades[grade.id];
    
    // Only include completed courses with valid grades
    if (grade.status === 'completed' && decryptedGrade) {
      // Create term key in format "YEAR-TERM"
      const termKey = `${grade.year}-${grade.term}`;
      
      // Convert numeric grades to letter grades if needed
      let letterGrade = decryptedGrade;
      if (!isNaN(Number(decryptedGrade))) {
        letterGrade = numericToLetterGrade(Number(decryptedGrade));
      }
      
      // Add to all grades
      allGrades.push(letterGrade);
      
      // Add to term-specific grades
      if (!termGPAs[termKey]) {
        termGPAs[termKey] = calculateGPA([letterGrade]);
      } else {
        const existingGrades = termGPAs[termKey] * (Object.keys(termGPAs).length);
        termGPAs[termKey] = (existingGrades + calculateGPA([letterGrade])) / (Object.keys(termGPAs).length + 1);
      }
      
      // Add to year-specific grades
      if (!yearGPAs[grade.year]) {
        yearGPAs[grade.year] = calculateGPA([letterGrade]);
      } else {
        const existingGrades = yearGPAs[grade.year] * (Object.keys(yearGPAs).length);
        yearGPAs[grade.year] = (existingGrades + calculateGPA([letterGrade])) / (Object.keys(yearGPAs).length + 1);
      }
    }
  });
  
  // Calculate overall GPA
  const overallGPA = calculateGPA(allGrades);
  
  // Start edit handler
  const handleStartEdit = (grade: Grade) => {
    setEditGradeId(grade.id);
    setEditGradeValue(decryptedGrades[grade.id] || '');
    setEditStatus(grade.status);
  };
  
  // Cancel edit handler
  const handleCancelEdit = () => {
    setEditGradeId(null);
    setEditGradeValue('');
    setEditStatus('');
    setError(null);
  };
  
  // Save edit handler
  const handleSaveEdit = async () => {
    if (!editGradeId) return;
    
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('grade_id', editGradeId);
    formData.append('grade', editGradeValue);
    formData.append('status', editStatus);
    
    const result = await updateGradeAction(formData);
    
    setIsSubmitting(false);
    
    if ('error' in result && result.error) {
      setError(result.error);
    } else {
      setSuccess('Grade updated successfully');
      setEditGradeId(null);
      setEditGradeValue('');
      setEditStatus('');
      
      // Refresh page data
      router.refresh();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    }
  };
  
  // Delete handler
  const handleDelete = async (gradeId: string) => {
    if (!confirm('Are you sure you want to delete this grade?')) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('grade_id', gradeId);
    
    try {
      console.log(`Attempting to delete grade with ID: ${gradeId}`);
      
      // Try the standard delete method first
      let result = await deleteGradeAction(formData);
      
      // If that fails, try the force delete method
      if ('error' in result && result.error) {
        console.log("Standard delete failed, trying force delete:", result.error);
        result = await forceDeleteGradeAction(formData);
      }
      
      setIsSubmitting(false);
      
      if ('error' in result && result.error) {
        console.error("All delete methods failed:", result.error);
        setError(result.error);
      } else {
        setSuccess('Grade deleted successfully');
        
        // Force a complete refresh after a short delay to ensure UI updates
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error('Error deleting grade:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Status color mapping
  const statusColors: { [key: string]: string } = {
    'completed': 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800',
  };
  
  // Calculate progress towards degree (40 courses total)
  const completedCourses = grades.filter(g => g.status === 'completed').length;
  const inProgressCourses = grades.filter(g => g.status === 'in-progress').length;
  const totalCourses = completedCourses + inProgressCourses;
  const remainingCourses = Math.max(0, 20 - totalCourses);
  
  // Calculate percentage complete
  const percentComplete = Math.min(100, Math.round((completedCourses / 20) * 100));
  
  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
          {success}
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-md flex items-start">
        <div className="mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="text-sm">
            <strong>Privacy Protection:</strong> All grade data is encrypted end-to-end using AES-256 encryption. Only you can see your actual grades.
          </p>
        </div>
      </div>
      
      {/* Degree Progress Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Degree Progress</h2>
        
        <div className="flex items-center mb-4">
          <div className="w-full bg-gray-200 rounded-full h-4 mr-4">
            <div 
              className="bg-teal-600 h-4 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${percentComplete}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">{percentComplete}% Complete</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-teal-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-teal-700">Completed</h3>
            <p className="text-3xl font-bold text-teal-900">{completedCourses}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-700">In Progress</h3>
            <p className="text-3xl font-bold text-blue-900">{inProgressCourses}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700">Remaining</h3>
            <p className="text-3xl font-bold text-gray-900">{remainingCourses}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Overall GPA</h3>
            <p className={`text-3xl font-bold ${overallGPA >= 3.0 ? 'text-green-600' : overallGPA >= 2.0 ? 'text-blue-600' : 'text-red-600'}`}>
              {overallGPA.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Grades by Year */}
      {sortedYears.length > 0 &&
        sortedYears.map(year => {
          const yearHasGrades = ['Fall', 'Winter', 'Spring', 'Summer'].some(
            term => {
              const termGrades = groupedGrades[year][term as TermType];
              return termGrades && termGrades.length > 0;
            }
          );

          if (!yearHasGrades) return null;

          return (
            <div key={year} className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-6">
                {['Fall', 'Winter', 'Spring', 'Summer'].map(term => {
                  const termGrades = groupedGrades[year][term as TermType];
                  if (!termGrades || termGrades.length === 0) return null;
                  
                  const termKey = `${year}-${term}`;
                  
                  return (
                    <div key={term} className="border-t pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-medium text-gray-700">{term} Term</h3>
                        {termGPAs[termKey] && (
                          <div className="bg-gray-100 px-3 py-1 rounded-md">
                            <span className="text-sm text-gray-600">Term GPA: </span>
                            <span className={`font-medium ${termGPAs[termKey] >= 3.0 ? 'text-green-600' : termGPAs[termKey] >= 2.0 ? 'text-blue-600' : 'text-red-600'}`}>
                              {termGPAs[termKey].toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Course Code
                              </th>
                              <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Grade
                              </th>
                              <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {termGrades.map(grade => (
                              <tr key={grade.id}>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{grade.course_code}</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {editGradeId === grade.id ? (
                                    <input
                                      type="text"
                                      value={editGradeValue}
                                      onChange={(e) => setEditGradeValue(e.target.value)}
                                      className="w-24 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                                    />
                                  ) : (
                                    <div className="text-sm font-medium text-gray-900">
                                      {decryptedGrades[grade.id] || 'N/A'}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {editGradeId === grade.id ? (
                                    <select
                                      value={editStatus}
                                      onChange={(e) => setEditStatus(e.target.value)}
                                      className="w-32 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                                    >
                                      <option value="completed">Completed</option>
                                      <option value="in-progress">In Progress</option>
                                    </select>
                                  ) : (
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[grade.status] || 'bg-gray-100 text-gray-800'}`}>
                                      {grade.status.charAt(0).toUpperCase() + grade.status.slice(1)}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                  {editGradeId === grade.id ? (
                                    <div className="flex space-x-2 justify-end">
                                      <button
                                        onClick={handleSaveEdit}
                                        disabled={isSubmitting}
                                        className="text-teal-600 hover:text-teal-900"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={handleCancelEdit}
                                        disabled={isSubmitting}
                                        className="text-gray-600 hover:text-gray-900"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex space-x-2 justify-end">
                                      <button
                                        onClick={() => handleStartEdit(grade)}
                                        className="text-teal-600 hover:text-teal-900"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDelete(grade.id)}
                                        disabled={isSubmitting}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      }
    </div>
  );
} 