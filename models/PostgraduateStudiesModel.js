const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const PostgraduateStudies = sequelize.define("PostgraduateStudies" , {

        personalPhoto: {
            type: DataTypes.STRING,
            allowNull: true
        },

        
    })

    return PostgraduateStudies;
}