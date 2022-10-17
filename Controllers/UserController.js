const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const TokenManager = require("../Lib/TokenManager");
const mongoose = require("mongoose");
const Model = require("../Models");
const CodeGenerator = require("../Lib/CodeGenerator");
const emailFunction = require("../Lib/email");
const reader = require('xlsx')
let generator = require('generate-password');

//file upload
async function fileUpload(payloadData) {
    try {
        let file = await UniversalFunctions.uploadImage(
            payloadData.file,
        );
        return file
    }
    catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//delete file
async function deleteS3File(queryData) {
    try {
        let file = await UniversalFunctions.deleteS3File(
            queryData.fileUrl,
        );
        if (file)
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED;
        else
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
    catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//user register
async function userRegister(payloadData) {
    try {
        if (await Service.findOne(Model.Users, { email: payloadData.email })) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXISTS);
        }
        if (await Service.findOne(Model.Users, { mobile: payloadData.mobile })) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST);
        }
        const password = await UniversalFunctions.CryptData(payloadData.password)
        payloadData.password = password
        let user = await Service.saveData(Model.Users, payloadData)
        if (!user) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        }
        user = JSON.parse(JSON.stringify(user));
        delete user.password
        return user
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//user login
async function userLogin(payloadData) {
    try {
        let user = await Service.findOne(Model.Users, { email: payloadData.email })
        if (!user) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.USER_NOT_EXISTS);
        }
        if (user.isBlocked || user.isDeleted) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.BLOCKED);
        }
        const validate = await UniversalFunctions.comparePassword(payloadData.password.toString(), user.password);
        if (!validate) {
            return Promise.reject(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_PASSWORD);
        }
        tokenData = await TokenManager.setToken(
            {
                _id: user._id,
                type: Config.APP_CONSTANTS.DATABASE.USER_TYPE.USER,
            },
        );
        user.accessToken = tokenData.accessToken;
        user = JSON.parse(JSON.stringify(user));
        delete user.password
        return user
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//user forgot password
async function forgotPassword(payloadData) {
    try {
        let criteria = false;
        if (payloadData.email) {
            criteria = { email: payloadData.email };
        }
        let user = await Service.findOne(Model.Users, criteria, {}, { lean: true });
        if (!user)
            return Promise.reject(
                Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_PHONE_EMAIL
            );

        const verificationCode = await CodeGenerator.generateCode(6, "numeric");
        // const verificationCode = '123456';
        let otpData = {
            code: verificationCode,
            type: Config.APP_CONSTANTS.DATABASE.OTP_TYPE.FORGOT_PASSWORD,
        };
        if (payloadData.email) {
            otpData.email = payloadData.email;
            const body = Config.APP_CONSTANTS.SERVER.otpEmail.body.replace(
                "{otp}",
                verificationCode
            );
            let email = emailFunction.sendEmail(
                payloadData.email,
                Config.APP_CONSTANTS.SERVER.otpEmail.subject,
                body,
                []
            );
        }

        const data = await Service.findAndUpdate(
            Model.OtpCodes,
            { email: payloadData.email },
            { $set: { ...otpData } },
            { upsert: true }
        );

        return {
            statusCode: 200,
            customMessage: "OTP Sent on Email",
            type: "OTP_SENT_ON_EMAIL",
        };
    }
    catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//validate-otp
async function verifyOTP(payloadData) {
    try {
        const { code, email } = payloadData;
        const data = await Service.findOne(Model.OtpCodes, {
            email: email,
            code: code,
            status: 1,
            type: Config.APP_CONSTANTS.DATABASE.OTP_TYPE.FORGOT_PASSWORD,
        });
        if (!data) return { valid: false };
        return { valid: true };
    }
    catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

// change password
async function changePassword(payloadData) {
    try {
        const {
            STATUS_MSG: {
                SUCCESS: { UPDATED },
                ERROR: { IMP_ERROR, INVALID_OTP },
            },
            DATABASE: {
                USER_TYPE: { USER },
                OTP_TYPE: { FORGOT_PASSWORD },
            },
        } = Config.APP_CONSTANTS;
        const { email, code, password } = payloadData;

        let otpObj = await Service.findAndUpdate(
            Model.OtpCodes,
            { email: email, code: code, status: 1, type: FORGOT_PASSWORD },
            { lean: true }
        );
        if (!otpObj) return Promise.reject(INVALID_OTP);
        const user = await Service.findAndUpdate(
            Model.Users,
            { email: email },
            {
                $set: {
                    password: await UniversalFunctions.CryptData(password),
                },
            },
            { lean: true, new: true }
        );
        if (user) {
            const tokenData = await TokenManager.setToken({
                _id: user._id,
                type: USER,
            });
            return UPDATED;
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//fetch user
async function fetchUser(queryData, userData) {
    try {
        const { skip = undefined, limit = undefined, search, active = undefined } = queryData;
        let query = { isDeleted: false }
        let projection = { isDeleted: 0, __v: 0, password: 0, accessToken: 0 }
        let options = { sort: { _id: -1 } };
        if (typeof skip !== "undefined" && typeof limit !== "undefined")
            options = { skip: skip, limit: limit, sort: { _id: -1 } };
        if (search)
            query.name = new RegExp(search, "ig");
        if (typeof active !== "undefined")
            query.active = active;
        let data = await Service.getData(Model.Users, query, projection, options)
        let total = await Service.count(Model.Users, query)
        return {
            userData: data,
            total: total
        }
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//user status change
async function userStatusChange(paramsData) {
    try {
        let find = await Service.findOne(Model.Users, { _id: paramsData.userId })
        if (!find)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST)
        let isBlocked
        if (find.isBlocked)
            isBlocked = false
        else
            isBlocked = true
        let data = await Service.findAndUpdate(Model.Users, { _id: paramsData.userId }, { isBlocked: isBlocked }, { lean: true, new: true })
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        if (isBlocked)
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.INACTIVE;
        else
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.ACTIVE;

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//user profile update
async function userProfileUpdate(payloadData, userData) {
    try {
        if (await Service.findOne(Model.Users, { email: payloadData.email, _id: { $ne: userData._id } })) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXISTS);
        }
        if (await Service.findOne(Model.Users, { mobile: payloadData.mobile, _id: { $ne: userData._id } })) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST);
        }
        payloadData.password = await UniversalFunctions.CryptData(payloadData.password)
        const update = await Service.findAndUpdate(Model.Users, { _id: userData._id }, payloadData)
        if (!update) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        }
        return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED;
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//guest user 
async function guestUser(payloadData) {
    try {
        const data = await Service.findAndUpdate(
            Model.GuestUser,
            { ipAddress: payloadData.ipAddress },
            { $set: { ...payloadData } },
            { upsert: true }
        );
        if (!data) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        }
        return data
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//user address update
async function userAddressUpdate(payloadData, userData) {
    try {
        let user
        if (payloadData.addressId) {
            user = await Service.findAndUpdate(Model.Users, { _id: userData._id, "addresses._id": payloadData.addressId },
                { "addresses.$": payloadData }, { new: true })
        }
        else {
            user = await Service.findAndUpdate(Model.Users, { _id: userData._id }, { $push: { addresses: payloadData } }, { new: true })
            if (!user) {
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
            }
        }
        user = JSON.parse(JSON.stringify(user));
        delete user.password,
            delete user.accessToken
        return user
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//getUserAddress
async function getUserAddress(userData) {
    try {
        return await Service.findOne(Model.Users, { _id: userData._id }, { addresses: 1 }, { new: true })
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//delete user address
async function deleteUserAddressById(paramsData, userData) {
    try {
        let data = await Service.findAndUpdate(Model.Users,
            { _id: userData._id },
            { $pull: { addresses: { _id: paramsData.addressId } } }, { new: true })
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        data = JSON.parse(JSON.stringify(data));
        delete data.password,
            delete data.accessToken
        return data;
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//import xlxl
async function importXlxl(payload) {
    try {
        const file = reader.readFile(payload.file.path)
        let data = []
        const sheets = file.SheetNames
        for (let i = 0; i < sheets.length; i++) {
            const temp = reader.utils.sheet_to_json(
                file.Sheets[file.SheetNames[i]])
            temp.forEach((res) => {
                data.push(res)
            })
        }
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            if (await Service.findOne(Model.Users, { email: element.email })) {
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXISTS);
            }
            if (await Service.findOne(Model.Users, { mobile: element.mobile })) {
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST);
            }
            let password = await generatePassword()
            element.password = await UniversalFunctions.CryptData(password)
            const user = await Service.saveData(Model.Users, element)
            if (user) {
                const body = `<b>Welcome, ${element.firstName + element.lastName}</b><p>Here's your login information:  </p>
            <p><b>email: </b>${element.email}</p>
            <p><b>password: </b>${password}</p>`
                emailFunction.sendEmail(
                    element.email,
                    Config.APP_CONSTANTS.SERVER.Login.subject,
                    body,
                    []
                );
            }
        }
        return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED;
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

async function generatePassword() {
    let password = generator.generate({
        length: 8,
        numbers: true
    });
    return password
}


//export xlxl
async function getXlxsExport() {
    try {
        let query = { isDeleted: false }
        let projection = { _id: 0, firstName: 1, lastName: 1, email: 1, mobile: 1, dob: 1, gender: 1 }
        let options = { sort: { _id: -1 } };
        const user = await Service.getData(Model.Users, query, projection, options)
        return user
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}
module.exports = {
    fileUpload,
    deleteS3File,
    userRegister,
    userLogin,
    forgotPassword,
    verifyOTP,
    changePassword,
    fetchUser,
    userStatusChange,
    userProfileUpdate,
    guestUser,
    userAddressUpdate,
    getUserAddress,
    deleteUserAddressById,
    importXlxl,
    getXlxsExport
}

