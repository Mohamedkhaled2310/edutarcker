import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { asyncWrapper } from '../middlewares/asyncWrapper.js';
import appError from '../utils/app_error.js';
import httpStatusText from '../utils/httpStatusText.js';
import { validateRegisterUser, validateLoginUser, validateRegisterAdmin } from '../models/user.js';
import { models } from '../utils/db_instance.js';
const{User}=models; 
/**
 * @desc    Bootstrap Admin (ONE TIME)
 * @method  POST
 * @route   POST /api/auth/register-admin
 * @access  public (temporary)
 */
const registerAdmin = asyncWrapper(async (req, res, next) => {
  const adminExists = await User.findOne({ where: { role: 'admin' } });
  if (adminExists) {
    return next(
      appError.create('Admin already exists', 403, httpStatusText.FAIL)
    );
  }

  const { error } = validateRegisterAdmin(req.body);
  if (error) {
    return next(appError.create(error.details[0].message, 400, httpStatusText.FAIL));
  }

  const existingEmail = await User.findOne({
    where: { email: req.body.email }
  });
  if (existingEmail) {
    return next(appError.create('Email already exists', 400, httpStatusText.FAIL));
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const admin = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    phone: req.body.phone,
    role: 'admin'
  });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: 'Admin created successfully',
    data: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    }
  });
});

/**
/**
 * @desc  login user  
 * @router /api/auth/login 
 * @method POST 
 * @access public 
 */
const loginUser = asyncWrapper(async (req, res, next) => {
  const { error } = validateLoginUser(req.body);
  if (error) {
    return next(appError.create(error.details[0].message, 400, httpStatusText.FAIL))
  }
  const user = await User.findOne({
    where: { email: req.body.email }
  });
  if (!user) {
    return next(appError.create("invaild email or password", 400, httpStatusText.FAIL))
  }
  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) {
    return next(appError.create("invalid password", 400, httpStatusText.FAIL));
  }
  const token = generateJwtAndSetcookie(res, user.id, user.role);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "user logged in successfully",
    token
  });
});
/**
 * @desc    Logout user (clear cookie)
 * @method POST
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncWrapper(async (req, res, next) => {
  // Clear the JWT cookie
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: 'Logged out successfully'
  });
});
export {
  registerAdmin,
  loginUser,
  logout
}