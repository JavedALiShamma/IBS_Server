const mongoose = require("mongoose");
const holidaySchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    unique: true,
  },
  name: String,
});

module.exports = mongoose.model("GovtHoliday", holidaySchema);
