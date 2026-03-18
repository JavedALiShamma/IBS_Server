const Holiday = require('../models/holiday.model');
const addHoliday = (req, res) => {
    try{
         const { date, description } = req.body;
    if (!date || !description) {
        return res.status(400).json({ error: "Date and description are required" });
    }
    // LOgic to add the holiday to the database
    const newHoliday = new Holiday({
        date,
        name: description
    });
    newHoliday.save();
        res.status(201).json({ message: "Holiday added successfully" });
    }
    catch(error){
        res.status(500).json({ error: "An error occurred while adding the holiday" });
    }
   
    // Logic to add the holiday to the database

}
module.exports = {
    addHoliday
}