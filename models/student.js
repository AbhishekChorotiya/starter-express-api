const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const studentSchema = new mongoose.Schema({
  Id: {
    type: String,
  },
  Name: {
    type: String,
  },
  Email: {
    type: String,
  },
  Contact: {
    type: String,
  },
  Father: {
    type: String,
  },
  Gender: {
    type: String,
  },
  Password: {
    type: String,
  },
  Semester: {
    type: String,
  },
  Branch: {
    type: String,
  },
  Courses: [
    {
      CourseID: {
        type: String,
      },
    },
  ],
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

studentSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "LMS");
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

studentSchema.statics.findByCredentials = async (Id, Password) => {
  const user = await studentObj.findOne({ Id });
  console.log(user);
  if (!user) {
    throw new Error("Invalid Credentials!");
  }

  if (Password === user.Password) {
    return user;
  } else {
    throw new Error("Incorrect Password!");
  }
};

const studentObj = mongoose.model("student", studentSchema);

module.exports = studentObj;
