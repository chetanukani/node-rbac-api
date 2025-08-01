const RoleService = require('../db/services/RoleService');
const UserService = require('../db/services/UserService');
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
    return await RoleService.listRoles(req.query)
        .withBasicInfo()
        .withTimestamp()
        .execute();
};

exports.editRole = async (req) => {
    const roleId = req.params[TableFields.ID];
    const { name, permissions = [] } = req.body;
    if (!name || !permissions.length) {
        throw new ValidationError(ValidationMsgs.ParamerError);
    }
    const roleDetails = await RoleService.getRoleById(roleId)
        .withId()
        .execute();
    if (!roleDetails) {
        throw new ValidationError(ValidationMsgs.RecordNotFound);
    }

    const obj = {
        name,
        permissions,
    };
    await RoleService.editRole(roleId, obj);
};

exports.updateActivationStatus = async (req) => {
    const roleRef = req.params[TableFields.ID];
    const active = Util.parseBoolean(req.body.active);
    await RoleService.statusChange(roleRef, active);
};

exports.deleteRole = async (req) => {
    const roleRef = req.params[TableFields.ID];
    if (await UserService.checkRoleAssigned(roleRef)) {
        throw new ValidationError(ValidationMsgs.RoleAssignedCannotDelete);
    }
    await RoleService.deleteRole(roleRef);
};
