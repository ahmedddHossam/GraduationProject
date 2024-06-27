const db = require('../models');
const Request = db.request;
const Response = db.response;
const {sendMail} = require('../utils/mailer')

// send request 
const sendRequest = async (req, res) => {
    try {
        rf = req.body.requestField
        ue = req.body.userEmail
        const newRequest = await Request.create({
            requestField: req.body.requestField,
            requestStatus: "Pending",
            userEmail: req.body.userEmail,
            Timestamp: req.body.Timestamp
        })
        console.log(rf);
        console.log(ue);

        const io = req.app.get('io');
        io.emit('new_request', newRequest);

        res.status(200).json(newRequest);
    }
    catch(error) {
        res.status(500).json({ error: error.message });
    }
}


// send response 
const sendResponse = async (req, res) => {
    try {
        let status = req.body.Status
        let id = req.params.requestId
        const request = await Request.findByPk(req.params.requestId)
        console.log (id)

        if (request) {

            const newResponse = await Response.create({
                Body: req.body.Body,
                Status: status,
                Timestamp: req.body.Timestamp
            })

            const userEmail = request.userEmail
            request.requestStatus = status
            await request.save()

            // await request.destroy()

            const io = req.app.get('io');
            io.emit('update_request', { id: req.params.id, status });

            // Send email to user
            const emailSubject = `Your request has been ${status}`;
            const emailText = `Your request with ID ${req.params.id} has been ${status}.`;

            await sendMail(userEmail, emailSubject, emailText);

            res.json({ message: 'Request updated and email sent' });
        } else {
            res.status(404).json({ error: 'Request not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    sendRequest,
    sendResponse
}