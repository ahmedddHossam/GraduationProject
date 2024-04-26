const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const Company = Sequelize.define("company" , {
        CompanyId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        CompanyName: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })

    return Company;
}