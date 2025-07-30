const RoleService = require('../db/services/RoleService');
const ValidationError = require('../utils/ValidationError');
const {
    ValidationMsgs,
    TableFields,
    InterfaceTypes,
} = require('../utils/constants');
const Util = require('../utils/util');

exports.addRole = async (req) => {
    const { name, permissions = [] } = req.body;
    if (!name || !permissions.length) {
        throw new ValidationError(ValidationMsgs.ParamerError);
    }
    const obj = {
        name,
        permissions,
    };
    await RoleService.addRole(obj);
};

exports.getRoleDetails = async (req) => {
    const roleId = req.params[TableFields.ID];
    const roleDetails = await RoleService.getRoleById(roleId)
        .withBasicInfo()
        .execute();
    if (!roleDetails) {
        throw new ValidationError(ValidationMsgs.RecordNotFound);
    }
    return roleDetails;
};

exports.listRoles = async (req) => {
    return await RoleService.listRoles(req.query).withBasicInfo().execute()
};
