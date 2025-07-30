const API = require('../utils/apiBuilder');
const AdminController = require('../controllers/AdminController');
const RoleController = require('../controllers/RoleController');
const { TableFields } = require('../utils/constants');

const router = API.configRoute('/admin')
    .addPath('/signup')
    .asPOST(AdminController.addAdminUser)
    .build()

    .addPath('/login')
    .asPOST(AdminController.login)
    .build()

    .addPath('/logout')
    .asPOST(AdminController.logout)
    .useAdminAuth()
    .build()

    //Roles Routes
    .addPath('/role/add')
    .asPOST(RoleController.addRole)
    .useAdminAuth()
    .build()

    .addPath('/role/list')
    .asGET(RoleController.listRoles)
    .useAdminAuth()
    .build()

    .addPath(`/role/details/:${TableFields.ID}`)
    .asGET(RoleController.getRoleDetails)
    .useAdminAuth()
    .build()


    .getRouter();

module.exports = router;
