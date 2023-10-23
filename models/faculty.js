const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')

const facultySchema = new mongoose.Schema({
    Id:{
        type: String,
    },
    Name : {
        type: String,
    },
    Contact: {
        type: String,
    },
    Gender: {
        type: String,
    },
    Email: {
        type: String,
    },
    Password: {
        type: String
    },
    Courses: [
        {
            CourseID: {
                type: String
            }
        }
    ],
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]


})

facultySchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'LMS')
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

facultySchema.statics.findByCredentials = async (Email, Password) => {
    const user = await facultyObj.findOne({ Email })
    console.log(Email,Password)
    if (!user) {
        throw new Error('Invalid Credentials!')
    }

    if (Password === user.Password) {
        return user
    } else {
        throw new Error('Incorrect Password!')
    }
}

const facultyObj = mongoose.model('faculty',facultySchema)

module.exports = facultyObj;
