const express = require('express');
const userDataValidator = require('../middleware/UserDataValidator');
const route = express.Router();

const authController = require('../Controllers/AuthController')

route.route('/signup')
    .post(userDataValidator,authController.signUp)

route.route('/login')
    .post(authController.logIn);

route.route('/logout').
get(authController.logOut);

module.exports=route;