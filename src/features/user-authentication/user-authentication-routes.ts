import { Router } from 'express';

import { asyncHandler } from '~/utils/async-handler.js';

import { login, logout, register } from './user-authentication-controller.js';

const router = Router();

router.post('/login', asyncHandler(login));
router.post('/register', asyncHandler(register));
router.post('/logout', asyncHandler(logout));

export { router as userAuthenticationRoutes };
