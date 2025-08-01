const {
    TableFields,
    ValidationMsgs,
    TableNames,
    ActivationStatusTypes,
} = require('../../utils/constants');
const Util = require('../../utils/util');
const ValidationError = require('../../utils/ValidationError');
const Role = require('../models/rolesAndPermission');
const User = require('../models/user');
const { MongoUtil } = require('../mongoose');

class UserService {
    static findByEmail = (email) => {
        return new ProjectionBuilder(async function () {
            return await User.findOne({ [TableFields.email]: email }, this);
        });
    };

    static getUserById = (recordId, lean = false) => {
        return new ProjectionBuilder(async function () {
            let populateFields = this.populate;
            let projectionFields = {
                ...this,
            };
            delete projectionFields.populate;

            return await User.findById(
                MongoUtil.toObjectId(recordId),
                projectionFields
            )
                .populate(populateFields)
                .lean(lean);
        });
    };

    static existsWithEmail = async (email, exceptionId) => {
        return await User.exists({
            [TableFields.email]: email,
            ...(exceptionId
                ? {
                      [TableFields.ID]: { $ne: exceptionId },
                  }
                : {}),
        });
    };

    static getUserByIdAndToken = (userId, token) => {
        return new ProjectionBuilder(async function () {
            let populateFields = this.populate;
            let projectionFields = {
                ...this,
            };
            delete projectionFields.populate;
            return await User.findOne(
                {
                    [TableFields.ID]: userId,
                    [TableFields.tokens + '.' + TableFields.token]: token,
                },
                projectionFields
            ).populate(populateFields);
        });
    };

    static addUser = async (email, userObj = {}) => {
        if (email && (await this.existsWithEmail(email))) {
            throw new ValidationError(ValidationMsgs.DuplicateEmail);
        }

        // const newPassword = Util.generateRandomPassword(8, true);
        const newPassword = userObj?.[TableFields.password] || 'User@123'; //static for testing
        const user = new User({
            [TableFields.email]: email,
            ...userObj,
            [TableFields.password]: newPassword,
        });
        let error = await user.validate();
        if (error) {
            throw error;
        } else {
            let createdUserRecord = undefined;
            try {
                createdUserRecord = await user.save();
                return { createdUserRecord, password: newPassword };
            } catch (e) {
                if (createdUserRecord) {
                    await createdUserRecord.delete();
                }
                throw e;
            }
        }
    };

    static listUser = (filter = {}) => {
        return new ProjectionBuilder(async function () {
            const limit = filter.limit || 0;
            const skip = filter.skip || 0;
            const sortKey = filter.sortKey || TableFields.name_;
            const sortOrder = filter.sortOrder || 1;
            const needCount = Util.parseBoolean(filter.needCount);
            const state = filter.state || 0; //All
            let searchTerm = filter.searchTerm;

            const searchQuery = {};

            if (state != 0) {
                if (state == 1) {
                    searchQuery[TableFields.active] = true;
                } else {
                    searchQuery[TableFields.active] = false;
                }
            }

            if (searchTerm) {
                searchQuery['$or'] = [
                    {
                        [TableFields.firstName]: {
                            $regex: Util.wrapWithRegexQry(searchTerm),
                            $options: 'i',
                        },
                    },
                    {
                        [TableFields.lastName]: {
                            $regex: Util.wrapWithRegexQry(searchTerm),
                            $options: 'i',
                        },
                    },
                ];
            }

            let populateFields = this.populate;
            let projectionFields = {
                ...this,
            };
            delete projectionFields.populate;

            return await Promise.all([
                needCount ? User.countDocuments(searchQuery) : undefined,
                User.find(searchQuery, projectionFields)
                    .limit(parseInt(limit))
                    .skip(parseInt(skip))
                    .sort({ [sortKey]: parseInt(sortOrder) })
                    .populate(populateFields),
            ]).then(([total, records]) => ({ total, records }));
        });
    };

    static saveAuthToken = async (userId, token) => {
        await User.updateOne(
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

    static removeAuth = async (userId, authToken) => {
        await User.updateOne(
            {
                [TableFields.ID]: userId,
            },
            {
                $pull: {
                    [TableFields.tokens]: { [TableFields.token]: authToken },
                },
            }
        );
    };

    static checkRole = async (roleRef, userId) => {
        return await User.exists({
            [TableFields.ID]: MongoUtil.toObjectId(userId),
            [TableFields.roleRef]: MongoUtil.toObjectId(roleRef),
        });
    };

    static checkRoleAssigned = async (roleRef) => {
        return await User.exists({
            [TableFields.roleRef]: MongoUtil.toObjectId(roleRef),
        });
    };

    static updateManyUsersDetails = async (records = []) => {
        let bulkWriteQry = [];
        records.forEach((a) => {
            bulkWriteQry.push({
                updateOne: {
                    filter: {
                        [TableFields.ID]: MongoUtil.toObjectId(
                            a[TableFields.ID]
                        ),
                    },
                    update: {
                        [TableFields.lastName]: a[TableFields.lastName],
                    },
                },
            });
        });
        await User.bulkWrite(bulkWriteQry);
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

        this.withPassword = () => {
            projection[TableFields.password] = 1;
            return this;
        };

        this.withBasicInfo = () => {
            projection[TableFields.firstName] = 1;
            projection[TableFields.lastName] = 1;
            projection[TableFields.email] = 1;
            projection[TableFields.active] = 1;
            return this;
        };

        this.populateRole = () => {
            putInPopulate(
                TableFields.roleRef,
                {
                    [TableFields.ID]: 1,
                    [TableFields.name_]: 1,
                    [TableFields.permissions]: 1,
                },
                Role.collection.collectionName
            );
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

module.exports = UserService;
