class AppError extends Error {
    constructor(){
        super();
    }

    create(message,statusCode,statusText){
        this.message = message;
        ths.statusCode = statusCode;
        this.statusText = statusText;
        return this;
    }

}

module.exports = new AppError();
