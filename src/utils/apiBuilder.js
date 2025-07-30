const express = require('express');
const { ResponseStatus } = require('./constants');
const Util = require('./util');
const userAuth = require('../middleware/userAuth');
const adminAuth = require('../middleware/adminAuth');

class API {
    static configRoute(root) {
        let router = new express.Router();
        return new PathBuilder(root, router);
    }
}

const MethodBuilder = class {
    constructor(root, subPath, router) {
        this.asGET = function (methodToExecute) {
            return new Builder('get', root, subPath, methodToExecute, router);
        };

        this.asPOST = function (methodToExecute) {
            return new Builder('post', root, subPath, methodToExecute, router);
        };

        this.asDELETE = function (methodToExecute) {
            return new Builder(
                'delete',
                root,
                subPath,
                methodToExecute,
                router
            );
        };

        this.asUPDATE = function (methodToExecute) {
            return new Builder('patch', root, subPath, methodToExecute, router);
        };
    }
};

const PathBuilder = class {
    constructor(root, router) {
        this.addPath = function (subPath) {
            return new MethodBuilder(root, subPath, router);
        };
        this.getRouter = () => {
            return router;
        };
        this.changeRoot = (newRoot) => {
            root = newRoot;
            return this;
        };
    }
};

const Builder = class {
    constructor(
        methodType,
        root,
        subPath,
        executer,
        router,
        middlewaresList = [],
        useAdminAuth = false,
        useUserAuth = false
    ) {
        this.useAdminAuth = () => {
            return new Builder(
                methodType,
                root,
                subPath,
                executer,
                router,
                middlewaresList,
                true,
                false
            );
        };
        this.userUserAuth = () => {
            return new Builder(
                methodType,
                root,
                subPath,
                executer,
                router,
                middlewaresList,
                false,
                true
            );
        };

        this.build = () => {
            let controller = async (req, res) => {
                try {
                    let response = await executer(req, res);
                    res.status(ResponseStatus.Success).send(response);
                } catch (e) {
                    res.status(ResponseStatus.BadRequest).send(
                        Util.getErrorMessage(e)
                    );
                }
            };

            let middlewares = [...middlewaresList];
            if (useAdminAuth) middlewares.push(adminAuth);
            if (useUserAuth) middlewares.push(userAuth);

            router[methodType](root + subPath, ...middlewares, controller);
            return new PathBuilder(root, router);
        };
    }
};

module.exports = API;
