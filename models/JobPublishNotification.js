module.exports = (db,type)=> {
    return db.define('JobPublishNotification',{
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        IsDisplayed:{
            type: type.BOOLEAN, // Ensure this is a valid datatype
            defaultValue: false
        }
    })
}
