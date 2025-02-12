# CourseMix 📚

CourseMix is a modern web application designed to streamline the course registration process for students. It provides an intuitive interface for course selection, schedule planning, and profile management.

## 🌟 Features

- **User Authentication & Authorization**
  - Secure sign-in and registration system
  - Email verification for new accounts
  - Protected routes for authenticated users

- **Profile Management**
  - Customizable user profiles
  - New profile setup wizard for first-time users

- **Course Registration**
  - Interactive course selection interface
  - Real-time course availability updates
  - Visual timetable representation
  - Conflict detection for course schedules

- **Dashboard**
  - Personalized user dashboard
  - Overview of registered courses
  - Quick access to important features

## 🚀 Tech Stack

- **Frontend**
  - Next.js 15.1
  - React 19
  - Tailwind CSS
  - Shadcn UI Components
  - Lucide React Icons

- **Backend**
  - Next.js API Routes
  - Supabase (Authentication & Database)
  - Resend (Email Services)

- **Development Tools**
  - ESLint
  - PostCSS
  - Python Scripts for Data Management

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Python 3.x (for running data scripts)

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/coursemix.git
   cd coursemix
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   RESEND_API_KEY=your_resend_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

Ashu Chauhan – 7001571 <br>
Avi Patel – 6741961 <br>
Fatima Abourida - 7119490<br>
Jerome Uwaneme -7141270<br> 
Olaoluwa Akanji - 6908776 <br>
Oreoluwa Akanji - 6910483<br>
Russell Salacup – 7177884 <br>

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape CourseMix
- Special thanks to the open-source community for the amazing tools and libraries
