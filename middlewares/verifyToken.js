import jwt from 'jsonwebtoken';
import AppError from "../utils/app_error.js";
import httpStatusText from '../utils/httpStatusText.js';
import { handleJWTError } from '../utils/jwt_error_handler.js';


export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      AppError.create(
        "unauthorized - no token provided",
        401,
        httpStatusText.ERROR
      )
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    handleJWTError(err, next);
  }
};

