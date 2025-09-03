const express = require('express');
const router = express.Router();
const {
  addResult,
  getStudentResults,
  getMyResults,
  updateResult,
  deleteResult
} = require('../controllers/resultController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .post(protect, admin, addResult);

router.get('/my-results', protect, getMyResults);
router.get('/student/:studentId', protect, admin, getStudentResults);

router.route('/:id')
  .put(protect, admin, updateResult)
  .delete(protect, admin, deleteResult);

module.exports = router;