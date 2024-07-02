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
        arabicCourseName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        degree: {
            type: DataTypes.INTEGER,
            allowNull: false 
        },
        grade: {
            type: DataTypes.STRING,
            allowNull: false 
        },
        semester: {
            type: DataTypes.STRING,
            allowNull: false
        },
        year: {
            type: DataTypes.STRING,
            allowNull: false
        },
        bylaw: {
            type: DataTypes.STRING,
            allowNull: false
        }
        
    })

    return Course;
}