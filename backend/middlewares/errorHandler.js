const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    let statusCode = 500;
    let message = 'Something went wrong';
  
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(err.errors).map(val => val.message).join(', ');
    } else if (err.name === 'CastError') {
      statusCode = 404;
      message = 'Resource not found';
    } else if (err.code === 11000) {
      statusCode = 400;
      message = 'Duplicate field value entered';
    } else if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Not authorized, token failed';
    }
  
    res.status(statusCode).json({
      success: false,
      error: message
    });
  };
  
  module.exports = errorHandler;