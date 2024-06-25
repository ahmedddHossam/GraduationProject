const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');


const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const upload = multer({ dest: 'uploads/' });
const router = require('./routes/graduateRouter')
const router2 = require('./routes/adminRouter')

// var corsOptions = {
//     origin: 'http://localhost:8081'
// }

// app.use(cors(corsOptions));
// app.use(express.json);
// app.use(express.urlencoded({ extended: true }));


// add graduate api

app.use('/api/graduates', router)
app.use('/api/graduates', router2)



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

