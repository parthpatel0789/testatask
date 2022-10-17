const mongoose = require('mongoose');
const Config = require('../Config');
const async = require('async');
const Modal = require('../Models');
mongoose.Promise = global.Promise;
let Service = require('../Services').queries;


mongoose.connect(Config.dbConfig.config.dbURI, {

    useNewUrlParser: true,

    useUnifiedTopology: true

}, err => {
    if (err) throw err;
    console.log('Connected to MongoDB!')
});

exports.bootstrapAppVersion = function (callback) {
    let appVersion1 = {
        latestIOSVersion: 1,
        criticalIOSVersion: 1,
        latestAndroidVersion: 1,
        criticalAndroidVersion: 1,
        appType: Config.APP_CONSTANTS.DATABASE.USER_TYPE.USER
    };

    async.parallel([
        function (cb) {
            insertVersionData(appVersion1.appType, appVersion1, cb)
        },
    ], function (err, done) {
        callback(err, 'Bootstrapping finished For App Version');
    })
};

function insertVersionData(appType, versionData, callback) {
    let needToCreate = true;
    async.series([
        async function (cb) {
            let criteria = {
                appType: appType
            };
            let data = await Service.getData(Modal.AppVersions, criteria, { _id: 1 }, {});
            if (data && data.length > 0) {
                needToCreate = false;
            }
            cb()
        },
        async function (cb) {
            if (needToCreate) {
                await Service.saveData(Modal.AppVersions, versionData);
                cb()
            } else {
                cb();
            }
        }], function (err, data) {
            callback(err, 'Bootstrapping finished For Admin Data')
        })
}

