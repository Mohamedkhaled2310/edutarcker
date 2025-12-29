/**
 * @desc  Register New User 
 * @router /api/auth/register 
 * @method POST 
 * @access public 
 */
// validate Register User
//is user already exsits 
//hash the password
//new user and save it to DB 
// send response to user 


/**
 * @desc  login user  
 * @router /api/auth/login 
 * @method POST 
 * @access public 
*/

//1. validation 
//2. is user exist
//3. check the password 
//4. generate token (jwt) 
//5. response to client 
//6. sending email (verify account if not verifed )


/**
 * @desc    Logout user (clear cookie)
 * @method  POST
 * @route   POST /api/auth/logout
 * @access  private
 */

const logout = asyncWrapper(async (req, res, next) => {
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