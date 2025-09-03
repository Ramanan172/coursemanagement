const express = require('express');
const router = express.Router();
const {
  enrollInCourse,
  unenrollFromCourse,
  getMyCourses
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/auth');

router.route('/:courseId')
  .post(protect, enrollInCourse)
  .delete(protect, unenrollFromCourse);

router.get('/my-courses', protect, getMyCourses);

module.exports = router;