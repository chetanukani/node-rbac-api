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
    
    .getRouter();

module.exports = router;
