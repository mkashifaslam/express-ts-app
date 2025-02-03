import { Router } from 'express';

import { login, logout, register } from './user-authentication-controller.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);

export { router as userAuthenticationRoutes };
