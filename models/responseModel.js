const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const Response = Sequelize.define("response" , {
        responseId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Body: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Timestamp: {
            type: DataTypes.DATE,
            allowNull: false
        }
        
    })

    return Response;
}