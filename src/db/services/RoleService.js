const { TableFields, ValidationMsgs } = require('../../utils/constants');
const Util = require('../../utils/util');
const ValidationError = require('../../utils/ValidationError');
const Role = require('../models/rolesAndPermission');
const { MongoUtil } = require('../mongoose');

class RoleService {
    static addRole = async (body) => {
        const role = new Role({
            [TableFields.name_]: body[TableFields.name_],
            [TableFields.permissions]: body[TableFields.permissions],
        });

        try {
            await role.save();
        } catch (error) {
            if (error.code == 11000) {
                throw new ValidationError(ValidationMsgs.DuplicateRole);
            }
        }
    };

    static getRoleById = (recordId, lean = false) => {
        return new ProjectionBuilder(async function () {
            return await Role.findById(
                MongoUtil.toObjectId(recordId),
                this
            ).lean(lean);
        });
    };

    static listRoles = (filter = {}) => {
        return new ProjectionBuilder(async function () {
            const limit = filter.limit || 0;
            const skip = filter.skip || 0;
            const sortKey = filter.sortKey || TableFields.name_;
            const sortOrder = filter.sortOrder || 1;
            const needCount = Util.parseBoolean(filter.needCount);

            const serachQry = {};
            return await Promise.all([
                needCount ? Role.countDocuments(serachQry) : undefined,
                Role.find(serachQry, this)
                    .limit(parseInt(limit))
                    .skip(parseInt(skip))
                    .sort({ [sortKey]: parseInt(sortOrder) }),
            ]).then(([total, records]) => ({ total, records }));
        });
    };

    static editRole = async (recordId, updatedDetails = {}) => {
        await Role.findByIdAndUpdate(MongoUtil.toObjectId(recordId), {
            [TableFields.name_]: updatedDetails[TableFields.name_],
            [TableFields.permissions]: updatedDetails[TableFields.permissions],
        });
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
            projection[TableFields.permissions] = 1;
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

module.exports = RoleService;
