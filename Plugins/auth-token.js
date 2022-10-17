
const UniversalFunctions = require('../Utils/UniversalFunction');
const TokenManager = require('../Lib/TokenManager');
let Jwt = require('jsonwebtoken');
const Config = require('../Config');

exports.plugin = {
    name: 'auth-token-plugin',
    register: async (server, options) => {
        server.register(require('hapi-auth-bearer-token'));

        server.auth.strategy('AdminAuth', 'bearer-access-token', {
            allowQueryToken: false,
            allowMultipleHeaders: true,
            accessTokenName: 'accessToken',
            validate: async (request, token, h) => {
                if (!token) return {};
                else {
                    let response = await TokenManager.verifyToken(token, Config.APP_CONSTANTS.DATABASE.USER_TYPE.ADMIN);
                    if (!response) {
                        return Promise.reject(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.TOKEN_EXPIRED))
                    }
                    else {
                        if (!response.isBlocked) {
                            const isValid = true;
                            response.type = Config.APP_CONSTANTS.DATABASE.USER_TYPE.ADMIN;
                            const credentials = { userData: response };
                            const artifacts = { token };

                            return { isValid, credentials, artifacts }
                        }
                        else return Promise.reject(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.BLOCKED))
                    }
                }
            }
        });

        server.auth.strategy('VendorAuth', 'bearer-access-token', {
            allowQueryToken: false,
            allowMultipleHeaders: true,
            accessTokenName: 'accessToken',
            validate: async (request, token, h) => {
                if (!token) return {};
                else {
                    let response = await TokenManager.verifyToken(token, Config.APP_CONSTANTS.DATABASE.USER_TYPE.VENDOR);
                    if (!response) {
                        return Promise.reject(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.TOKEN_EXPIRED))
                    }
                    else {
                        if (!response.isBlocked) {
                            const isValid = true;
                            response.type = Config.APP_CONSTANTS.DATABASE.USER_TYPE.VENDOR;
                            const credentials = { userData: response };
                            const artifacts = { token };

                            return { isValid, credentials, artifacts }
                        }
                        else return Promise.reject(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.BLOCKED))
                    }
                }
            }
        });

        server.auth.strategy('UserAuth', 'bearer-access-token', {
            allowQueryToken: false,
            allowMultipleHeaders: true,
            accessTokenName: 'accessToken',
            validate: async (request, token, h) => {
                if (!token) return {};
                else {
                    let response = await TokenManager.verifyToken(token, Config.APP_CONSTANTS.DATABASE.USER_TYPE.USER);
                    if (!response) {
                        return Promise.reject(UniversalFunctions.sendError(Config.APP_CONSTANTS.STATUS_MSG.ERROR.TOKEN_EXPIRED))
                    }
                    else {
                        if (!response.isBlocked) {
                            const isValid = true;
                            response.type = Config.APP_CONSTANTS.DATABASE.USER_TYPE.USER;
                            const credentials = { userData: response };
                            const artifacts = { token };

                            return { isValid, credentials, artifacts }
                        }
                        else return Promise.reject(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.BLOCKED))
                    }
                }
            }
        });

        server.auth.strategy('HybridAuth', 'bearer-access-token', {
            allowQueryToken: false,
            allowMultipleHeaders: true,
            accessTokenName: 'accessToken',
            validate: async (request, token, h) => {
                if (!token) return {};
                else {
                    let response = await Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY);
                    if (response) {
                        let flag = response.type == Config.APP_CONSTANTS.DATABASE.USER_TYPE.USER ? Config.APP_CONSTANTS.DATABASE.USER_TYPE.USER : Config.APP_CONSTANTS.DATABASE.USER_TYPE.ADMIN;
                        flag = response.type == Config.APP_CONSTANTS.DATABASE.USER_TYPE.ADMIN ? Config.APP_CONSTANTS.DATABASE.USER_TYPE.ADMIN : Config.APP_CONSTANTS.DATABASE.USER_TYPE.VENDOR;
                        response = await TokenManager.hybridVerifyToken(response._id, flag, token);
                    }
                    if (!response) {
                        return Promise.reject(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.TOKEN_EXPIRED))
                    }
                    else {
                        if (!response.isBlocked) {
                            const isValid = true;
                            response.type = Config.APP_CONSTANTS.DATABASE.USER_TYPE.ADMIN;
                            const credentials = { userData: response };
                            const artifacts = { token };

                            return { isValid, credentials, artifacts }
                        }
                        else return Promise.reject(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.BLOCKED))
                    }
                }
            }
        });
    }

};
