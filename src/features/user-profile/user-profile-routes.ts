import { Router } from 'express';

import { asyncHandler } from '~/utils/async-handler.js';

import {
  deleteUserProfile,
  getAllUserProfiles,
  getUserProfileById,
  updateUserProfile,
} from './user-profile-controller.js';

const router = Router();

router.get('/', asyncHandler(getAllUserProfiles));
router.get('/:id', asyncHandler(getUserProfileById));
router.patch('/:id', asyncHandler(updateUserProfile));
router.delete('/:id', asyncHandler(deleteUserProfile));

export { router as userProfileRoutes };
