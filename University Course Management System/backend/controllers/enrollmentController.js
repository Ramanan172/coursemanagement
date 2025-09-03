const Course = require('../models/Course');
const asyncHandler = require('express-async-handler');

// @desc    Enroll in a course
// @route   POST /api/enroll/:courseId
// @access  Private
const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  
  // Initialize enrolledStudents array if it doesn't exist
  if (!course.enrolledStudents) {
    course.enrolledStudents = [];
  }
  
  // Check if already enrolled
  if (course.enrolledStudents.includes(req.user.id)) {
    res.status(400);
    throw new Error('Already enrolled in this course');
  }
  
  // Check if course is full
  if (course.enrolledStudents.length >= course.capacity) {
    res.status(400);
    throw new Error('Course is full');
  }
  
  // Add student to course
  course.enrolledStudents.push(req.user.id);
  await course.save();
  
  res.status(200).json({
    success: true,
    message: 'Successfully enrolled in course'
  });
});

// @desc    Unenroll from a course
// @route   DELETE /api/enroll/:courseId
// @access  Private
const unenrollFromCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  
  // Initialize enrolledStudents array if it doesn't exist
  if (!course.enrolledStudents) {
    course.enrolledStudents = [];
  }
  
  // Check if enrolled
  if (!course.enrolledStudents.includes(req.user.id)) {
    res.status(400);
    throw new Error('Not enrolled in this course');
  }
  
  // Remove student from course
  course.enrolledStudents = course.enrolledStudents.filter(
    studentId => studentId.toString() !== req.user.id
  );
  
  await course.save();
  
  res.status(200).json({
    success: true,
    message: 'Successfully unenrolled from course'
  });
});

// @desc    Get user's enrolled courses
// @route   GET /api/enroll/my-courses
// @access  Private
const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ 
    enrolledStudents: req.user.id 
  }).select('code title credits instructor');
  
  res.status(200).json(courses);
});

module.exports = {
  enrollInCourse,
  unenrollFromCourse,
  getMyCourses
};