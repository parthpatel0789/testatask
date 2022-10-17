"use strict";

const Service = require('../Services');
const async = require('async');
let randomstring = require("randomstring");




exports.generateUniqueCustomerId = async function (noOfDigits) {
    let Step1 = getCodeFromOrder();
    let Step2 = generateCode(await Step1);
    return Step2

};

async function getCodeFromOrder() {
    return new Promise((resolve, reject) => {
        Service.queries.getData((err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result)
            }
        })
    });
}

exports.generateCode = async function (digits, charset = 'alphanumeric') {
    return randomstring.generate({
        length: digits,
        charset: charset
    }).toUpperCase();

}

async function checkUniqness(Step1, Step2) {
    return new Promise((resolve, reject) => {
        let generatedRandom = Step2
        if (Step1.indexOf(generatedRandom) === -1) {
            console.log("*********not repeat****************")
            resolve(generatedRandom)
        }
        else {
            console.log("************repeat************");
            generateCode(Step1)
        }
    });
}


exports.generateEmployeeNumber = async function (noOfDigits) {
    let Step1 = getEmployeeNumberFromSteward();
    let Step2 = generateCode(await Step1);
    return Step2

};


async function getEmployeeNumberFromSteward() {
    return new Promise((resolve, reject) => {
        Service.stewardServices.getAllEmployeeNumber((err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result)
            }
        })
    });
}
