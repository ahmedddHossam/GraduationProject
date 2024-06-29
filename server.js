const express = require('express');
const cors = require('cors');
const multer = require('multer');
const socketIo = require('socket.io');
const http = require('http');
const db = require('./models');
const Request = db.request;
const Graduate = db.graduate;
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000', // your frontend URL
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('io', io);

const upload = multer({ dest: 'uploads/' });

const graduateRouter = require('./routes/graduateRouter');
const adminRouter = require('./routes/adminRouter');
const requestRouter = require('./routes/requestRouter');
const postGraduateRouter = require('./routes/postGraduate.routes');
const printRouter = require('./routes/prints.routes')
const courseRouter = require('./routes/courseRouter')
const {sendMail} = require("./utils/mailer");
const httpStatusText = require("./utils/httpStatusText");
app.use(cors({
    origin: 'http://localhost:3000', // your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use('/api/graduates', graduateRouter);
app.use('/api/admin', adminRouter); // Adjusted the base path for adminRouter
app.use('/api/requests', requestRouter); // Adjusted the base path for requestRouter
app.use('/api/post-graduate', postGraduateRouter); // Adjusted the base path for requestRouter
app.use('/api/print', printRouter); // Adjusted the base path for requestRouter
app.use('/api/course', courseRouter);

const PORT = process.env.PORT || 5000;

app.on('error', (error) => {
    console.error('Server error:', error);
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('mark_as_read', async ({ notificationIds }) => {
        try {
            console.log(notificationIds)
            // Update the newRequest status in your database for notificationIds
            for (const notificationId in notificationIds) {
                const request = await Request.findByPk(notificationIds[notificationId]);
                    request.newRequest = "0";
                    await request.save();
            }

            // Emit an event to confirm to the client that notifications are marked as read
            socket.emit('marked_as_read', { success: true });
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            // Optionally handle error and emit an error event to the client
            socket.emit('mark_as_read_error', { error: 'Failed to mark notifications as read' });
        }
    });
    socket.on('update_request', async ({  requestId, status  }) => {
        try {
            const request = await Request.findByPk(requestId)
            console.log (requestId)

            if (request) {

                const user = await Graduate.findByPk(request.graduateID);
                const userEmail = user.Email;
                request.requestStatus = status;
                await request.save();


                // Send email to user
                const emailSubject = `Your request has been ${status}`;
                const emailText = `Your request with ID ${requestId} has been ${status}.`;

                await sendMail(userEmail, emailSubject, emailText);

                socket.emit('update_request', { success: true });
            } else {
                socket.emit('update_request_error', { error: 'Failed to update notifications status' });
            }
        }
        catch (error) {
            socket.emit('update_request_error', { error: 'Failed to update notifications status' });

        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

