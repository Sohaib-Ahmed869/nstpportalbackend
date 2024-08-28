const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/super-admin-login', authController.superAdminLogin);
router.post('/admin-login', authController.adminLogin);
router.post('/supervisor-login', authController.supervisorLogin);
router.post('/receptionist-login', authController.receptionistLogin);
router.post('/tenant-login', authController.tenantLogin);

module.exports = router;