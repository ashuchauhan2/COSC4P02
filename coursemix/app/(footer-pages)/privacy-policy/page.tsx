import React from 'react';

export const metadata = {
  title: 'Privacy Policy | CourseMix',
  description: 'Privacy policy and data practices for the CourseMix platform',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">1. Introduction</h2>
        <p className="text-gray-600">
          At CourseMix, we are committed to protecting your privacy and ensuring the security of your personal information.
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
        </p>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">2. Information We Collect</h2>
        <p className="text-gray-600">
          We collect information that you provide directly to us when registering for an account, creating a profile, 
          or interacting with our platform. This may include:
        </p>
        <ul className="list-disc pl-6 text-gray-600 space-y-2">
          <li>Personal identification information (name, email address, student ID)</li>
          <li>Academic information (program, courses, grades)</li>
          <li>User preferences and settings</li>
          <li>Communication data when you contact us</li>
        </ul>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">3. How We Use Your Information</h2>
        <p className="text-gray-600">
          We use the information we collect to:
        </p>
        <ul className="list-disc pl-6 text-gray-600 space-y-2">
          <li>Provide, maintain, and improve our services</li>
          <li>Personalize your experience</li>
          <li>Process course registrations and academic planning</li>
          <li>Communicate with you about updates and features</li>
          <li>Monitor and analyze usage patterns and trends</li>
        </ul>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">4. Data Sharing and Disclosure</h2>
        <p className="text-gray-600">
          We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
          except as described in this Privacy Policy. We may share information with:
        </p>
        <ul className="list-disc pl-6 text-gray-600 space-y-2">
          <li>Service providers who assist us in operating our platform</li>
          <li>Educational institutions for verification purposes</li>
          <li>Legal authorities when required by law</li>
        </ul>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">5. Data Security</h2>
        <p className="text-gray-600">
          We implement appropriate technical and organizational measures to protect your personal information 
          against unauthorized access, alteration, disclosure, or destruction.
        </p>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">6. Your Rights</h2>
        <p className="text-gray-600">
          You have the right to access, correct, or delete your personal information at any time.
          You can manage your preferences through your account settings or by contacting us directly.
        </p>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">7. Changes to This Policy</h2>
        <p className="text-gray-600">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
          Privacy Policy on this page and updating the "Last updated" date.
        </p>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">8. Contact Us</h2>
        <p className="text-gray-600">
          If you have any questions about this Privacy Policy, please contact us at coursemixtroubleshoot@gmail.com.
        </p>
      </section>
    </div>
  );
} 