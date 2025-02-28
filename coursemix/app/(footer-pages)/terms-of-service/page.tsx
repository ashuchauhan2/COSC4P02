import React from 'react';

export const metadata = {
  title: 'Terms of Service | CourseMix',
  description: 'Terms and conditions for using the CourseMix platform',
};

export default function TermsOfServicePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
      <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">1. Acceptance of Terms</h2>
        <p className="text-gray-600">
          By accessing or using CourseMix, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
          If you do not agree with any of these terms, you are prohibited from using this service.
        </p>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">2. Use of Service</h2>
        <p className="text-gray-600">
          CourseMix provides a platform for Brock University students to plan their courses and academic journey. 
          You agree to use this service only for lawful purposes and in accordance with these Terms.
        </p>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">3. User Accounts</h2>
        <p className="text-gray-600">
          When you create an account with us, you must provide accurate and complete information. 
          You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
        </p>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">4. User Content</h2>
        <p className="text-gray-600">
          Users may post reviews, comments, and other content as long as it is not illegal, obscene, threatening, defamatory, 
          invasive of privacy, infringing on intellectual property rights, or otherwise injurious to third parties.
        </p>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">5. Limitation of Liability</h2>
        <p className="text-gray-600">
          CourseMix and its team shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from 
          your use of or inability to use the service.
        </p>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">6. Changes to Terms</h2>
        <p className="text-gray-600">
          We reserve the right to modify these terms at any time. We will provide notice of significant changes through the service.
          Your continued use of CourseMix after such modifications will constitute your acknowledgment of the modified terms.
        </p>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">7. Contact Information</h2>
        <p className="text-gray-600">
          For any questions regarding these Terms of Service, please contact us at coursemixtroubleshoot@gmail.com.
        </p>
      </section>
    </div>
  );
} 