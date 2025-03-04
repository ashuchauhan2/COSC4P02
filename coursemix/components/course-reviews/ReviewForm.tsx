import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface ReviewFormProps {
  courseId: string;
}

export default function ReviewForm({ courseId }: ReviewFormProps) {
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("User not authenticated");
      return;
    }

    const { error } = await supabase
      .from("course_reviews")
      .insert({
        user_id: user.id,
        course_id: courseId,
        review,
        rating,
      });

    if (error) {
      setError("Failed to submit review");
    } else {
      setSuccess("Review submitted successfully");
      setReview("");
      setRating(0);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Write your review"
        required
      />
      <input
        type="number"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        min="1"
        max="5"
        required
      />
      <button type="submit">Submit Review</button>
      {error && <p>{error}</p>}
      {success && <p>{success}</p>}
    </form>
  );
}