const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const PostgraduateStudies = Sequelize.define("PostgraduateStudies" , {
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
            allowNull: false,
            defaultValue:"Pending"
        },
        nationalIDORPassport: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone:{
            type:DataTypes.STRING,
            allowNull:false
        },program:{
            type:DataTypes.STRING,
            allowNull:false
        },email:{
            type:DataTypes.STRING,
            allowNull:false
        },Name:{
            type:DataTypes.STRING,
            allowNull:false
        },
        nationality:{
            type:DataTypes.STRING,
            allowNull:false
        },
        bachelorsCertificate: {
            type: DataTypes.STRING,
            allowNull: false
        },
        birthCertificate: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nationalIdCardOrPassport: {
            type: DataTypes.STRING,
            allowNull: true
        },
        workplaceApproval: {
            type: DataTypes.STRING,
            allowNull: true
        },
        armedForcesApproval: {
            type: DataTypes.STRING,
            allowNull: true
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
            allowNull: true
        },
        officersApproval: {
            type: DataTypes.STRING,
            allowNull: true
        },
        dataForm: {
            type: DataTypes.STRING,
            allowNull: true
        },
        informationForm: {
            type: DataTypes.STRING,
            allowNull: true
        },
        diplomaCertificate: {
            type: DataTypes.STRING,
            allowNull: true
        },
        candidacyLetter: {
            type: DataTypes.STRING,
            allowNull: true
        },
        adisCertificate: {
            type: DataTypes.STRING,
            allowNull: true
        },

        
    })

    return PostgraduateStudies;
}