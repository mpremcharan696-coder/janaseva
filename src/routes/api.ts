import express from 'express';
import { getSchemes, getSchemeById } from '../controllers/schemesController.js';
import { upsertUserProfile } from '../controllers/userController.js';
import { login, register } from '../controllers/authController.js';

const router = express.Router();

// Scheme endpoints
router.get('/schemes', getSchemes);
router.get('/schemes/:id', getSchemeById);

// User profile endpoints
router.post('/user/profile', upsertUserProfile);

// Auth endpoints
router.post('/auth/login', login);
router.post('/auth/register', register);

export default router;
