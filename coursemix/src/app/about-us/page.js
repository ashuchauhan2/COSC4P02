export default function AboutPage() {
  return (
    <main className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">About Course Mix</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              Course Mix was created with a singular vision: to revolutionize the way students plan their academic journey. 
              We understand the challenges students face when planning their course schedules, and we're here to make that 
              process simpler, smarter, and more efficient.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Who We Are</h2>
            <p className="text-gray-600 mb-6">
              We are The Mixers. We are a group formed during our time in COSC 4P02 where we were tasked with creating a software project. This is the project we chose to develop.
              We are all students that struggled at one point in our academic journey with planning how we wished to complete our degrees, and we hope this tool helps students gain clarity
              in how to progress through their degree!
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-teal-600 mb-2">Student-Centric</h3>
                <p className="text-gray-600">Putting students' needs first in every feature and decision we make.</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-teal-600 mb-2">Data-Driven</h3>
                <p className="text-gray-600">Using real academic data to provide intelligent course planning solutions.</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-teal-600 mb-2">Innovation</h3>
                <p className="text-gray-600">Continuously improving our platform with cutting-edge technology.</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-teal-600 mb-2">Accessibility</h3>
                <p className="text-gray-600">Ensuring our platform is accessible to every Brock University student.</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-teal-600 mb-2">Simplicity</h3>
                <p className="text-gray-600">Making complex course planning simple and intuitive for all users.</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-teal-600 mb-2">Excellence</h3>
                <p className="text-gray-600">Maintaining high standards in our service and user experience.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 