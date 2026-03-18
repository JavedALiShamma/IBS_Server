const express = require('express');
const {addHoliday} = require('../controller/holiday.controller');
const holidayRouter = express.Router();

// POST route to add a holiday
holidayRouter.post('/addHoliday',addHoliday);

module.exports = holidayRouter;