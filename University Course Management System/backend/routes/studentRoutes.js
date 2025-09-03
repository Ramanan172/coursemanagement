const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudent,
  deleteStudent,
  getStudentEnrollments
} = require('../controllers/studentController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(protect, admin, getStudents);

router.route('/:id')
  .get(protect, admin, getStudent)
  .delete(protect, admin, deleteStudent);

router.get('/:id/enrollments', protect, admin, getStudentEnrollments);

module.exports = router;