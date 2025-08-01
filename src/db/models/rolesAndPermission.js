const mongoose = require('mongoose');
const validator = require('validator');
const {
    TableFields,
    PermissionModules,
    Permissions,
    TableNames,
    ValidationMsgs,
} = require('../../utils/constants');

const permissionSchema = new mongoose.Schema({
    [TableFields.ID]: false,
    [TableFields.module]: {
        type: Number,
        enum: Object.values(PermissionModules),
    },
    [TableFields.permissions]: [
        { type: Number, enum: Object.values(Permissions) },
    ],
});

const roleSchema = new mongoose.Schema(
    {
        [TableFields.name_]: {
            type: String,
            required: [true, ValidationMsgs.NameEmpty],
            trim: true,
            unique: true,
        },
        [TableFields.permissions]: [permissionSchema],
        [TableFields.active]: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret.__v;
            },
        },
    }
);

const Roles = mongoose.model(TableNames.Role, roleSchema);
module.exports = Roles;
