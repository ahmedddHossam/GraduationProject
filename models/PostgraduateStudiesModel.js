const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define("PostgraduateStudies", {

        personalPhoto: {
            type: DataTypes.STRING,
            allowNull: true
        },


    });
}