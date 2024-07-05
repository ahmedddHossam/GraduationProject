const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const Graduate = Sequelize.define("oldBaylawGraduate" , {
        GraduateId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        Name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // arabicName: {
        //     type: DataTypes.STRING,
        //     allowNull: false
        // },
        Email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Gender: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Grade: {
            type: DataTypes.STRING,
        },
        total_mark : {
            type: DataTypes.INTEGER,
            defaultValue : 0
        }
        ,
        Major: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Minor: {
            type: DataTypes.STRING,
            allowNull: false
        },
        NationalId: {
            type: DataTypes.STRING,
            allowNull: false
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
            type: DataTypes.DATE,
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