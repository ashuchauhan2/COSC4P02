import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid text-center grid-cols-1 md:text-left md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div>
            <Image 
              src="/CourseMixLogo.png" 
              alt="Course Mix Logo"
              width={150}
              height={50}
              className="mx-auto md:mx-0"
            />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about-us" className="hover:text-white">About Us</Link></li>
              <li><Link href="/features" className="hover:text-white">Features</Link></li>
              <li><Link href="/testimonials" className="hover:text-white">Testimonials</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/tos" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} The Mixers. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 