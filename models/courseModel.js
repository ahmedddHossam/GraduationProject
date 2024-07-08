const { allow } = require("joi");
const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const Course = Sequelize.define("course" , {
        courseId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        courseName: {
            type: DataTypes.STRING,
            allowNull: false
        },


        
    })

    return Course;
}