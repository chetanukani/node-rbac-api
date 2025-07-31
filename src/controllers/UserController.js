const RoleService = require('../db/services/RoleService');
const UserService = require('../db/services/UserService');
const ValidationError = require('../utils/ValidationError');
const {
    ValidationMsgs,
    TableFields,
    InterfaceTypes,
} = require('../utils/constants');
const Util = require('../utils/util');

exports.login = async (req) => {
    let { email, password } = req.body;
    if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
    email = (email + '').trim().toLowerCase();

    if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);

    let user = await UserService.findByEmail(email)
        .withPassword()
        .withBasicInfo()
        .execute();
    if (user && (await user.isValidAuth(password))) {
        const token = user.createAuthToken(InterfaceTypes.User.UserWeb);
        await UserService.saveAuthToken(user[TableFields.ID], token);
        return { user, token };
    } else throw new ValidationError(ValidationMsgs.UnableToLogin);
};

exports.logout = async (req) => {
    const headerToken = req.header('Authorization').replace('Bearer ', '');
    await UserService.removeAuth(req.user[TableFields.ID], headerToken);
};

exports.signUp = async (req) => {
    let { firstName, lastName, roleRef, email, password } = req.body;

    if (!firstName || !lastName || !roleRef || !email || !password) {
        throw new ValidationError(ValidationMsgs.ParamerError);
    }

    email = (email + '').trim().toLowerCase();
    const roleDetails = await RoleService.getRoleById(roleRef)
        .withId()
        .execute();
    if (!roleDetails) {
        throw new ValidationError(ValidationMsgs.RecordNotFound);
    }
    const obj = {
        [TableFields.firstName]: firstName,
        [TableFields.lastName]: lastName,
        [TableFields.roleRef]: roleRef,
        [TableFields.password]: password,
    };
    await UserService.addUser(email, obj);

    let user = await UserService.findByEmail(email)
        .withPassword()
        .withBasicInfo()
        .execute();

    const token = user.createAuthToken(InterfaceTypes.User.UserWeb);
    await UserService.saveAuthToken(user[TableFields.ID], token);

    return { user, token };
};

//This admin will be added by directly through postman
exports.addUser = async (req) => {
    const { firstName, lastName, roleRef, email } = req.body;
    if (!firstName || !lastName || !roleRef || !email) {
        throw new ValidationError(ValidationMsgs.ParamerError);
    }

    const roleDetails = await RoleService.getRoleById(roleRef)
        .withId()
        .execute();
    if (!roleDetails) {
        throw new ValidationError(ValidationMsgs.RecordNotFound);
    }

    const obj = {
        [TableFields.firstName]: firstName,
        [TableFields.lastName]: lastName,
        [TableFields.roleRef]: roleRef,
    };
    const details = await UserService.addUser(email, obj);
    console.log(details);
    //TODO: Will sent an email with password
    //For testing perpose I am sending password with return
};

exports.listUser = async (req) => {
    return await UserService.listUser(req.query)
        .withBasicInfo()
        .populateRole()
        .execute();
};

exports.getUserDetails = async (req) => {
    const userId = req.params[TableFields.ID];
    const userDetails = await UserService.getUserById(userId)
        .withBasicInfo()
        .populateRole()
        .execute();
    if (!userDetails) {
        throw new ValidationError(ValidationMsgs.RecordNotFound);
    }
    return userDetails;
};

//Permission based access
exports.addCategory = async (req) => {
    //And user have Add permision in category module then they can access this API
    return { response: 'User have Add permission in Category module' };
};

exports.getCategoryDetails = async (req) => {
    //And user have get permision in category module then they can access this API
    return { response: 'User have get permission in Category module' };
};

exports.updateCategory = async (req) => {
    //And user have update permision in category module then they can access this API
    return { response: 'User have update permission in Category module' };
};

exports.deleteCategory = async (req) => {
    //And user have delete permision in category module then they can access this API
    return { response: 'User have delete permission in Category module' };
};
