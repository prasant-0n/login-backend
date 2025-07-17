import { Router } from "express";
import { AuthController } from "../controllerd/auth.controller";
import { validateRegistration, handleValidationErrors, validateLogin, validateEmailVerification, validateForgotPassword } from '../middlewares/validate.middleware';
import { authenticate } from "../middlewares/auth.middleware";



const router = Router();
const authController = new AuthController();

// POST /api/auth/register  -----> for user registration
router.post('/register', validateRegistration(), handleValidationErrors, authController.register);

// POST /api/auth/login  -----> for user login
router.post('/login', validateLogin(), handleValidationErrors, authController.login);

// POST /api/auth/logout  -----> for logging out user
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/profile  -----> for getting user profile
router.get('/refresh-token', authController.refreshToken);

//POST /api/auth/verify-email  -----> for email verification
router.post('/verify-email', validateEmailVerification(), handleValidationErrors, authController.verifyEmail);

// POST /api/auth/update-profile  -----> for updating user profile
router.post('/forgot-password', validateForgotPassword(), handleValidationErrors, authController.forgotPassword);

// POST /api/auth/reset-password  -----> for resetting user password
router.post('/reset-password', authenticate, authController.resetPassword);

export default router;
