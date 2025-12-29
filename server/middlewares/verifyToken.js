import jwt from 'jsonwebtoken';
import AppError from "../utils/app_error.js";
import httpStatusText from '../utils/httpStatusText.js';
import { handleJWTError } from '../utils/jwt_error_handler.js';


export const verifyToken = (req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        const error = AppError.create("unauthorized -no token provided", 401, httpStatusText.ERROR)
        return next(error);
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            const error = AppError.create("unauthorized -invalid token", 401, httpStatusText.ERROR)
            return next(error);
        }
        req.user= decoded;
        next();
    } catch (err) {
     handleJWTError(err,next);
    }
};
