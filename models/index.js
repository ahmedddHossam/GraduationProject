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
db.announcement= require('./announcementModel')(sequelize,DataTypes)
db.oldBaylawGraduate= require('./oldBaylawGraduateModel')(sequelize,DataTypes)
db.oldBaylaweEnrolledIn= require('./oldBaylawEnrolledIn')(sequelize,DataTypes)

db.sequelize.sync({ force: false })
    .then(() => {
        console.log('yes re-sync done!')
    })

db.jobPublishNotification = require('./JobPublishNotification')(sequelize, DataTypes)
db.skill = require('./skillModel')(sequelize, DataTypes)
db.graduateSkill = require('./GraduateSkillModel')(sequelize, DataTypes)


// relationships graduate,admin,superAdmin is a user
db.graduate.belongsTo(db.user)
db.admin.belongsTo(db.user)
db.superAdmin.belongsTo(db.user)

//relationship between graduates and department
db.graduate.belongsTo(db.department)

//relationship between graduates and companies
db.graduate.belongsToMany(db.company, { through: db.work_in ,foreignKey: 'graduateId' })
db.company.belongsToMany(db.graduate, { through: db.work_in, foreignKey: 'companyId'  })

db.postgraduateStudies.belongsTo(db.graduate)

db.application.belongsTo(db.graduate)
db.application.belongsTo(db.job)

db.job.belongsTo(db.admin)

db.announcement.belongsTo(db.admin,{foreignKey:'adminId'});

db.jobPublishNotification.belongsTo(db.graduate,{onDelete:'CASCADE'})
db.jobPublishNotification.belongsTo(db.job,{onDelete:'CASCADE'})

db.graduate.belongsToMany(db.skill, { through: db.graduateSkill, foreignKey: 'graduateId', otherKey: 'skillId' });
db.skill.belongsToMany(db.graduate, { through: db.graduateSkill, foreignKey: 'skillId', otherKey: 'graduateId' });

db.course.belongsTo(db.department)

db.post.belongsTo(db.admin)

db.notification.belongsTo(db.user)

db.response.belongsTo(db.graduate)
db.response.belongsTo(db.admin)

db.request.belongsTo(db.graduate)

db.graduate.belongsToMany(db.course, { 
    through: db.enrolled_in, 
    foreignKey: 'graduateId', // foreign key in the enrolled_in table referencing graduate
    otherKey: 'courseId' // foreign key in the enrolled_in table referencing course
});

db.course.belongsToMany(db.graduate, { 
    through: db.enrolled_in,
    foreignKey: 'courseId', // foreign key in the enrolled_in table referencing course
    otherKey: 'graduateId' // foreign key in the enrolled_in table referencing graduate
});

// db.oldBaylaweEnrolledIn.belongsTo(db.graduate, {
//     foreignKey: 'GraduateId', // foreign key in the enrolled_in table referencing graduate
// });
db.graduate.hasMany(db.oldBaylaweEnrolledIn, {
    foreignKey: 'GraduateId', // foreign key in the enrolled_in table referencing graduate

});

db.oldBaylaweEnrolledIn.belongsTo(db.course, {
    foreignKey: 'courseId', // foreign key in the enrolled_in table referencing course
});


db.sequelize.sync({ force: false })
    .then(() => {
        console.log('yes re-sync done!')
    })

module.exports = db;