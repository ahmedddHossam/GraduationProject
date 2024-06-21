const express = require('express');
const cors = require('cors');
const postGraduateRouter = require('./routes/postGraduate.routes');
const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const router = require('./routes/graduateRouter')

const path = require('path');
const db = require("./models/index.js");
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


const PORT = process.env.PORT || 5000
app.on('error', (error) => {
    console.error('Server error:', error);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

