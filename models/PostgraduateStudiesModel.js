const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const PostgraduateStudies = Sequelize.define("PostgraduateStudies" , {
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
        militaryCertificate: {
            type: DataTypes.STRING,
            allowNull: false
        },
        officersApproval: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Passport: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dataForm: {
            type: DataTypes.STRING,
            allowNull: false
        },
        informationForm: {
            type: DataTypes.STRING,
            allowNull: false
        },
        diplomaCertificate: {
            type: DataTypes.STRING,
            allowNull: false
        },
        candidacyLetter: {
            type: DataTypes.STRING,
            allowNull: false
        },
        adisCertificate: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Timestamp: {
            type: DataTypes.DATE,
            allowNull: false
        }
        
    })

    return PostgraduateStudies;
}