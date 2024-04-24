const { Sequelize, DataTypes } = require("sequelize");

module.exports = (Sequelize, DataTypes) => {
    const Post = Sequelize.define("post" , {
        PostId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Body: {
            type: DataTypes.STRING,
            allowNull: false
        }
        
    })

    return Post;
}