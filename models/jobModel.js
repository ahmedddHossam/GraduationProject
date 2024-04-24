const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const Job = Sequelize.define("job" , {
        JobId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Requirements: {
            type: DataTypes.STRING,
            allowNull: false
        }
        
    })

    return Job;
}