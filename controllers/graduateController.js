const db = require('../models')

const Graduate = db.graduates

const addGraduate = async (req, res) => {
    try {
        let attributes = {
            GraduateId: req.body.GraduateId,
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


// get specific graduate
const getOneGraduate = async (req, res) => {
    try {
        let id = req.params.GraduateId
        let graduate = await Graduate.findOne({ where: { GraduateId: id }})
        res.status(200).send(graduate)
    } 
    catch (error) {
        console.error('Error getting graduate:', error);
        res.status(500).send('Internal server error');
    }

}


// get all graduates
const getAllGraduates = async (req, res) => {
    try {
        let graduates = await Graduate.findAll()
        res.status(200).send(graduates)
    } 
    catch (error) {
        console.error('Error getting graduates:', error);
        res.status(500).send('Internal server error');
    }
}


//update graduate
const updateGraduate = async (req, res) => {
    try {
        let id = req.params.GraduateId;
        
        const graduate = await Graduate.findOne({ where: { GraduateId: id }});
        if (!graduate) {
            return res.status(404).send('Graduate not found');
        }
        
        await graduate.update(req.body);

        res.status(200).send(graduate);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}



// delete graduate 
const deleteGraduate = async (req, res) => {
    try {
        let id = req.params.GraduateId;
        
        const graduate = await Graduate.findOne({ where: { GraduateId: id }});
        if (!graduate) {
            return res.status(404).send('Graduate not found');
        }
        
        await graduate.destroy({ where: { GraduateId: id }});
        res.status(200).send('Graduate deleted successfully');
    }
    catch (error) {
        console.error('Error deleting graduate:', error);
        res.status(500).send('Internal server error');
    }
}

module.exports = {
    addGraduate,
    getOneGraduate,
    getAllGraduates,
    updateGraduate,
    deleteGraduate
}