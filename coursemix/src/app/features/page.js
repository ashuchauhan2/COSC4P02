export default function FeaturesPage() {
  return (
    <main className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Our Features</h1>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Course Planning */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-4xl mb-4">📅</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Smart Course Planning</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">✓</span>
                Intelligent course recommendations based on your program
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">✓</span>
                Automatic prerequisite checking
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">✓</span>
                Conflict-free schedule generation
              </li>
            </ul>
          </div>

          {/* Progress Tracking */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Progress Tracking</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">✓</span>
                Real-time degree progress monitoring
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">✓</span>
                Credit requirement tracking
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">✓</span>
                Graduation timeline projections
              </li>
            </ul>
          </div>

          {/* Study Resources */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Study Resources</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">✓</span>
                Course syllabus access
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">✓</span>
                Important deadlines tracking
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">✓</span>
                Study schedule planning
              </li>
            </ul>
          </div>

          {/* Personalization */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-4xl mb-4">⚡</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Personalization</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">✓</span>
                Customizable study preferences
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">✓</span>
                Flexible schedule optimization
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">✓</span>
                Personal academic goals tracking
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 max-w-4xl mx-auto rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Coming Soon
          </h2>
          <div className="flex justify-center">
            <div className="p-4 border border-gray-200 rounded-lg max-w-md w-full text-center">
              <h3 className="text-lg font-semibold text-teal-600 mb-2">Expanded Programs</h3>
              <p className="text-gray-600">More programs outside of Computer Science!</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 