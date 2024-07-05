const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const Enrolled_in = Sequelize.define("oldBaylawEnrolled_in" , {
        courseId:{
            type:DataTypes.STRING,
            allowNull:false
        },
        courseName : {
            type:DataTypes.STRING,
            allowNull:false
        },
        Grade: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Result: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        Term: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Year: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Level: {
            type: DataTypes.STRING,
            allowNull: false
        }

    })

    return Enrolled_in;
}