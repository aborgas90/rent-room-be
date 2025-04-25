const {ResponseError} = require("../error/error-response");


const errorMiddleware = async (err, req, res, next) => {
    console.error('Error occurred:', err.stack);
    if (!err) {
        next();
        return;
    }

    if (err instanceof ResponseError) {
        res.status(err.status).json({
            errors: err.message
        }).end();
    }  else {
        res.status(500).json({
            errors: err.message
        }).end();
    }
}

module.exports = {
    errorMiddleware
}