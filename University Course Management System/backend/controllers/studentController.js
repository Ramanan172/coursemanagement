const User = require('../models/User');
const Course = require('../models/Course');
const asyncHandler = require('express-async-handler');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
const getStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' })
    .select('name email createdAt')
    .sort({ name: 1 });
  
  res.status(200).json(students);
});

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private/Admin
const getStudent = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.id)
    .select('name email createdAt');
  
  if (!student || student.role !== 'student') {
    res.status(404);
    throw new Error('Student not found');
  }
  
  res.status(200).json(student);
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.id);
  
  if (!student || student.role !== 'student') {
    res.status(404);
    throw new Error('Student not found');
  }
  
  // Remove student from all enrolled courses
  await Course.updateMany(
    { enrolledStudents: student._id },
    { $pull: { enrolledStudents: student._id } }
  );
  
  await User.deleteOne({ _id: student._id });
  
  res.status(200).json({ 
    success: true, 
    message: 'Student deleted successfully' 
  });
});

// @desc    Get student enrollments
// @route   GET /api/students/:id/enrollments
// @access  Private/Admin
const getStudentEnrollments = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.id);
  
  if (!student || student.role !== 'student') {
    res.status(404);
    throw new Error('Student not found');
  }
  
  const enrollments = await Course.find({ enrolledStudents: student._id })
    .select('code title credits instructor enrollmentCount capacity')
    .populate('enrolledStudents', 'name email');
  
  res.status(200).json({
    student: {
      _id: student._id,
      name: student.name,
      email: student.email
    },
    enrollments
  });
});

module.exports = {
  getStudents,
  getStudent,
  deleteStudent,
  getStudentEnrollments
};