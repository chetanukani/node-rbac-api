const ValidationMsgs = (function () {
    function ValidationMsgs(item) {}
    ValidationMsgs.AuthFail = 'Please authenticate!';
    ValidationMsgs.EmailEmpty = 'Email required';
    ValidationMsgs.EmailInvalid = 'Email Invalid';
    ValidationMsgs.PasswordEmpty = 'Password Required';
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
    return TableNames;
})();

const TableFields = (function () {
    function TableFields() {}
    TableFields.ID = '_id';
    TableFields.firstName = 'firstName';
    TableFields.lastName = 'lastName';
    TableFields.email = 'email';
    TableFields.password = 'password';
    TableFields.active = 'active';
    TableFields._createdAt = '_createdAt';
    TableFields._updatedAt = '_updatedAt';
    TableFields.tokens = 'tokens';
    TableFields.token = 'token';
    return TableFields;
})();

module.exports = {
    ValidationMsgs,
    ResponseStatus,
    TableNames,
    TableFields,
};
