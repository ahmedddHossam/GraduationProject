const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define("PostgraduateStudies", {
        applicationId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
            allowNull: true
        },
    });
}
