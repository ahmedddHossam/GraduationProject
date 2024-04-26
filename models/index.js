const dbconfig = require('../config/dbconfig');
const {Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize(dbconfig.DB, dbconfig.USER, dbconfig.PASSWORD, {
    host: dbconfig.HOST,
    dialect: dbconfig.dialect,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

sequelize.authenticate()
.then(()=> {
    console.log('Connection has been established successfully.');
})
.catch((err) => {
    console.error('Unable to connect to the database:', err);
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.user = require('./userModel.js')(sequelize, DataTypes)
db.admin = require('./adminModel.js')(sequelize, DataTypes)
db.superAdmin = require('./superAdminModel.js')(sequelize, DataTypes)
db.department = require('./departmentModel.js')(sequelize, DataTypes)
db.course = require('./courseModel.js')(sequelize, DataTypes)
db.company = require('./companyModel.js')(sequelize, DataTypes)
db.application = require('./applicationModel.js')(sequelize, DataTypes)
db.graduate = require('./graduateModel.js')(sequelize, DataTypes)
db.job = require('./jobModel.js')(sequelize, DataTypes)
db.notification = require('./notificationModel.js')(sequelize, DataTypes)
db.postgraduateStudies = require('./PostgraduateStudiesModel.js')(sequelize, DataTypes)
db.post = require('./postModel.js')(sequelize, DataTypes)
db.request = require('./requestModel.js')(sequelize, DataTypes)
db.response = require('./responseModel.js')(sequelize, DataTypes)
db.work_in = require('./work_inModel.js')(sequelize, DataTypes)
db.enrolled_in = require('./enrolled_inModel.js')(sequelize, DataTypes)

module.exports = db;
