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
        graduateID: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nationalID:{
            type: DataTypes.STRING,
            allowNull: false
        },
        Timestamp: {
            type: DataTypes.DATE,
            allowNull: false
        },
        newRequest:{
            type: DataTypes.STRING,
            allowNull:false,
        },
        NumberOfPapers:{
            type:DataTypes.INTEGER,
            allowNull:true
        }

    })

    return Request;
}