const RoleService = require('../db/services/RoleService');
const UserService = require('../db/services/UserService');
const ValidationError = require('../utils/ValidationError');
const {
    ValidationMsgs,
    TableFields,
    InterfaceTypes,
} = require('../utils/constants');
const Util = require('../utils/util');

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
