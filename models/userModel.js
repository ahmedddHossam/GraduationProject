const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const User = Sequelize.define("user" , {
        UserId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        Password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [8, 100]
            }
        },
        UserName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role : {
            type : DataTypes.STRING,
            allowNull: false,
        }
    })

    return User;
}