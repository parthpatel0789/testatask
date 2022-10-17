'use strict';

let Config = require('../Config');
let Jwt = require('jsonwebtoken');
let Modal = require('../Models');
let Service = require('../Services').queries;

let getTokenFromDB = async (userId, userType, token) => {

    let criteria = {
        _id: userId,
        accessToken: token,
        roles: userType
    }, model;
    console.log(userType);
    if (userType) {
        switch (userType) {
            case Config.APP_CONSTANTS.DATABASE.USER_TYPE.ADMIN: {
                model = Modal.Admin;
                break;
            }
            case Config.APP_CONSTANTS.DATABASE.USER_TYPE.VENDOR: {
                model = Modal.Vendor;
                break;
            }
            case Config.APP_CONSTANTS.DATABASE.USER_TYPE.USER: {
                model = Modal.Users;
                break;
            }

        }

        let data = await Service.findOne(model, criteria, {}, { lean: true });
        if (data) {
            data.userType = userType;
        }
        else data = null;
        return data;
    }
    else return null;

};

let setTokenInDB = async (userId, userType, tokenToSave) => {
    let criteria = {
        _id: userId
    }, model;
    let setQuery = {
        accessToken: tokenToSave
    };

    switch (userType) {
        case Config.APP_CONSTANTS.DATABASE.USER_TYPE.ADMIN: {
            model = Modal.Admin;
            break;
        }
        case Config.APP_CONSTANTS.DATABASE.USER_TYPE.VENDOR: {
            model = Modal.Vendor;
            break;
        }
        case Config.APP_CONSTANTS.DATABASE.USER_TYPE.USER: {
            model = Modal.Users;
            break;
        }
    }
    let data = await Service.findAndUpdate(model, criteria, setQuery, { new: true, lean: true });
    data.userType = userType;
    return data;
};

let verifyToken = async (token, flag) => {
    let decoded = await Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY);
    return await getTokenFromDB(decoded._id, flag, token);
};
let hybridVerifyToken = async (_id, flag, token) => {
    let data = await getTokenFromDB(_id, flag, token);
    return data;
}

let setToken = async (tokenData) => {
    tokenData.createdAt = new Date();
    let tokenToSend = await Jwt.sign(tokenData, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY);
    return await setTokenInDB(tokenData._id, tokenData.type, tokenToSend)
};

let decodeToken = async (token) => {
    return await Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY);
};

module.exports = {
    setToken: setToken,
    verifyToken: verifyToken,
    decodeToken: decodeToken,
    hybridVerifyToken: hybridVerifyToken
};
