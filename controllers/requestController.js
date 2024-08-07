const db = require('../models');
const Request = db.request;
const Response = db.response;
const Graduate = db.graduate;
const {sendMail} = require('../utils/mailer')
const { Sequelize, DataTypes, Op } = require("sequelize");

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
            newRequest:'1',
            NumberOfPapers:parseInt(req.body.NumberOfPapers)
        })
        console.log(newRequest);
        const io = req.app.get('io');
        io.emit('new_request', newRequest);

        res.status(200).json(newRequest);
    }
    catch(error) {
        res.status(500).json({ error: error.message });
    }
}

// const getAllRequests = async (req, res) => {
//
//     const requests = await Request.findAll({where: {requestStatus: "Pending"},order: [['requestId', 'DESC']]});
//     if(requests){
//         res.status(200).json(requests);
//     }else{
//         res.status(404).json('Not Found');
//     }
// }

const getAllRequests = async (req, res) => {
    try {
        const requests = await Request.findAll({
            where: { requestStatus: "Pending" },
            order: [['requestId', 'DESC']],
            attributes: {
                include: [

                        [
                        Sequelize.literal(`(
                            SELECT SUM(subRequest.numberOfPapers)
                            FROM requests AS subRequest
                            WHERE subRequest.graduateID = Request.graduateID
                            AND SUBSTRING_INDEX(subRequest.requestField, ' ', -1) = SUBSTRING_INDEX(Request.requestField, ' ', -1)
                              AND subRequest.requestStatus = 'Approved'
                              AND YEAR(subRequest.Timestamp) = YEAR(CURDATE())
                        )`),
                            'totalNumberOfPapers'
                        ]
                ]
            }
        });

        if (requests.length > 0) {
            res.status(200).json(requests);
        } else {
            res.status(404).json('Not Found');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getUserRequests =
    async (req, res) => {

        const grad = req.currentUser;

        console.log(grad.email);
        const email = grad.email;
        const user = await db.graduate.findOne({where:{Email:email}})
        const requests = await Request.findAll({where: {graduateID: user.GraduateId},order: [['requestId', 'DESC']]});
        if(requests){
            res.status(200).json(requests);
        }else{
            res.status(404).json('Not Found');
        }
    }


module.exports = {
    sendRequest,
    getAllRequests,
    getUserRequests

}