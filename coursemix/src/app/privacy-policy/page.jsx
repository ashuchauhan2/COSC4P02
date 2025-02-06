"use client"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Privacy Policy</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Introduction</h2>
            <p className="text-gray-600">
              Course Mix ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our academic planning service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Information We Collect</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Brock University email address</li>
              <li>Academic information (courses, credits, program details)</li>
              <li>Course preferences and planning data</li>
              <li>Usage information and interaction with our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Provide personalized course planning services</li>
              <li>Improve and optimize our platform</li>
              <li>Send important notifications about your account</li>
              <li>Analyze usage patterns to enhance user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate security measures to protect your personal information. Your data is stored securely using Supabase&apos;s encrypted database systems, and we regularly review our security practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Third-Party Services</h2>
            <p className="text-gray-600">
              We use Supabase for authentication and data storage. Their privacy practices and security measures are subject to their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Rights</h2>
            <p className="text-gray-600">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-2">
              <li>Access your personal information</li>
              <li>Request correction of your data</li>
              <li>Request deletion of your account</li>
              <li>Opt-out of non-essential communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us at privacy@coursemix.com
            </p>
          </section>

          <section className="text-sm text-gray-500">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </section>
        </div>
      </div>
    </div>
  );
} 