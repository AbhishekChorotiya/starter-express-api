const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    CourseId: {
        type: String,
        required: true
    },
    CourseName: {
        type: String,
    },
    CourseCredit: {
        type: String,
    },
    Branch: {
        type: String,
    },
    Semester: {
        type: String,
        required: true
    },
    FacultyId: {
        type: String,
    },
    students: [{
        id: {
            type: String,
        }
    }],
    attendance: [{
        data: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'attendance' 
        }
    }]
});

const courseObj = mongoose.model('Course', courseSchema);

module.exports = courseObj;
