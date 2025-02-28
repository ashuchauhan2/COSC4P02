import React from 'react';
import Image from 'next/image';
import { 
  FaCode, 
  FaTerminal, 
  FaClipboardList, 
  FaUsers, 
  FaPencilAlt, 
  FaUniversity 
} from 'react-icons/fa';
import { TeamMember } from '@/components/about-us';

export const metadata = {
  title: 'About Us | CourseMix',
  description: 'Learn about the team and mission behind CourseMix',
};

// Team members data
const teamMembers = [
  { name: 'Avi', role: 'Developer', Icon: FaCode },
  { name: 'Ashu', role: 'Developer', Icon: FaCode },
  { name: 'Fatima', role: 'Scrum Master', Icon: FaClipboardList },
  { name: 'Russell', role: 'Developer', Icon: FaCode },
  { name: 'Jerome', role: 'Developer', Icon: FaTerminal },
  { name: 'Olaoluwa', role: 'Product Owner', Icon: FaUsers },
  { name: 'Oreoluwa', role: 'Content Designer', Icon: FaPencilAlt },
  { name: 'Brendan', role: 'Stake Holder', Icon: FaUniversity },
  { name: 'Naser Ezzati-Jivan', role: 'Stake Holder', Icon: FaUniversity },
];

export default function AboutUsPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">About CourseMix</h1>
        <p className="text-lg text-gray-600">
          CourseMix is a modern course planning platform designed specifically for Brock University students.
          We're on a mission to simplify the academic journey by providing intelligent tools for course selection,
          scheduling, and degree planning.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Our Mission</h2>
        <p className="text-gray-600">
          Our mission is to empower students to make informed academic decisions by providing 
          comprehensive course data, peer insights, and personalized scheduling tools. We believe that 
          with the right information and planning tools, every student can optimize their learning path
          and achieve their academic goals efficiently.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Our Story</h2>
        <p className="text-gray-600">
          CourseMix began as a class project by a group of Brock University computer science students
          who experienced firsthand the challenges of course planning and registration. Frustrated by 
          the lack of modern tools to help navigate degree requirements and optimize course schedules,
          they set out to create a solution that would benefit the entire Brock community.
        </p>
        <p className="text-gray-600">
          What started as a simple course registration helper has evolved into a comprehensive academic
          planning platform with features designed to address the unique needs of Brock University students.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Meet The Team</h2>
        <p className="text-gray-600">
          CourseMix is developed by "The Mixers" - a passionate team of Brock University students and alumni
          committed to improving the academic experience for fellow students.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
          {teamMembers.map((member) => (
            <TeamMember
              key={member.name}
              name={member.name}
              role={member.role}
              Icon={member.Icon}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Student-Centered Design</h3>
            <p className="text-gray-600">
              Every feature we develop is based on real student needs and feedback.
            </p>
          </div>
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Data-Driven Insights</h3>
            <p className="text-gray-600">
              We provide accurate information to help you make informed decisions.
            </p>
          </div>
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Continuous Improvement</h3>
            <p className="text-gray-600">
              We're constantly enhancing our platform based on user feedback.
            </p>
          </div>
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Community Collaboration</h3>
            <p className="text-gray-600">
              We believe in the power of shared experiences and collective wisdom.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Contact Us</h2>
        <p className="text-gray-600">
          Have questions, feedback, or suggestions? We'd love to hear from you! Reach out to us at{' '}
          <a href="mailto:coursemixtroubleshoot@gmail.com" className="text-teal-600 hover:underline">
            coursemixtroubleshoot@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
} 