import { Router } from 'express';

import {
  deleteUserProfile,
  getAllUserProfiles,
  getUserProfileById,
  updateUserProfile,
} from './user-profile-controller.js';

const router = Router();

router.get('/', getAllUserProfiles);
router.get('/:id', getUserProfileById);
router.patch('/:id', updateUserProfile);
router.delete('/:id', deleteUserProfile);

export { router as userProfileRoutes };
