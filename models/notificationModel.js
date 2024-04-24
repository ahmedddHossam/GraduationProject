const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const Notification = Sequelize.define("notification" , {
        notificationId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Body: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Timestamp: {
            type: DataTypes.DATE,
            allowNull: false
        }
        
    })

    return Notification;
}