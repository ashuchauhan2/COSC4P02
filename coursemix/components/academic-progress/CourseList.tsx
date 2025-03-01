'use client';

import { useState } from 'react';
import CourseCard from "./CourseCard";

interface Course {
  id: string;
  program_id: number;
  year: number;
  course_code: string;
  credit_weight: number;
  requirement_type: string;
  min_grade?: number;
}

interface StudentGrade {
  id: string;
  user_id: string;
  course_code: string;
  requirement_id?: string;
  grade: string;
  term: string;
  year: number;
  status: string;
  created_at: string;
  updated_at: string;
}

type CourseListProps = {
  courses: Course[];
  grades: StudentGrade[];
  decryptedGrades: { [id: string]: string };
  userId: string;
};

export default function CourseList({ courses, grades, decryptedGrades, userId }: CourseListProps) {
  // Organize courses by year
  const coursesByYear = courses.reduce<{ [year: number]: Course[] }>(
    (acc, course) => {
      const year = course.year || 1;
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(course);
      return acc;
    },
    {}
  );

  // Find a grade for a specific requirement
  const findGradeForRequirement = (requirementId: string) => {
    return grades.find(grade => grade.requirement_id === requirementId);
  };

  const years = Object.keys(coursesByYear)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      {years.map((year) => (
        <div key={year} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Year {year}</h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {coursesByYear[year].map((course) => {
              // Find grade for this specific requirement
              const gradeRecord = findGradeForRequirement(course.id);
              const gradeDisplay = gradeRecord ? decryptedGrades[gradeRecord.id] : '';
              
              return (
                <CourseCard
                  key={course.id}
                  courseCode={course.course_code}
                  creditWeight={course.credit_weight}
                  minGrade={course.min_grade?.toString()}
                  requirementType={course.requirement_type}
                  existingGrade={gradeDisplay}
                  userId={userId}
                  gradeId={gradeRecord?.id}
                  requirementId={course.id}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}