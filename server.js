const express = require('express');
const cors = require('cors');
const postGraduateRouter = require('./routes/postGraduate.routes');
const printRouter = require('./routes/prints.routes');
const app = express();
app.use(cors({
    origin: 'http://localhost:3000', // your frontend URL
    methods: 'GET,POST,PUT,DELETE,PATCH',
    allowedHeaders: 'Content-Type,Authorization'
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const router = require('./routes/graduateRouter')

const path = require('path');

app.use(express.json());


// add graduate api
app.use('/api/graduates', router)


app.use('/uploads',express.static(path.join(__dirname,'uploads')));
app.use('/documents',express.static(path.join(__dirname,'documents')));

// post graduates apis
app.use('/api/post-graduate/',postGraduateRouter);

// papers print apis
app.use('/api/print/',printRouter);


const PORT = process.env.PORT || 5000
app.on('error', (error) => {
    console.error('Server error:', error);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

