// utils/errors.js

class CustomError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class BadRequestError extends CustomError {
    constructor(message, errors = []) {
        super(message, 400);
        this.errors = errors;
    }
}

class NotFoundError extends CustomError {
    constructor(message) {
        super(message, 404);
    }
}

class UnauthorizedError extends CustomError {
    constructor(message) {
        super(message, 401);
    }
}

class ForbiddenError extends CustomError {
    constructor(message) {
        super(message, 403);
    }
}

module.exports = {
    CustomError,
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError
};