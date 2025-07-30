const AdminService = require('../db/services/AdminService');
const ValidationError = require('../utils/ValidationError');
const { ValidationMsgs, TableFields, InterfaceTypes } = require('../utils/constants');
const Util = require("../utils/util");

//This admin will be added by directly through postman
exports.addAdminUser = async (req) => {
    if (!Util.parseBoolean(req.headers.dbuser)) {
        throw new ValidationError(ValidationMsgs.NotAllowed);
    }
    await AdminService.insertUserRecord(req.body);

    let email = req.body[TableFields.email];
    email = (email + '').trim().toLowerCase();
    let user = await AdminService.findByEmail(email)
        .withPassword()
        .withBasicInfo()
        .execute();

    const token = user.createAuthToken(InterfaceTypes.Admin.AdminWeb);
    await AdminService.saveAuthToken(user[TableFields.ID], token);

    return { user, token };
};

exports.login = async (req) => {
    let email = req.body[TableFields.email];
    if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
    email = (email + "").trim().toLowerCase();

    const password = req.body[TableFields.password];
    if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);

    let user = await AdminService.findByEmail(email)
        .withPassword()
        .withBasicInfo()
        .execute();
    if (user && (await user.isValidAuth(password))) {
        const token = user.createAuthToken(InterfaceTypes.Admin.AdminWeb);
        await AdminService.saveAuthToken(user[TableFields.ID], token);
        return { user, token }
    } else throw new ValidationError(ValidationMsgs.UnableToLogin);
};

exports.logout = async (req) => {
    const headerToken = req.header("Authorization").replace("Bearer ", "");
    await AdminService.removeAuth(req.user[TableFields.ID], headerToken);
};
