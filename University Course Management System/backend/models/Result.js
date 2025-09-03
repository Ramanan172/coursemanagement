const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  grade: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D', 'F', 'I'], // I for Incomplete
    uppercase: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  semester: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  remarks: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate results
resultSchema.index({ student: 1, course: 1, semester: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);