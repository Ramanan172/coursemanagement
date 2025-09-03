import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AddCourse from './AddCourse';
import EditCourse from './EditCourse';

const CourseList = () => {
  const { user, courseAPI, enrollmentAPI } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolling, setEnrolling] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseAPI.getCourses();
      setCourses(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseAPI.deleteCourse(id);
        setCourses(courses.filter(course => course._id !== id));
        setSuccess('Course deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrolling(prev => ({ ...prev, [courseId]: true }));
      await enrollmentAPI.enroll(courseId);
      await fetchCourses(); // Refresh courses to update enrollment status
      setSuccess('Successfully enrolled in course');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnrolling(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      setEnrolling(prev => ({ ...prev, [courseId]: true }));
      await enrollmentAPI.unenroll(courseId);
      await fetchCourses(); // Refresh courses to update enrollment status
      setSuccess('Successfully unenrolled from course');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnrolling(prev => ({ ...prev, [courseId]: false }));
    }
  };

  // Fixed isEnrolled function with null check
  const isEnrolled = (course) => {
    return user && course.enrolledStudents && course.enrolledStudents.includes(user._id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Course Management</h1>
        {user && user.role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Add New Course
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Instructor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enrollment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {course.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {course.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {course.instructor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {course.credits}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {course.enrollmentCount || 0} / {course.capacity || 30}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {user && user.role === 'admin' ? (
                    <>
                      <button
                        onClick={() => handleEdit(course)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </>
                  ) : user ? (
                    isEnrolled(course) ? (
                      <button
                        onClick={() => handleUnenroll(course._id)}
                        disabled={enrolling[course._id]}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {enrolling[course._id] ? 'Processing...' : 'Unenroll'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course._id)}
                        disabled={enrolling[course._id] || (course.enrollmentCount >= course.capacity)}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        {enrolling[course._id] 
                          ? 'Processing...' 
                          : (course.enrollmentCount >= course.capacity ? 'Full' : 'Enroll')
                        }
                      </button>
                    )
                  ) : (
                    <span className="text-gray-500">Login to enroll</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {courses.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No courses found. {user && user.role === 'admin' && 'Add your first course to get started.'}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddCourse
          onClose={() => setShowAddModal(false)}
          onCourseAdded={fetchCourses}
        />
      )}

      {showEditModal && selectedCourse && (
        <EditCourse
          course={selectedCourse}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCourse(null);
          }}
          onCourseUpdated={fetchCourses}
        />
      )}
    </div>
  );
};

export default CourseList;