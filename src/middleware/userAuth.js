const jwt = require('jsonwebtoken');

const ValidationError = require('../utils/ValidationError');
const {
    ValidationMsgs,
    ResponseStatus,
    TableFields,
} = require('../utils/constants');
const Util = require('../utils/util');
const UserService = require('../db/services/UserService');

const auth = async (req, res, next) => {
    try {
        const headerToken = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(
            headerToken,
            process.env.JWT_USER_PK || 'top-secret'
        );
        const user = await UserService.getUserByIdAndToken(
            decoded[TableFields.ID],
            headerToken
        )
            .withBasicInfo()
            .populateRole()
            .execute();

        if (!user) {
            res.json({
                code: ResponseStatus.Unauthorized,
                message: Util.getErrorMessageFromString(
                    ValidationMsgs.AuthFail
                ),
            });
        }

        req.user = user;
        next();
    } catch (e) {
        if (!(e instanceof ValidationError)) {
            console.log(e);
        }
        res.status(ResponseStatus.Unauthorized).send(
            Util.getErrorMessageFromString(ValidationMsgs.AuthFail)
        );
    }
};

module.exports = auth;
