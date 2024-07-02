const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const Skill = Sequelize.define("skill" , {
        skillId:{
            type: DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique : true
        }
    })
    return Skill;
}