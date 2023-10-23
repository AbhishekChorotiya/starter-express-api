const mongoose = require('mongoose');

const resultsSchema = new mongoose.Schema({

    studentId : {
        type: String,
    },
    quizId: {
        type: String,
    },
    marks: {
        type: Object,
    }

})


const resultsObj = mongoose.model('results',resultsSchema)

module.exports = resultsObj;
