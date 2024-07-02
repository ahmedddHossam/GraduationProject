const { Sequelize, DataTypes } = require("sequelize");

const graduate = require('./graduateModel');
const skill = require('./skillModel');

module.exports = (Sequelize, DataTypes) => {
    const graduateSkill = Sequelize.define("graduateSkill" , {
        graduateId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Graduates',
                key: 'GraduateId'
            }
        },
        skillId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Skills',
                key: 'skillId'
            }
        }

    })
    return graduateSkill;
}