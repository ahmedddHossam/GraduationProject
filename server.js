require('dotenv').config();

const express = require('express');
const cors = require('cors');
const postGraduateRouter = require('./routes/postGraduate.routes');
const userRouter = require('./routes/userRoute');
const CareerRouter = require('./routes/CareerTrackerRouter');
const jobRouter = require('./routes/jobRoute');
const app = express();
const http = require('http');
const initializeSocket = require('./config/socketConfig');
const path = require('path');
const db = require("./models/index.js");
const router = require('./routes/graduateRouter')
const httpStatus = require('./utils/httpStatusText');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


const server = http.createServer(app);

const io = initializeSocket.initialize(server);


db.sequelize.sync({ force: false })
    .then(() => {
        console.log('yes re-sync done!')
    })
// var corsOptions = {
//     origin: 'http://localhost:8081'
// }

// app.use(cors(corsOptions));
// app.use(express.json);
// app.use(express.urlencoded({ extended: true }));


// add graduate api

app.use('/api/graduates', router)


app.use('/uploads',express.static(path.join(__dirname,'uploads')));

app.use('/api/post-graduate/',postGraduateRouter);

app.use('/api/user',userRouter);

app.use('/api/job',jobRouter);

app.use('/api/career/',CareerRouter)

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


// app.on('error', (error) => {
//     console.error('Server error:', error);
// });

app.all('*', (req, res, next) => {
    return res.status(404).json({ status: httpStatus.ERROR, message: "Page not found" })
});
app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({ status: err.statusText || httpStatus.ERROR, message: err.message });
});


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

