const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  Date: {
    type: Date,
  },
  students: [{
    id:{
      type: String,
    }
  }
  ]
});

const attendanceObj = mongoose.model("attendance", attendanceSchema);

module.exports = attendanceObj;
