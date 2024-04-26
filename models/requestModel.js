const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const Request = Sequelize.define("request" , {
        requestId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        requestField: {
            type: DataTypes.STRING,
            allowNull: false
        },
        requestStatus: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Timestamp: {
            type: DataTypes.DATE,
            allowNull: false
        }
        
    })

    return Request;
}