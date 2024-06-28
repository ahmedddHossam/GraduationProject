const db = require('../models');
const Request = db.request;
const Response = db.response;
const Graduate = db.graduate;
const {sendMail} = require('../utils/mailer')

// send request 
const sendRequest = async (req, res) => {
    try {
        const rf = req.body.requestField
        const nationalID = req.body.nationalID
        const graduateID = req.body.graduateID
        const newRequest = await Request.create({
            requestField: req.body.requestField,
            requestStatus: "Pending",
            nationalID: req.body.nationalID,
            graduateID: req.body.graduateID,
            Timestamp: req.body.Timestamp,
            newRequest:'1'
        })
        console.log(rf);


        const io = req.app.get('io');
        io.emit('new_request', newRequest);

        res.status(200).json(newRequest);
    }
    catch(error) {
        res.status(500).json({ error: error.message });
    }
}

const getAllRequests = async (req, res) => {
    const requests = await Request.findAll({where: {requestStatus: "Pending"},order: [['requestId', 'DESC']]});
    if(requests){
        res.status(200).json(requests);
    }else{
        res.status(404).json('Not Found');
    }
}



module.exports = {
    sendRequest,
    getAllRequests,

}