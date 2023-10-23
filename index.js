const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
var cors = require("cors");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const ShortUniqueId = require("short-unique-id");
const uid = new ShortUniqueId({ length: 4 });
const cookieParser = require("cookie-parser");
require("dotenv").config();
//Objects from models

const facultyObj = require("./models/faculty");
const quizObj = require("./models/quiz");
const studentObj = require("./models/student");
const responseObj = require("./models/responses");
const resultsObj = require("./models/result");
const courseObj = require("./models/courses");

//Middleware authentication

const facultyAuth = require("./middleware/facultyAuth");
const studentAuth = require("./middleware/studentAuth");

app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });
// MAK

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(
  cors({
    credentials: true,
    origin: ["*", "http://localhost:3000"],
  })
);

// CONNECTING SERVER TO MONGODB DATABASE --------------------------------------------------------
mongoose.connect("mongodb://127.0.0.1:27017/LMS");
// mongoose.connect(process.env.MONGO_URL);
var db = mongoose.connection;
//checking

db.on("error", console.log.bind(console, "Connection Error"));
db.once("open", () => {
  console.log("Connection Successful");
});

app.get("/", (req, res) => {
  res.send("Abhishek chorotiya");
});

app.post("/adminLogin", (req, res) => {
  const username = "admin";
  const password = "admin";
  // console.log(req.body)
  if (req.body.username == username && req.body.password == password) {
    res.send(true);
  } else {
    res.send(false);
  }
});

app.post("/regStudents", async (req, res) => {
  console.log(req.body);
  for (let i in req.body) {
    const student = new studentObj({
      Id: req.body[i].id,
      Name: req.body[i].name,
      Father: req.body[i].fathersname,
      Branch: req.body[i].branchname,
      Semester: req.body[i].semester,
      Contact: req.body[i].contact,
      Email: req.body[i].id + "@iiitkota.ac.in",
      Gender: req.body[i].gender,
      Password: req.body[i].contact,
    });
    const data = await studentObj.findOne({ Id: req.body[i].idnumber });
    if (data) {
      // console.log("Duplicate student entry");
      continue;
    } else {
      student.save();
    }
    // console.log(req.body[i]);
  }

  res.json("done");
});

app.post("/regFaculty", async (req, res) => {
  const faculty = new facultyObj({
    Id: "IIITK_" + uid(),
    Name: req.body.name,
    Contact: req.body.contact,
    Gender: req.body.gender,
    Email: req.body.email,
    Password: req.body.contact,
  });

  var data = await facultyObj.findOne({ Contact: req.body.contact });

  if (data) {
    res.json({ msg: "Faculty already registered !", code: 0 });
  } else {
    faculty
      .save()
      .then(() => {
        res.json({ msg: "faculty Registered Sucessfully", code: 1 });
      })
      .catch((e) => {
        res.json({ msg: "An Error occured", code: 2 });
      });
  }

  // console.log(data)

  // res.json('hi')
});

app.post("/facultyLogin", async (req, res) => {
  console.log("Recieved Data : " + req.body);
  try {
    const user = await facultyObj.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    console.log(token);
    res.cookie("jwt", token);
    return res.send({ message: "LoggedIn", code: 1 });
    // res.redirect("/home");
  } catch (e) {
    // res.send("Invalid Credentials");
    return res.send({ message: "error", code: 0 });
  }
});

app.post("/studentLogin", async (req, res) => {
  try {
    const user = await studentObj.findByCredentials(
      req.body.id,
      req.body.password
    );
    const token = await user.generateAuthToken();
    console.log(token);
    res.cookie("student", token);
    return res.send({ message: "LoggedIn" });
  } catch (e) {
    return res.send({ message: "error" });
  }
});

app.post("/studentInfo", studentAuth, async (req, res) => {
  res.json(req.student);
});

app.post("/quizzForm", facultyAuth, async (req, res) => {
  console.log("Submitting Quiz form");

  const quiz = new quizObj({
    title: req.body.title,
    year: req.body.year,
    branch: req.body.branch,
    totalQues: req.body.questionNo,
    duration: req.body.duration,
    marks: req.body.marks,
    faculty: req.user.Name,
  });

  quiz.save();

  res.json("ok");
});

app.get("/inactive", facultyAuth, async (req, res) => {
  const quiz = await quizObj.find();
  res.json(quiz);
});

app.post("/setQuiz", async (req, res) => {
  const quiz = await quizObj.findOne({ _id: req.body.id });
  quiz.active = !req.body.toggle;
  quiz.save();
  res.json("done");
});

app.get("/active", studentAuth, async (req, res) => {
  const quiz = await quizObj.find({ active: true });
  res.json(quiz);
});

app.get("/getQuizInfo/:data", async (req, res) => {
  const id = req.params.data;
  const quiz = await quizObj.findOne({ _id: id });
  res.json(quiz);
});

app.get("/getQuiz/:data", async (req, res) => {
  const id = req.params.data;
  const quiz = await quizObj.findOne({ _id: id });
  res.json(quiz);
});

