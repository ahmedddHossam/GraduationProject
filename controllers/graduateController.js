const db = require('../models')

const Graduate = db.graduates

const addGraduate = async (req, res) => {
    try {
        let attributes = {
            Name: req.body.Name,
            Email: req.body.Email,
            Gender: req.body.Gender,
            GPA: req.body.GPA,
            Department: req.body.Department,
            NationalId: req.body.NationalId,
            Nationality: req.body.Nationality,
            StartDate: req.body.StartDate,
            EndDate: req.body.EndDate,
            MobileNumber: req.body.MobileNumber,
            Address: req.body.Address,
            Bylaw: req.body.Bylaw,
            BylawVersion: req.body.BylawVersion,
            BirthDate: req.body.BirthDate
        };

        let newGraduate = await Graduate.create(attributes);
        res.status(200).send(newGraduate);
        console.log(newGraduate);
    } catch (error) {
        console.error('Error adding graduate:', error);
        res.status(500).send('Internal server error');
    }
}

module.exports = {
    addGraduate
}