const dbconfig = require('../config/dbconfig');
const { Sequelize, DataTypes } = require('sequelize');

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
    .then(() => {
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


db.sequelize.sync({ force: false })
    .then(() => {
        console.log('yes re-sync done!')
    })

// relationships graduate,admin,superAdmin is a user
db.graduate.belongsTo(db.user)
db.admin.belongsTo(db.user)
db.superAdmin.belongsTo(db.user)

//relationship between graduates and department
db.graduate.belongsTo(db.department)

//relationship between graduates and companies
db.graduate.belongsToMany(db.company, { through: db.work_in })
db.company.belongsToMany(db.graduate, { through: db.work_in })

db.postgraduateStudies.belongsTo(db.graduate)

db.application.belongsTo(db.graduate)
db.application.belongsTo(db.job)

db.job.belongsTo(db.admin)

db.course.belongsTo(db.department)

db.post.belongsTo(db.admin)

db.notification.belongsTo(db.user)

db.response.belongsTo(db.graduate)
db.response.belongsTo(db.admin)

db.request.belongsTo(db.graduate)

db.graduate.belongsToMany(db.course, { through: db.enrolled_in })
db.course.belongsToMany(db.graduate, { through: db.enrolled_in })

module.exports = db;