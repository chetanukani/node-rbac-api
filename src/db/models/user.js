const mongoose = require('mongoose');
const validator = require('validator');
const {
    ValidationMsgs,
    TableNames,
    TableFields,
} = require('../../utils/constants');
const ValidationError = require('../../utils/ValidationError');
const bcrypt = require('bcryptjs'); // To compare value with it's Hash
const jwt = require('jsonwebtoken'); // To generate Hash

const userSchema = new mongoose.Schema(
    {
        [TableFields.firstName]: {
            type: String,
            trim: true,
        },
        [TableFields.lastName]: {
            type: String,
            trim: true,
        },
        [TableFields.email]: {
            type: String,
            required: [true, ValidationMsgs.EmailEmpty],
            trim: true,
            unique: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new ValidationError(ValidationMsgs.EmailInvalid);
                }
            },
        },
        [TableFields.password]: {
            type: String,
            minlength: 8,
            trim: true,
            required: [true, ValidationMsgs.PasswordEmpty],
        },
        [TableFields.tokens]: [
            {
                _id: false,
                [TableFields.token]: {
                    type: String,
                },
            },
        ],
        [TableFields.active]: {
            type: Boolean,
            default: true,
        },
        [TableFields._createdAt]: {
            type: Date,
            default: Date.now,
        },
        [TableFields._updatedAt]: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false,
        toJSON: {
            transform: function (doc, ret) {
                delete ret[TableFields.tokens];
                delete ret[TableFields.password];
                delete ret.__v;
            },
        },
    }
);

userSchema.methods.isValidAuth = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.isValidPassword = function (password) {
    const regEx =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regEx.test(password);
};

userSchema.methods.createAuthToken = function () {
    const token = jwt.sign(
        {
            [TableFields.ID]: this[TableFields.ID].toString(),
        },
        process.env.JWT_USER_PK || 'top-secret'
    );
    return token;
};

//Hash the plaintext password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified(TableFields.password)) {
        this[TableFields.password] = await bcrypt.hash(
            this[TableFields.password],
            8
        ); // 8 = number of rounds of encryption
    }
    next();
});

userSchema.index({ [TableFields.email]: 1 }, { unique: true });

const User = mongoose.model(TableNames.User, userSchema);
module.exports = User;
