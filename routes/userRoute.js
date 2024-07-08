const express = require('express');
const userDataValidator = require('../middleware/UserDataValidator');
const route = express.Router();

const authController = require('../Controllers/AuthController')
const allowedTo = require("../middleware/allowedTo");
const TokenManipulation = require("../utils/TokenManipulation");

route.route('/signup')
    .post(TokenManipulation.verifyToken,allowedTo(["Super Admin"]),authController.signUp)

route.route('/login')
    .post(authController.logIn);

route.route('/logout').
get(authController.logOut);

module.exports=route;