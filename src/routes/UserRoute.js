const API = require('../utils/apiBuilder');
const UserController = require('../controllers/UserController');
const { TableFields } = require('../utils/constants');

const router = API.configRoute('/user')
    .addPath('/add')
    .asPOST(UserController.addUser)
    .useAdminAuth()
    .build()

    .addPath('/list')
    .asGET(UserController.listUser)
    .useAdminAuth()
    .build()

    .addPath(`/details/:${TableFields.ID}`)
    .asGET(UserController.getUserDetails)
    .useAdminAuth()
    .build()

    .addPath('/login')
    .asPOST(UserController.login)
    .build()

    .addPath('/signup')
    .asPOST(UserController.signUp)
    .build()

    .addPath('/logout')
    .asPOST(UserController.logout)
    .useUserAuth()
    .build()

    //Role and Permission based routes for demonstrate
    .addPath('/category/add')
    .asPOST(UserController.addCategory)
    .usePermissionAuth()
    .useUserAuth()
    .build()

    .addPath('/category/details')
    .asGET(UserController.getCategoryDetails)
    .usePermissionAuth()
    .useUserAuth()
    .build()

    .addPath('/category/update')
    .asUPDATE(UserController.updateCategory)
    .usePermissionAuth()
    .useUserAuth()
    .build()

    .addPath('/category/delete')
    .asDELETE(UserController.deleteCategory)
    .usePermissionAuth()
    .useUserAuth()
    .build()

    .getRouter();

module.exports = router;
