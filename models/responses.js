const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({

    studentId : {
        type: String,
    },
    quizId: {
        type: String,
    },
    response: {
        type: Object,
    }

})


const responseObj = mongoose.model('response',responseSchema)

module.exports = responseObj;
