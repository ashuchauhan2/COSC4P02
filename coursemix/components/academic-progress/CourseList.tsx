import CourseCard from "./CourseCard";

interface Course {
  course_code: string;
  credit_weight: number;
  min_grade?: string;
  requirement_type?: string;
  year: number;
}

interface StudentGrade {
  id: string;
  user_id: string;
  course_code: string;
  grade: string;
  year: number;
  term: string;
}

interface CourseListProps {
  courses: Course[];
  grades: StudentGrade[];
  decryptedGrades: { [id: string]: string };
  userId: string;
}

export default function CourseList({
  courses,
  grades,
  decryptedGrades,
  userId,
}: CourseListProps) {
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

  // Create a mapping of course codes to their grades
  const courseGrades: { [courseCode: string]: string } = {};
  // Create a mapping of course codes to their grade IDs
  const courseGradeIds: { [courseCode: string]: string } = {};
  
  grades.forEach((grade) => {
    const decryptedGrade = decryptedGrades[grade.id];
    if (decryptedGrade) {
      courseGrades[grade.course_code] = decryptedGrade;
      courseGradeIds[grade.course_code] = grade.id;
    }
  });

  const years = Object.keys(coursesByYear)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      {years.map((year) => (
        <div key={year} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Year {year}</h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {coursesByYear[year].map((course) => (
              <CourseCard
                key={course.course_code}
                courseCode={course.course_code}
                creditWeight={course.credit_weight}
                minGrade={course.min_grade}
                requirementType={course.requirement_type}
                existingGrade={courseGrades[course.course_code]}
                gradeId={courseGradeIds[course.course_code]}
                userId={userId}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 