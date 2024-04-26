const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const Admin = Sequelize.define("admin" , {
        AdminId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        
    })

    return Admin;
}