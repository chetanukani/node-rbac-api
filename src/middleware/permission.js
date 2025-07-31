const {
    ValidationMsgs,
    Permissions,
    ResponseStatus,
} = require('../utils/constants');
const ValidationError = require('../utils/ValidationError');
const Util = require('../utils/util');
const permission = async (req, res, next) => {
    try {
        let hasPermission = false;
        switch (req.method) {
            case 'GET':
                hasPermission = req.user.roleRef.permissions.some(
                    (permission) =>
                        permission.module == req.headers.module &&
                        (permission.permissions.includes(Permissions.All) ||
                            permission.permissions.includes(Permissions.View))
                );
                break;
            case 'POST':
                hasPermission = req.user.roleRef.permissions.some(
                    (permission) =>
                        permission.module == req.headers.module &&
                        (permission.permissions.includes(Permissions.All) ||
                            permission.permissions.includes(Permissions.Add))
                );
                break;
            case 'PATCH':
                hasPermission = req.user.roleRef.permissions.some(
                    (permission) =>
                        permission.module == req.headers.module &&
                        (permission.permissions.includes(Permissions.All) ||
                            permission.permissions.includes(Permissions.Edit))
                );
                break;
            case 'DELETE':
                hasPermission = req.user.roleRef.permissions.some(
                    (permission) =>
                        permission.module == req.headers.module &&
                        (permission.permissions.includes(Permissions.All) ||
                            permission.permissions.includes(Permissions.Delete))
                );
                break;
            default:
                hasPermission = false;
        }
        if (!hasPermission)
            throw new ValidationError(ValidationMsgs.SufficientPermission);
        next();
    } catch (error) {
        res.json({
            code: ResponseStatus.BadRequest,
            message: Util.getErrorMessageFromString(
                ValidationMsgs.SufficientPermission
            ),
        });
    }
};
module.exports = permission;
