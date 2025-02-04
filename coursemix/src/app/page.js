import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="bg-sky-100 min-h-screen">

      <div className=" bg-gradient-to-b from-[rgba(0,118,191,0.55)] via-[rgba(0,113,184,0.53)] to-[rgba(0,55,89,0.3)] py-40"> {/* Hero section */}
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 leading-tight mb-4">
            Your Personal Academic Advisor
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Revolutionizing academic advising and empowering students through personalized, data-driven solutions.
          </p>
          <Link href="/register">
            <button className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg text-lg">
              Get Started
            </button>
          </Link>
        </div>
      </div> {/* End of hero div */}

      
      {/* Features */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
              {/* Feature 1 */}
              <div className="bg-gray-900 text-white p-6 rounded-xl flex flex-col items-center text-center">
                  <span className="text-2xl">📅</span>
                  <h3 className="font-semibold text-lg mt-2">Personalized Course Planning</h3>
                  <p className="text-sm mt-1">
                    Create optimized course schedules tailored to your unique preferences and requirements.
                  </p>
              </div>
              {/* Feature 2 */}
              <div className="bg-gray-900 text-white p-6 rounded-xl flex flex-col items-center text-center">
                  <span className="text-2xl">🔧</span>
                  <h3 className="font-semibold text-lg mt-2">Dynamic Course Adjustment</h3>
                  <p className="text-sm mt-1">
                    Adapt your academic plans as needed while staying on track for graduation.
                  </p>
              </div>
              {/* Feature 3 */}
              <div className="bg-gray-900 text-white p-6 rounded-xl flex flex-col items-center text-center">
                  <span className="text-2xl">📊</span>
                  <h3 className="font-semibold text-lg mt-2">Course Insights</h3>
                  <p className="text-sm mt-1">
                    Access comprehensive course data including schedules, failure rates, and peer reviews.
                  </p>
              </div>
              {/* Feature 4 */}
              <div className="bg-gray-900 text-white p-6 rounded-xl flex flex-col items-center text-center">
                  <span className="text-2xl">💬</span>
                  <h3 className="font-semibold text-lg mt-2">Community Feedback</h3>
                  <p className="text-sm mt-1">
                    Discuss and rate courses with peers to discover efficient course combinations.
                  </p>
              </div>
            </div>
        </div>
      </section>
      
      {/* Student Testimony */}
      <div className="bg-gradient-to-b from-[rgba(0,118,191,0.55)] via-[rgba(0,113,184,0.53)] to-[rgba(0,55,89,0.3)] py-20">
        <div className="container mx-auto text-center max-w-3xl px-4">
          <h1 className="text-5xl font-bold text-gray-800 leading-tight mb-4">
            Student Testimonies
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            As a first-year student, I struggled with academic advising. Course Mix would have helped me avoid overwhelming course loads and better plan my academic journey.
          </p>
          <p className='text-xl text-gray-600 mb-8'>-Computer Science Student</p>
        </div>
      </div> 

      {/* Final Push */}
      <div className='bg-white py-20'>
        <div className='container mx-auto text-center'>
          <h1 className='text-4xl font-bold text-black'>Ready to Transform Your Academic Journey</h1>
          <p className='text-xl text-gray-600 mb-8 pt-4'>Join Course Mix today and revolutionize your academic experience.</p>
          <Link href="/register">
            <button className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg text-lg">
              Start Planning now
            </button>
          </Link>
        </div>
      </div>

      


    </main>
  );
}