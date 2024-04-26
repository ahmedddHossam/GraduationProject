const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const Enrolled_in = Sequelize.define("enrolled_in" , {
        Grade: {
            type: DataTypes.STRING,
            allowNull: false
        },
        creditHours: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        termWork: {
            type: DataTypes.STRING,
            allowNull: false
        },
        examWork: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Result: {
            type: DataTypes.STRING,
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