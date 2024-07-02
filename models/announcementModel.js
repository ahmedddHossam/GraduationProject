const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const announcement = Sequelize.define("announcement" , {
        announcementId:{
            type: DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        Title: {
            type: DataTypes.STRING,
            allowNull: false,
            unique : true
        },
        Description:{
            type: DataTypes.STRING,
            allowNull: false,
            unique : true
        }
    })
    return announcement;
}