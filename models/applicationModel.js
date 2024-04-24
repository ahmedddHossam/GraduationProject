const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const Application = Sequelize.define("application" , {
        applicationId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        TImestamp: {
            type: DataTypes.DATE,
            allowNull: false
        }
        
    })

    return Application;
}