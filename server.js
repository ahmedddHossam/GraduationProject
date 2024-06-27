const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const socketIo = require('socket.io');
const http = require('http');



const app = express();
const server = http.createServer(app);
const io = socketIo(server);



app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('io', io);
const upload = multer({ dest: 'uploads/' });
const graduateRouter = require('./routes/graduateRouter')
const adminRouter = require('./routes/adminRouter')
const requestRouter = require('./routes/requestRouter')

// var corsOptions = {
//     origin: 'http://localhost:8081'
// }

// app.use(cors(corsOptions));
// app.use(express.json);
// app.use(express.urlencoded({ extended: true }));

// /api/graduates/nominateTA/:Department
// add graduate api

app.use('/api/graduates', graduateRouter)
app.use('/api/graduates', adminRouter)
app.use('/api/graduates', requestRouter)



app.get('/', (req, res) => {
    return res.send('AhmedHossam');
});

const PORT = process.env.PORT || 5000
app.on('error', (error) => {
    console.error('Server error:', error);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

