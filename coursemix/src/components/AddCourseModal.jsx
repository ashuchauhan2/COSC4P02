import { useState } from 'react';

const AddCourseModal = ({ isOpen, onClose, onSubmit, year }) => {
  const [formData, setFormData] = useState({
    courseCode: '',
    grade: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData.courseCode, year, formData.grade ? parseInt(formData.grade) : null);
    setFormData({ courseCode: '', grade: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add Course</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700">
                Course Code
              </label>
              <input
                type="text"
                id="courseCode"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                Grade (optional)
              </label>
              <input
                type="number"
                id="grade"
                min="0"
                max="100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Add Course
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCourseModal; 