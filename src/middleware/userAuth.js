const ValidationError = require('../utils/ValidationError');
const { ValidationMsgs, ResponseStatus } = require('../utils/constants');
const Util = require('../utils/util');

const auth = async (res, res, next) => {
    try {
        const headerToken = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(
            headerToken,
            process.env.JWT_USER_PK || 'top-secret'
        );
    } catch (error) {
        if (!(e instanceof ValidationError)) {
            console.log(e);
        }
        res.status(ResponseStatus.Unauthorized).send(
            Util.getErrorMessageFromString(ValidationMsgs.AuthFail)
        );
    }
};
