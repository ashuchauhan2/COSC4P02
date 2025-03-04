import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ReviewFormProps {
  courseId: string;
}

export default function ReviewForm({ courseId }: ReviewFormProps) {
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);

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

    setIsSubmitting(false);
  };

  return (
    <div className="rounded-lg shadow-sm p-4 border border-gray-200 bg-white transition-all hover:shadow-md group">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-2">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your review"
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <Input
            type="number"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            min="1"
            max="5"
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors shadow-sm hover:shadow-md"
          >
            Submit Review
          </Button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </form>
    </div>
  );
}