"use client";

import Link from "next/link";

export default function TestimonialsPage() {
  const testimonials = [
    {
      quote:
        "Course Mix's intuitive interface made it easy to plan my courses around my part-time job. The schedule visualization helped me maintain a healthy work-study balance.",
      author: "Olaoluwa",
      program: "Computer Science",
      year: "4th Year",
    },
    {
      quote:
        "As a professor, I've seen students struggle with course selection. Course Mix provides the guidance students need to make informed decisions about their academic journey.",
      author: "Naser",
      program: "Professor of Computer Science",
      year: "Faculty",
    },
    {
      quote:
        "The prerequisite checker is a game-changer. It helped me understand the course dependencies and plan my degree path more effectively.",
      author: "Anonymous",
      program: "Computer Science",
      year: "3rd Year",
    },
    {
      quote:
        "I was able to plan my entire degree path from first year to graduation. The visual course map made it easy to see how prerequisites connected.",
      author: "Jerome",
      program: "Computer Science",
      year: "4th Year",
    },
    {
      quote:
        "Course Mix helped me organize my courses so I could complete my AI concentration efficiently. The planning tools are invaluable for specializations.",
      author: "Avi",
      program: "Computer Science",
      year: "4th Year",
    },
    {
      quote:
        "Being a co-op student, I needed to plan around my work terms. Course Mix made it simple to adjust my academic schedule while staying on track.",
      author: "Russel",
      program: "Computer Science",
      year: "3rd Year",
    },
    {
      quote:
        "I like being able to have an academic advising alternative available online 24/7, this is very convenient and allows me to take true ownership of my academic journey.",
      author: "Ashu",
      program: "Computer Science",
      year: "4th Year",
    },
    {
      quote:
        "Course Mix helped me understand Brock's course system quickly. The prerequisite checker is especially helpful for staying on track.",
      author: "Oreoluwa",
      program: "Computer Science",
      year: "4th Year",
    },
    {
      quote:
        "I love how Course Mix helps me plan ahead. Being able to see all available course options and their schedules in advance makes registration stress-free.",
      author: "Fatima",
      program: "Computer Science",
      year: "3rd Year",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Student Testimonials
        </h1>
        <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
          Hear from students who have transformed their academic planning
          experience with Course Mix.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-teal-500/30 transition-all duration-200"
            >
              <div className="space-y-4">
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-teal-600 font-medium">
                    {testimonial.author}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {testimonial.program} • {testimonial.year}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Ready to Join Them?
          </h2>
          <Link href="/register">
            <button className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-4 px-8 rounded-md text-lg transition-all duration-200 shadow-md hover:shadow-lg">
              Start Your Journey
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
