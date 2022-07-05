const express = require('express');
const router = express.Router();
const grievanceController = require('../../controllers/grievanceController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router
  .route('/')
  .get(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.User),
    grievanceController.getAllGrievances
  )
  .post(
    verifyRoles(
      ROLES_LIST.Admin,
      ROLES_LIST.User,
      ROLES_LIST.Editor,
      ROLES_LIST.Department
    ),
    grievanceController.createNewGrievance
  );

router
  .route('/:id')
  .get(grievanceController.getGrievance)
  .put(verifyRoles(ROLES_LIST.Admin), grievanceController.updateGrievance)
  .delete(verifyRoles(ROLES_LIST.Admin), grievanceController.deleteGrievance);

module.exports = router;
