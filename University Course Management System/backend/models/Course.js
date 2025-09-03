const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  credits: {
    type: Number,
    default: 3
  },
  instructor: {
    type: String,
    default: 'TBA'
  },
  capacity: {
    type: Number,
    default: 30
  },
  enrolledStudents: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: [] // Add default empty array
  }
}, {
  timestamps: true
});

// Virtual for enrolled students count
courseSchema.virtual('enrollmentCount').get(function() {
  return this.enrolledStudents ? this.enrolledStudents.length : 0;
});

// Ensure virtual fields are serialized
courseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);