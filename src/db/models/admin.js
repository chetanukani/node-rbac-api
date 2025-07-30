const mongoose = require("mongoose");
const validator = require("validator");
const {
    ValidationMsgs,
    TableNames,
    TableFields,
    UserTypes,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const bcrypt = require("bcryptjs"); // To compare value with it's Hash
const jwt = require("jsonwebtoken"); // To generate Hash

const adminSchema = new mongoose.Schema(
    {
        [TableFields.name_]: {
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
        [TableFields._createdAt]: {
            type: Date,
            default: Date.now
        },
        [TableFields._updatedAt]: {
            type: Date,
            default: Date.now
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

adminSchema.methods.isValidAuth = async function (password) {
    return await bcrypt.compare(password, this.password);
};

adminSchema.methods.isValidPassword = function (password) {
    const regEx = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regEx.test(password);
};

adminSchema.methods.createAuthToken = function () {
    const token = jwt.sign(
        {
            [TableFields.ID]: this[TableFields.ID].toString(),
        },
        process.env.JWT_ADMIN_PK || 'top-secret'
    );
    return token;
};

adminSchema.methods.resetPasswordToken = function () {
    const token = jwt.sign(
        {
            [TableFields.ID]: this[TableFields.ID].toString(),
        },
        process.env.JWT_ADMIN_PK,
        { expiresIn: "1d" }
    );
    return token;
};

//Hash the plaintext password before saving
adminSchema.pre("save", async function (next) {
    if (this.isModified(TableFields.password)) {
        this[TableFields.password] = await bcrypt.hash(
            this[TableFields.password],
            8
        ); // 8 = number of rounds of encryption
    }
    next();
});


const Admin = mongoose.model(TableNames.Admin, adminSchema);
module.exports = Admin;
