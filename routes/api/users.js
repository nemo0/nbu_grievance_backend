const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router
  .route('/')
  .get(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.User),
    usersController.getAllUsers
  );

router.get(
  '/profile',
  verifyRoles(
    ROLES_LIST.Admin,
    ROLES_LIST.Department,
    ROLES_LIST.Editor,
    ROLES_LIST.User
  ),
  usersController.getProfile
);

router
  .route('/:id')
  .get(verifyRoles(ROLES_LIST.Admin), usersController.getUser)
  .delete(verifyRoles(ROLES_LIST.Admin), usersController.deleteUser);

module.exports = router;
