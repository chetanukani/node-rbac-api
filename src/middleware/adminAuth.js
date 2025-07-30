const jwt = require("jsonwebtoken");
const {
    ValidationMsgs,
    TableFields,
    UserTypes,
    InterfaceTypes,
    ResponseStatus,
    AuthTypes
} = require("../utils/constants");
const Util = require("../utils/util");
const ValidationError = require("../utils/ValidationError");
const AdminService = require("../db/services/AdminService");

const auth = async (req, res, next) => {
    try {
        const headerToken = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(headerToken, process.env.JWT_ADMIN_PK || 'top-secret');
        const admin = await AdminService.getUserByIdAndToken(
            decoded[TableFields.ID],
            headerToken
        )
            .withBasicInfo()
            .execute();

        if (!admin) {
            res.json({
                code: ResponseStatus.Unauthorized,
                message: Util.getErrorMessageFromString(ValidationMsgs.AuthFail),
            });
        }

        req.user = admin;
        next();
    } catch (e) {
        if (!(e instanceof ValidationError)) {
            console.log(e);
        }
        res
            .status(ResponseStatus.Unauthorized)
            .send(Util.getErrorMessageFromString(ValidationMsgs.AuthFail));
    }
};
module.exports = auth;
