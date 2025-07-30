const Util = class {
    static getErrorMessageFromString(message) {
        return {
            error: message,
        };
    }

    static parseBoolean(b) {
        return (b + '').toLowerCase() == 'true';
    }

    static getErrorMessage(mongooseException) {
        try {
            const mainJSONKeys = Object.keys(mongooseException.errors);
            if (mongooseException.errors[mainJSONKeys[0]].errors) {
                const jsonKeys = Object.keys(mongooseException.errors[mainJSONKeys[0]].errors);
                return {
                    error: mongooseException.errors[mainJSONKeys[0]].errors[jsonKeys[0]].properties.message
                }
            } else {
                return {
                    error: mongooseException.errors[mainJSONKeys[0]].message
                }
            }
        } catch (e) {
            return {
                error: mongooseException.message
            }
        }
    }

    static generateRandomPassword(length, includeAlphabets = false) {
        let result = '';
        let characters = ""
        if (includeAlphabets) {
            characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        } else {
            characters = '0123456789';
        }
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
};

module.exports = Util;
