const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define("PostgraduateStudies", {
        applicationId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name:{
            type: DataTypes.STRING,
            allowNull: false
        },
        Studies: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        bachelorsCertificate: {
            type: DataTypes.STRING,
            allowNull: false
        },
        birthCertificate: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nationalIdCard: {
            type: DataTypes.STRING,
            allowNull: false
        },
        workplaceApproval: {
            type: DataTypes.STRING,
            allowNull: false
        },
        armedForcesApproval: {
            type: DataTypes.STRING,
            allowNull: false
        },
        scoreReport: {
            type: DataTypes.STRING,
            allowNull: false
        },
        personalPhoto: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone:{
            type: DataTypes.STRING,
            allowNull: false
        },
        email:{
            type: DataTypes.STRING,
            allowNull: false
        },
        program:{
            type: DataTypes.STRING,
            allowNull: false
        },
        nationalID:{
            type: DataTypes.STRING,
            allowNull: false
        },
        nationality:{
            type:DataTypes.STRING,
            allowNull: false
        }

    });
}
