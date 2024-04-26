const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const superAdmin = Sequelize.define("superadmin" , {
        superAdminId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        
    })

    return superAdmin;
}