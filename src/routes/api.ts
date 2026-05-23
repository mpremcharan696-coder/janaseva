import express from 'express';
import { getSchemes, getSchemeById } from '../controllers/schemesController.js';
import { upsertUserProfile } from '../controllers/userController.js';
import { login, register } from '../controllers/authController.js';
import { chat, analyze, verify } from '../controllers/geminiController.js';
import { getHistory, saveMessage } from '../controllers/chatController.js';

const router = express.Router();

// Scheme endpoints
router.get('/schemes', getSchemes);
router.get('/schemes/:id', getSchemeById);

// User profile endpoints
router.post('/user/profile', upsertUserProfile);

// Auth endpoints
router.post('/auth/login', login);
router.post('/auth/register', register);

// Chat history endpoints
router.get('/chat/:userId/history', getHistory);
router.post('/chat/:userId/message', saveMessage);

// Gemini AI endpoints
router.post('/gemini/chat', chat);
router.post('/gemini/eligibility', analyze);
router.post('/gemini/verify', verify);

export default router;
