import { createClient } from "@/utils/supabase/server";
import { useState, useEffect } from "react";
import { Course } from "@/types";
import ReviewForm from "@/components/course-reviews/ReviewForm";

// Main component for the Course Reviews Page
export default function CourseReviewsPage() {
  // State to hold the list of courses the user is enrolled in
  const [courses, setCourses] = useState<Course[]>([]);
  // State to manage the loading state
  const [loading, setLoading] = useState(true);

  // useEffect hook to fetch courses when the component mounts
  useEffect(() => {
    // Async function to fetch courses
    async function fetchCourses() {
      // Create a Supabase client instance
      const supabase = await createClient();
      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      // If no user is authenticated, return early
      if (!user) return;

      // Fetch the user's enrollments
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", user.id)
        .eq("status", "enrolled");

      // If enrollments are found, fetch the corresponding courses
      if (enrollments) {
        const courseIds = enrollments.map((enrollment: { course_id: string }) => enrollment.course_id);
        const { data: courses } = await supabase
          .from("courses")
          .select("*")
          .in("id", courseIds);
        // Update the state with the fetched courses
        if (courses) {
          setCourses(courses);
        }
      }
      // Set loading to false after fetching is complete
      setLoading(false);
    }

    // Call the fetchCourses function
    fetchCourses();
  }, []); // Empty dependency array means this runs once when the component mounts

  // If the data is still loading, display a loading message
  if (loading) return <p>Loading...</p>;

  // Render the list of courses and the review form for each course
  return (
    <div>
      <h1>Course Reviews</h1>
      {courses.map(course => (
        <div key={course.id}>
          <h2>{course.course_code}</h2>
          {/* Render the ReviewForm component for each course */}
          <ReviewForm courseId={course.id} />
        </div>
      ))}
    </div>
  );
}

