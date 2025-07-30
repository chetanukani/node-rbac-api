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
    console.log(details)
    //TODO: Will sent an email with password
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
