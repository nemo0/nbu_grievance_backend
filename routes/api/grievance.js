const express = require('express');
const router = express.Router();
const grievanceController = require('../../controllers/grievanceController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const { verify } = require('jsonwebtoken');

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
  .route(
    '/my',
    verifyRoles(
      ROLES_LIST.User,
      ROLES_LIST.Admin,
      ROLES_LIST.Department,
      ROLES_LIST.Editor
    )
  )
  .get(grievanceController.myGrievances);

router
  .route('/:id')
  .get(grievanceController.getGrievance)
  .put(verifyRoles(ROLES_LIST.Admin), grievanceController.updateGrievance)
  .delete(verifyRoles(ROLES_LIST.Admin), grievanceController.deleteGrievance);

router
  .route('/department/my')
  .get(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Department),
    grievanceController.getGrievanceByMyDepartment
  );

router
  .route('/comments/:id')
  .post(
    verifyRoles(
      ROLES_LIST.Admin,
      ROLES_LIST.User,
      ROLES_LIST.Editor,
      ROLES_LIST.Department
    ),
    grievanceController.addComment
  );

router
  .route('/close/:id')
  .put(verifyRoles(ROLES_LIST.Admin), grievanceController.closeGrievance);

router
  .route('/mail/:id')
  .post(
    verifyRoles(
      ROLES_LIST.Admin,
      ROLES_LIST.Department,
      ROLES_LIST.Editor,
      ROLES_LIST.User
    ),
    grievanceController.sendMailToCreator
  );

module.exports = router;
