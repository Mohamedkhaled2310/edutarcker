import appError from "../utils/app_error.js";
import httpStatusText from "../utils/httpStatusText.js";

/**
 * Middleware to authorize users based on their roles
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'teacher', 'student')
 * @returns {Function} Express middleware function
 */
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(appError.create("Unauthorized - Please login first", 401, httpStatusText.ERROR));
        }

        if (!roles.includes(req.user.role)) {
            return next(appError.create(
                `Access denied - This action requires one of the following roles: ${roles.join(', ')}`,
                403,
                httpStatusText.FAIL
            ));
        }

        next();
    };
};
