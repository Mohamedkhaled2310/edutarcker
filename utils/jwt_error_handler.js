import AppError from "../utils/app_error.js";
import httpStatusText from "../utils/httpStatusText.js";
export const handleJWTError = (err, next) => {
    if (err.name === "TokenExpiredError") {
        const error = AppError.create("Unauthorized - token expired", 401, httpStatusText.ERROR);
        return next(error);
    } else if (err.name === "JsonWebTokenError") {
        const error = AppError.create("Unauthorized - invalid token", 401, httpStatusText.ERROR);
        return next(error);
    } else {
        console.error("JWT Error:", err);
        const error = AppError.create("Server error", 500, httpStatusText.ERROR);
        return next(error);
    }
};