const {
    TableFields,
    ValidationMsgs,
    TableNames,
    ActivationStatusTypes,
} = require('../../utils/constants');
const Util = require('../../utils/util');
const ValidationError = require('../../utils/ValidationError');
const User = require('../models/user');
const { MongoUtil } = require('../mongoose');

class UserService {
    static findByEmail = (email) => {
        return new ProjectionBuilder(async function () {
            return await User.findOne({ [TableFields.email]: email }, this);
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
