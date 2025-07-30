const ValidationMsgs = (function () {
    function ValidationMsgs(item) {}
    ValidationMsgs.AuthFail = 'Please authenticate!';
    ValidationMsgs.EmailEmpty = 'Email required';
    ValidationMsgs.EmailInvalid = 'Email Invalid';
    ValidationMsgs.PasswordEmpty = 'Password Required';
    ValidationMsgs.DuplicateEmail = 'DuplicateEmail';
    ValidationMsgs.PasswordInvalid = 'PasswordInvalid';
    ValidationMsgs.NotAllowed = 'NotAllowed';
    ValidationMsgs.UnableToLogin = 'UnableToLogin';
    ValidationMsgs.SomethinWentWrong = 'SomethinWentWrong';
    ValidationMsgs.DuplicateRole = 'DuplicateRole';
    ValidationMsgs.NameEmpty = 'NameEmpty';
    ValidationMsgs.ParamerError = 'ParamerError';
    ValidationMsgs.RecordNotFound = 'RecordNotFound';
    return ValidationMsgs;
})();

const ResponseStatus = (function () {
    function ResponseStatus() {}
    ResponseStatus.Success = 200;
    ResponseStatus.BadRequest = 400;
    ResponseStatus.Unauthorized = 401;
    ResponseStatus.NotFound = 404;
    ResponseStatus.UpgradeRequired = 426;
    ResponseStatus.InternalServerError = 500;
    ResponseStatus.ServiceUnavailable = 503;
    return ResponseStatus;
})();

const TableNames = (function () {
    function TableNames() {}
    TableNames.User = 'users';
    TableNames.Admin = 'admins';
    TableNames.Role = 'roles';
    return TableNames;
})();

const TableFields = (function () {
    function TableFields() {}
    TableFields.ID = '_id';
    TableFields.name_ = 'name';
    TableFields.firstName = 'firstName';
    TableFields.lastName = 'lastName';
    TableFields.email = 'email';
    TableFields.password = 'password';
    TableFields.active = 'active';
    TableFields._createdAt = '_createdAt';
    TableFields._updatedAt = '_updatedAt';
    TableFields.tokens = 'tokens';
    TableFields.token = 'token';
    TableFields.module = 'module';
    TableFields.permissions = 'permissions';
    TableFields.roleRef = 'roleRef';
    return TableFields;
})();

const InterfaceTypes = (function () {
    function InterfaceType() {}
    InterfaceType.Admin = {
        AdminWeb: 'i1',
    };
    InterfaceType.User = {
        UserWeb: 'i2',
    };
    return InterfaceType;
})();

const PermissionModules = (function () {
    function PermissionModules() {}
    PermissionModules.All = 0;
    PermissionModules.Category = 1;
    PermissionModules.Product = 2;
    PermissionModules.Order = 3;
    return PermissionModules;
})();

const Permissions = (function () {
    function Permissions() {}
    Permissions.All = 0;
    Permissions.View = 1;
    Permissions.Add = 2;
    Permissions.Edit = 3;
    Permissions.Delete = 4;
    return Permissions;
})();

module.exports = {
    ValidationMsgs,
    ResponseStatus,
    TableNames,
    TableFields,
    InterfaceTypes,
    PermissionModules,
    Permissions
};
