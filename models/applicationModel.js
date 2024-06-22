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
            defaultValue : "Pending"
        },
        TImestamp: {
            type: DataTypes.DATE,
            allowNull: false
        },
        cvPath : DataTypes.STRING


    })

    return Application;
}