const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const Graduate = Sequelize.define("graduate" , {
        GraduateId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        Name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        arabicName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Gender: {
            type: DataTypes.STRING,
            allowNull: false
        },
        GPA: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        Grade: {
            type: DataTypes.STRING,
            allowNull: true
        },
        total_mark: {
            type: DataTypes.STRING,
            allowNull: true
        }
        ,projectGrade: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Major: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Minor: {
            type: DataTypes.STRING,
            allowNull: true
        },
        NationalId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique:true
        },
        Nationality: {
            type: DataTypes.STRING,
            allowNull: false
        },
        StartDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        EndDate: {
            type: DataTypes.STRING,
            allowNull: false
        },
        MobileNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Bylaw: {
            type: DataTypes.STRING,
            allowNull: false
        },
        BylawVersion: {
            type: DataTypes.STRING,
            allowNull: false
        },
        BirthDate: {
            type: DataTypes.DATE,
            allowNull: false
        }
        
    })

    return Graduate;
}