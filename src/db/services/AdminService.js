const { TableFields, ValidationMsgs } = require('../../utils/constants');
const Util = require('../../utils/util');
const ValidationError = require('../../utils/ValidationError');
const Admin = require('../models/admin');
const { MongoUtil } = require('../mongoose');

class AdminService {
    static findByEmail = (email) => {
        return new ProjectionBuilder(async function () {
            return await Admin.findOne({ [TableFields.email]: email }, this);
        });
    };

    static getUserByIdAndToken = (userId, token) => {
        return new ProjectionBuilder(async function () {
            return await Admin.findOne(
                {
                    [TableFields.ID]: userId,
                    [TableFields.tokens + "." + TableFields.token]: token,
                },
                this
            );
        });
    };

    static saveAuthToken = async (userId, token) => {
        await Admin.updateOne(
            {
                [TableFields.ID]: userId,
            },
            {
                $push: {
                    [TableFields.tokens]: { [TableFields.token]: token },
                },
            }
        );
    };

    static existsWithEmail = async (email, exceptionId) => {
        return await Admin.exists({
            [TableFields.email]: email,
            ...(exceptionId
                ? {
                      [TableFields.ID]: { $ne: exceptionId },
                  }
                : {}),
        });
    };

    static insertUserRecord = async (reqBody) => {
        let email = reqBody[TableFields.email];
        email = (email + '').trim().toLocaleLowerCase();
        const password = reqBody[TableFields.password];

        if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
        if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);

        if (await AdminService.existsWithEmail(email))
            throw new ValidationError(ValidationMsgs.DuplicateEmail);

        const user = new Admin(reqBody);
        if (!user.isValidPassword(password)) {
            throw new ValidationError(ValidationMsgs.PasswordInvalid);
        }
        try {
            await user.save();
            return user;
        } catch (error) {
            if (error.code == 11000) {
                //Mongoose duplicate email error
                throw new ValidationError(ValidationMsgs.DuplicateEmail);
            }
            throw error;
        }
    };

    static removeAuth = async (adminId, authToken) => {
        await Admin.updateOne(
            {
                [TableFields.ID]: adminId,
            },
            {
                $pull: {
                    [TableFields.tokens]: { [TableFields.token]: authToken },
                },
            }
        );
    };
}

const ProjectionBuilder = class {
    constructor(methodToExecute) {
        const projection = {
            populate: {},
        };
        this.withId = () => {
            projection[TableFields.ID] = 1;
            return this;
        };

        this.withBasicInfo = () => {
            projection[TableFields.name_] = 1;
            projection[TableFields.email] = 1;
            return this;
        };
        this.withPassword = () => {
            projection[TableFields.password] = 1;
            return this;
        };

        const putInPopulate = (path, selection, model, deepPopulateObj) => {
            if (projection.populate[path]) {
                let existingRecord = projection.populate[path];
                existingRecord.select += ' ' + selection;
                projection.populate[path] = existingRecord;
            } else {
                projection.populate[path] = {
                    path: path,
                    select: selection,
                    model,
                    populate: deepPopulateObj,
                };
            }
        };

        this.execute = async () => {
            if (Object.keys(projection.populate) == 0) {
                delete projection.populate;
            } else {
                projection.populate = Object.values(projection.populate);
            }
            return await methodToExecute.call(projection);
        };
    }
};

module.exports = AdminService;
