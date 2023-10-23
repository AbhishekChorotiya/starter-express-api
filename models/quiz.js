const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({

    title : {
        type: String,
    },
    marks: {
        type: String,
    },
    totalQues:{
        type: String,
    },
    faculty:{
        type: String,
    },
    course:{
        type: String,
    },
    course_code:{
        type: String,
    },
    year: {
        type: String,
    },
    branch: {
        type: String,
    },
    duration: {
        type: String
    },
    questions: [
        {
            questionId: {
                type: String
            },
            question:{
                type: String
            },
            options: [
                {
                    option:{
                        type: String
                    }
                }
            ],
            mark:{
                type: String
            },
            correct:{
                type: String
            }
        }
    ],
    active: {
        type: Boolean,
        default: false
    }

})


const quizObj = mongoose.model('quiz',quizSchema)

module.exports = quizObj;
