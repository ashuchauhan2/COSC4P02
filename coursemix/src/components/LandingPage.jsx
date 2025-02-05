import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 animate-gradient"></div>
        <div className="relative py-20 lg:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600">
              Your Personal Academic Advisor
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Revolutionizing academic advising and empowering students through personalized, data-driven solutions.
            </p>
            <Link href="/register">
              <button className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-4 px-8 rounded-md text-lg transition-all duration-200 shadow-md hover:shadow-lg">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 px-4 sm:px-6">
            {/* Feature cards */}
            {[
              {
                icon: "📅",
                title: "Personalized Course Planning",
                description: "Create optimized course schedules tailored to your unique preferences and requirements."
              },
              {
                icon: "🔧",
                title: "Dynamic Course Adjustment",
                description: "Adapt your academic plans as needed while staying on track for graduation."
              },
              {
                icon: "📊",
                title: "Course Insights",
                description: "Access comprehensive course data including schedules, failure rates, and peer reviews."
              },
              {
                icon: "💬",
                title: "Community Feedback",
                description: "Discuss and rate courses with peers to discover efficient course combinations."
              }
            ].map((feature, index) => (
              <Link href="/dashboard" key={index}>
                <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 hover:border-teal-500/30 transition-all duration-200 hover:shadow-md group">
                  <span className="text-4xl mb-4 block">{feature.icon}</span>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-teal-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl font-bold mb-12 text-gray-800">
            Student Testimonials
          </h2>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xl text-gray-600 italic mb-6">
              "As a first-year student, I struggled with academic advising. Course Mix would have helped me avoid overwhelming course loads and better plan my academic journey."
            </p>
            <p className="text-lg text-teal-600 font-medium">- Computer Science Student</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">
            Ready to Transform Your Academic Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join Course Mix today and revolutionize your academic experience.
          </p>
          <Link href="/register">
            <button className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-4 px-8 rounded-md text-lg transition-all duration-200 shadow-md hover:shadow-lg">
              Start Planning Now
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
} 