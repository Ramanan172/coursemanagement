const Result = require('../models/Result');
const User = require('../models/User');
const Course = require('../models/Course');
const asyncHandler = require('express-async-handler');

// @desc    Add result for student
// @route   POST /api/results
// @access  Private/Admin
const addResult = asyncHandler(async (req, res) => {
  const { studentId, courseId, grade, score, semester, academicYear, remarks } = req.body;
  
  // Validate required fields
  if (!studentId || !courseId || !grade || !semester || !academicYear) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }
  
  // Check if student exists and is actually a student
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    res.status(404);
    throw new Error('Student not found');
  }
  
  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  
  // Check if student is enrolled in the course
  if (!course.enrolledStudents.includes(studentId)) {
    res.status(400);
    throw new Error('Student is not enrolled in this course');
  }
  
  // Check if result already exists for this student, course, semester, and year
  const existingResult = await Result.findOne({
    student: studentId,
    course: courseId,
    semester,
    academicYear
  });
  
  if (existingResult) {
    res.status(400);
    throw new Error('Result already exists for this student, course, semester, and academic year');
  }
  
  // Create result
  const result = await Result.create({
    student: studentId,
    course: courseId,
    grade: grade.toUpperCase(),
    score,
    semester,
    academicYear,
    remarks
  });
  
  // Populate the result with student and course details
  const populatedResult = await Result.findById(result._id)
    .populate('student', 'name email')
    .populate('course', 'code title credits');
  
  res.status(201).json(populatedResult);
});

// @desc    Get results for student
// @route   GET /api/results/student/:studentId
// @access  Private/Admin
const getStudentResults = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.studentId);
  
  if (!student || student.role !== 'student') {
    res.status(404);
    throw new Error('Student not found');
  }
  
  const results = await Result.find({ student: req.params.studentId })
    .populate('course', 'code title credits')
    .sort({ academicYear: -1, semester: 1 });
  
  res.status(200).json({
    student: {
      _id: student._id,
      name: student.name,
      email: student.email
    },
    results
  });
});

// @desc    Get results for currently logged in student
// @route   GET /api/results/my-results
// @access  Private
const getMyResults = asyncHandler(async (req, res) => {
  const results = await Result.find({ student: req.user.id })
    .populate('course', 'code title credits instructor')
    .sort({ academicYear: -1, semester: 1 });
  
  res.status(200).json(results);
});

// @desc    Update result
// @route   PUT /api/results/:id
// @access  Private/Admin
const updateResult = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id);
  
  if (!result) {
    res.status(404);
    throw new Error('Result not found');
  }
  
  const updatedResult = await Result.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('student', 'name email')
   .populate('course', 'code title credits');
  
  res.status(200).json(updatedResult);
});

// @desc    Delete result
// @route   DELETE /api/results/:id
// @access  Private/Admin
const deleteResult = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id);
  
  if (!result) {
    res.status(404);
    throw new Error('Result not found');
  }
  
  await Result.deleteOne({ _id: req.params.id });
  
  res.status(200).json({ 
    success: true, 
    message: 'Result deleted successfully' 
  });
});

module.exports = {
  addResult,
  getStudentResults,
  getMyResults,
  updateResult,
  deleteResult
};