app.post("/addQue/:data", async (req, res) => {
  const id = req.params.data;
  const quiz = await quizObj.findOne({ _id: id });

  quiz.questions = req.body.questions;
  quiz.save();

  res.json("done");
});

app.get("/getResult", async (req, res) => {
  const student = "2020KUEC2029";
  const quizId = "6448e29f6849b1d6b7a65670";

  var quizData = await quizObj.findOne({ _id: quizId });

  var responseData = await responseObj.findOne({ studenId: student, quizId });

  const response = responseData.response;

  var marks = 0;

  for (let que of quizData.questions) {
    if (response[que._id]) {
      if (response[que._id] == que.correct) {
        marks += parseInt(que.mark);
      }
    }
  }

  const result = new resultsObj({
    studentId: student,
    quizId,
    marks,
  });

  result.save();

  res.send(`${marks}`);
});

app.post("/submitQuiz", studentAuth, async (req, res) => {
  // console.log(req.body.response);
  // console.log(req.body.id);
  // console.log(req.body.quizId);

  const check = await responseObj.findOne({
    studentId: req.body.id,
    quizId: req.body.quizId,
  });

  if (check) {
    res.json("Student has already submitted the quiz!!");
  } else {
    const response = new responseObj({
      studentId: req.body.id,
      quizId: req.body.quizId,
      response: req.body.response,
    });

    response.save();

    res.json("done");
  }
});

app.post("/addCourse", async (req, res) => {
  const CourseId = req.body.courseId;
  const CourseName = req.body.courseName;
  const CourseCredit = req.body.courseCredit;
  const Semester = req.body.semester;
  const Branch = req.body.branch;
  const FacultyId = req.body.facultyId;
  const students = req.body.students;

  console.log(req.body);
  const check = await courseObj.findOne({
    CourseId,
  });

  if (!check) {
    const course = new courseObj({
      CourseId,
      CourseName,
      CourseCredit,
      Semester,
      FacultyId,
      Branch,
      students,
    });

    await course.save();

    res.json("Course Added Successfully!");
  } else {
    res.json("Course Already Exists !");
  }
});

app.post("/courses/:data", async (req, res) => {
  const faculty = req.params.data;
  const courses = await courseObj.find({ FacultyId: faculty });
  console.log(faculty, "hi");
  res.json(courses);
});

app.post("/attendence/:course", async (req, res) => {
  const students = await studentObj.find();

  const course =
    req.params.course == "ECE"
      ? "Electronics and Communication Engineering"
      : "Computer Science and Engineering";

  const data = students.filter((a) => a.Branch == course);
  // console.log(data);
  res.json(data);
});

app.post("/get_faculty", facultyAuth, (req, res) => {
  console.log("Sending Faculty info :");
  console.log(req.user);
  res.send(req.user);
});

app.post("/addAttendence", facultyAuth, (req, res) => {
  console.log(req.user);
  res.json("added");
});

// Attendance---------------------MAK--------------------------------
const attendanceObj = require("./models/attendance");
app.get("/api/courses", studentAuth, async (req, res) => {
  const courses = await courseObj.find({});
  try {
    res.status(200).send(courses);
  } catch (e) {
    res.status(500).send("Something went wrong");
  }
});

//--------Mobile-APP------------

app.post("/getFaculty", facultyAuth, async (req, res) => {
  if (req.user) {
    res.json({ message: "Logged In", code: 1, data: req.user });
  } else {
    res.json({ message: "Please Login", code: 0, data: "" });
  }
});

app.get("/test", (req, res) => {
  console.log("Request Coming From Mobile Device");
  res.json("Request Recieved to Nodejs Server");
});

app.post("/test2", async (req, res) => {
  console.log(req.body);
  const students = await studentObj.find();
  const ids = students.map((a) => a.Id);
  const id_map = {};

  for (let val of ids) {
    id_map[val] = 1;
  }

  const data = req.body;
  const data_arr = [];

  for (let i = 0; i < data.length; i++) {
    const studentID = data[i];
    if (id_map[studentID]) {
      const student = await studentObj.findOne({ Id: studentID });
      // console.log(student)
      data_arr.push(student);
    }
  }

  res.json({ message: "Data Recieved Successfully!!", data: data_arr });
});

app.post("/getCourseId", facultyAuth, async (req, res) => {
  const courses = await courseObj.find();
  const data = [];
  courses.forEach((a) => {
    data.push({ label: a.CourseId, value: a.CourseId });
  });

  console.log(data);

  res.json(data);
});

app.post("/markAttendance", facultyAuth, async (req, res) => {
  try {
    console.log("MarkAttendance");

    const attendance = new attendanceObj({
      Date: new Date(),
      students: req.body.data,
    });

    const course = await courseObj.findOne({ CourseId: req.body.course });

    await course.attendance.push(attendance);
    attendance.save();
    course.save();

    res.json({ code: 1, message: "Attendance Saved" });
  } catch (e) {
    res.json({ code: 0, message: e });
  }
});

app.post("/logout", facultyAuth, async (req, res) => {
  req.user.tokens = req.user.tokens.filter(
    (token) => token.token != req.cookies.jwt
  );
  await req.user.save();
  res.clearCookie("jwt");
  res.json("Logged Out");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
