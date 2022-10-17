const Boom = require("boom");
const CONFIG = require("../Config");
const Joi = require("joi");
const Modal = require("../Models");
const Service = require("../Services").queries;
const randomString = require("randomstring");
const UploadMultipart = require("../Lib/UploadMultipart");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const moment = require("moment");
const saltRounds = 10;
const fs = require("fs");

const sendSuccess = function (successMsg, data) {
  successMsg =
    successMsg || CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT.customMessage;
  if (
    typeof successMsg === "object" &&
    successMsg.hasOwnProperty("statusCode") &&
    successMsg.hasOwnProperty("customMessage")
  ) {
    return {
      statusCode: successMsg.statusCode,
      message: successMsg.customMessage,
      data: data || null,
    };
  } else {
    return {
      statusCode: 200,
      message: successMsg,
      data: data || null,
    };
  }
};

async function CryptData(stringToCrypt) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(stringToCrypt, saltRounds, function (err, hash) {
      if (err) reject(err);
      else resolve(hash);
    });
  });
}

async function comparePassword(data, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(data, hash, function (err, res) {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

const sendError = function (data) {
  try {
    if (
      typeof data === "object" &&
      data.hasOwnProperty("statusCode") &&
      data.hasOwnProperty("customMessage")
    ) {
      let errorToSend = Boom.create(data.statusCode, data.customMessage);
      errorToSend.output.payload.responseType = data.type;
      return errorToSend;
    } else {
      let errorToSend = "";
      if (typeof data === "object") {
        if (data.name === "MongoError") {
          errorToSend +=
            CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DB_ERROR.customMessage;
          if (data.code === 11000) {
            let duplicateValue =
              data.errmsg &&
              data.errmsg.substr(data.errmsg.lastIndexOf('{ : "') + 5);
            duplicateValue = duplicateValue.replace("}", "");
            errorToSend +=
              CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage +
              " : " +
              duplicateValue;
            //console.log("==================errorToSend==================",data.message)
            if (data.message.indexOf("email_1") > -1) {
              errorToSend =
                CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE_EMAIL
                  .customMessage;
            }
          }
        } else if (data.name === "ApplicationError") {
          errorToSend +=
            CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.APP_ERROR.customMessage +
            " : ";
        } else if (data.name === "ValidationError") {
          errorToSend +=
            CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.APP_ERROR.customMessage +
            data.message;
        } else if (data.name === "CastError") {
          errorToSend +=
            CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DB_ERROR.customMessage +
            CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID.customMessage +
            data.value;
        }
      } else {
        errorToSend = data;
      }
      let customErrorMessage = errorToSend;
      if (typeof customErrorMessage === "string") {
        if (errorToSend.indexOf("[") > -1) {
          customErrorMessage = errorToSend.substr(errorToSend.indexOf("["));
        }
        customErrorMessage =
          customErrorMessage && customErrorMessage.replace(/"/g, "");
        customErrorMessage =
          customErrorMessage && customErrorMessage.replace("[", "");
        customErrorMessage =
          customErrorMessage && customErrorMessage.replace("]", "");
      }
      return Boom.create(400, customErrorMessage);
    }
  } catch (e) { }
};

//const failActionFunction = function (request, reply, source, error) {
const failActionFunction = function (request, h, error) {
  console.log(
    ".............fail action.................",
    error.output.payload.message
  );
  let customErrorMessage = "";
  if (error.output.payload.message.indexOf("[") > -1) {
    customErrorMessage = error.output.payload.message.substr(
      error.output.payload.message.indexOf("[")
    );
  } else {
    customErrorMessage = error.output.payload.message;
  }
  customErrorMessage = customErrorMessage.replace(/"/g, "");
  customErrorMessage = customErrorMessage.replace("[", "");
  customErrorMessage = customErrorMessage.replace("]", "");
  error.output.payload.message = customErrorMessage;
  delete error.output.payload.validation;
  return error;
};

const authorizationHeaderObj = Joi.object({
  authorization: Joi.string().required(),
}).unknown();

const generateRandomString = function () {
  return randomString.generate(5);
};

async function uploadImage(image) {
  console.log('---------- inside upload image ---------------')
  if (Array.isArray(image)) {
    return new Promise((resolve, reject) => {
      let imageData = [], len = image.length, count = 0;
      image.map((obj) => {
        UploadMultipart.uploadFilesOnS3(obj, (err, result) => {
          count++;
          imageData.push(result);
          if (count === len)
            resolve(imageData)
        })
      })
    });
  } else {
    return new Promise((resolve, reject) => {
      UploadMultipart.uploadFilesOnS3(image, (err, result) => {
        if (err) reject(err);
        else resolve(result)
      })
    });
  }
}

//delete file on s3 buckect

async function deleteS3File(fileUrl) {
  return new Promise((resolve, reject) => {
    UploadMultipart.deleteFromS3(fileUrl, (err, result) => {
      if (err) reject(err);
      resolve(result)
    })
  })
}

async function uploadVideo(video, type) {
  if (Array.isArray(video)) {
    return new Promise((resolve, reject) => {
      let videoData = [],
        len = video.length,
        count = 0;
      video.map(obj => {
        UploadMultipart.uploadFilesOnS3(obj, type, (err, result) => {
          count++;
          videoData.push(result);
          if (count === len) resolve(videoData);
        });
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      UploadMultipart.uploadFilesOnS3(video, type, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}

async function uploadOtherFile(otherFile, type) {
  if (Array.isArray(otherFile)) {
    return new Promise((resolve, reject) => {
      let otherFileData = [],
        len = otherFile.length,
        count = 0;
      otherFile.map(obj => {
        UploadMultipart.uploadFilesOnS3(obj, type, (err, result) => {
          count++;
          otherFileData.push(result);
          if (count === len) resolve(otherFileData);
        });
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      UploadMultipart.uploadFilesOnS3(otherFile, type, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}

/*logout api*/
async function logout(userData) {
  let update = {
    accessToken: "",
    deviceToken: "",
  },
    model;
  switch (userData.type) {
    case CONFIG.APP_CONSTANTS.DATABASE.USER_TYPE.USER: {
      model = Modal.Users;
      break;
    }
    case CONFIG.APP_CONSTANTS.DATABASE.USER_TYPE.ADMIN: {
      model = Modal.Admins;
      break;
    }
    case CONFIG.APP_CONSTANTS.DATABASE.USER_TYPE.PHARMA: {
      model = Modal.Pharma;
      break;
    }
    case CONFIG.APP_CONSTANTS.DATABASE.USER_TYPE.DOCTOR: {
      model = Modal.Doctor;
      break;
    }
    case CONFIG.APP_CONSTANTS.DATABASE.USER_TYPE.COMPANY: {
      model = Modal.Company;
      break;
    }
  }
  await Service.findAndUpdate(
    model,
    {
      _id: userData._id,
    },
    update,
    {}
  );
  return {};
}
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function emitToUser(socket, error = false, auth = true, en, msg, data) {
  return new Promise((resolve, reject) => {
    if (socket) {
      if (en && msg && data) {
        // data = JSON.parse(
        //     JSON.stringify(data).replace(
        //         new RegExp("{{base_url}}", "g"),
        //         config.BASE_URL
        //     )
        // );
        socket.emit("res", {
          error,
          auth,
          en,
          msg,
          data,
        });
      } else {
        socket.emit("res", {
          error: true,
          en: "err",
          data: {},
          msg: "Technical Error",
          auth: true,
        });
      }
    }
    resolve();
  });
}

async function emitToSocketId(
  socketid,
  error = false,
  auth = true,
  en,
  msg,
  data
) {
  return new Promise((resolve, reject) => {
    if (en && msg && data) {
      // data = JSON.parse(
      //     JSON.stringify(data).replace(
      //         new RegExp("{{base_url}}", "g"),
      //         config.BASE_URL
      //     )
      // );
      io.to(socketid).emit("res", {
        error,
        auth,
        en,
        msg,
        data,
      });
    } else {
      io.to(socketid).emit("res", {
        error: true,
        en: "err",
        data: {},
        msg: "Technical Error",
        auth: true,
      });
    }
    resolve();
  });
}

async function emitToRoom(roomId, error = false, auth = true, en, msg, data) {
  return new Promise(async (resolve, reject) => {
    if (roomId && data) {
      // data = JSON.parse(
      //     JSON.stringify(data).replace(
      //         new RegExp("{{base_url}}", "g"),
      //         config.BASE_URL
      //     )
      // );
      let final = {
        error,
        auth,
        en,
        msg,
        data,
      };
      console.log("emiting ", final);
      io.sockets.in(roomId).emit("res", final);
      resolve(true);
    } else {
      console.log("error in emitToRoom", roomId, data);
      resolve(true);
    }
  });
}

async function joinContestRoom(socket, roomId) {
  roomId = roomId.toString();
  socket.join(roomId);
  // console.log(io.sockets.clients().adapter.rooms)
  // io.sockets.sockets[socket.id].leave(roomId)
  // console.log(io.sockets.clients().adapter.rooms)
}

async function leaveContestRoom(socket, roomId) {
  return new Promise(async (resolve, reject) => {
    roomId = roomId.toString();
    socket.leave(roomId);
    resolve();
    // console.log(io.sockets.clients().adapter.rooms)
    // io.sockets.sockets[socket.id].leave(roomId)
    // console.log(io.sockets.clients().adapter.rooms)
  });
}

async function generateInvoice(examId) {
  let examData = await Modal.Exams.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(examId),
        registrationClosingDate: { $lte: new Date() },
      },
    },
    {
      $lookup: {
        from: "useranswers",
        let: { examId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$$examId", "$examId"],
              },
            },
          },
        ],
        as: "examUsers",
      },
    },
    {
      $addFields: { examUsers: { $size: "$examUsers" } },
    },
    {
      $project: {
        examUsers: 1,
        entryFee: 1,
        prizePool: 1,
      },
    },
  ]);
  if (!examData.length) return false;
  const { prizePool, entryFee, examUsers } = examData[0];
  const totalContribution = entryFee * examUsers;
  console.log("totalContribution=>", totalContribution);
  console.log(prizePool);
  const netProfit = totalContribution - prizePool;
  console.log(netProfit);
  if (netProfit <= 0) return false;
  const platformFee =
    Math.round(Number(netProfit / examUsers) * 100 + Number.EPSILON) / 100;
  const platformFeeWithoutGST =
    Math.round(Number((platformFee * 100) / 118) * 100 + Number.EPSILON) / 100;
  const platformFeesGST =
    Math.round(Number((platformFee * 18) / 118) * 100 + Number.EPSILON) / 100;
  console.log(netProfit, platformFee, platformFeeWithoutGST, platformFeesGST);
  let intraState = await Modal.Users.distinct("_id", { state: /gujarat/gi });
  console.log(intraState);
  let condition = { examId: examId, type: "EXAM_FEES_DEDUCTION" };
  if (intraState.length) {
    condition.userId = { $nin: intraState };
    const sgst =
      Math.round(Number((platformFee * 9) / 118) * 100 + Number.EPSILON) / 100;
    const cgst =
      Math.round(Number((platformFee * 9) / 118) * 100 + Number.EPSILON) / 100;
    await Service.update(
      Modal.Transactions,
      {
        userId: { $in: intraState },
        examId: examId,
        type: "EXAM_FEES_DEDUCTION",
      },
      {
        platformFees: platformFee,
        platformFeesWithoutGST: platformFeeWithoutGST,
        sgst: sgst,
        cgst: cgst,
      },
      { multi: true }
    );
  }
  await Service.update(
    Modal.Transactions,
    { ...condition },
    { platformFees: platformFee, platformFeeWithoutGST: platformFeeWithoutGST },
    { multi: true }
  );
  await generateInvoicePDF(examId);
  await generateWinningInvoicePDF(examId);
}

function validateObjectId(...args) {
  flag = true;
  for (var i = 0; i < args.length; i++) {
    if (
      typeof args[i] == "undefined" ||
      args[i] === "" ||
      !mongoose.Types.ObjectId.isValid(args[i])
    ) {
      flag = false;
      // console.log("error in parmas ===>>>", args[i], i);
      break;
    }
  }
  return flag;
}

async function destroyRooms(roomName) {
  return new Promise(async (resolve, reject) => {
    io.of("/")
      .in(roomName)
      .clients((error, socketIds) => {
        if (error) throw error;
        console.log(socketIds);
        for (i in socketIds) {
          io.sockets.connected[socketIds[i]].leave(roomName);
        }
        resolve(true);
      });
  });
}

async function storeSocketId(socketId, userId) {
  let resp = await Service.findAndUpdate(
    Modal.Users,
    {
      _id: userId,
    },
    {
      socketId: socketId,
    }
  );
  return resp;
}

async function numberToWords(s) {
  var th = ["", "thousand", "million", "billion", "trillion"];
  var dg = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  var tn = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  var tw = [
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  s = s.toString();
  s = s.replace(/[\, ]/g, "");
  if (s != parseFloat(s)) return "not a number";
  var x = s.indexOf(".");
  if (x == -1) x = s.length;
  if (x > 15) return "too big";
  var n = s.split("");
  var str = "";
  var sk = 0;
  for (var i = 0; i < x; i++) {
    if ((x - i) % 3 == 2) {
      if (n[i] == "1") {
        str += tn[Number(n[i + 1])] + " ";
        i++;
        sk = 1;
      } else if (n[i] != 0) {
        str += tw[n[i] - 2] + " ";
        sk = 1;
      }
    } else if (n[i] != 0) {
      str += dg[n[i]] + " ";
      if ((x - i) % 3 == 0) str += "hundred ";
      sk = 1;
    }
    if ((x - i) % 3 == 1) {
      if (sk) str += th[(x - i - 1) / 3] + " ";
      sk = 0;
    }
  }
  if (x != s.length) {
    var y = s.length;
    str += "point ";
    for (var i = x + 1; i < y; i++) str += dg[n[i]] + " ";
  }
  return str.replace(/\s+/g, " ");
}

async function inWords(n) {
  if (n < 1e3) return n;
  if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
  if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function generatePDFFromHTML(html, fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      pdf
        .create(html, { format: "A3" })
        .toFile(`./${fileName}.pdf`, async function (err, res) {
          console.log(res.filename);
          resolve(res.filename);
        });
    } catch (err) {
      console.log(err);
      resolve(false);
    }
  });
}

async function generateInvoicePDF(examId) {
  let examUsersTransections = await Service.populateData(
    Modal.Transactions,
    {
      examId: examId,
      type: CONFIG.APP_CONSTANTS.DATABASE.TRANSECTIONS.EXAM_FEES,
      invoiceLink: { $exists: false },
    },
    {},
    {},
    [{ path: "examId", select: "name", model: "Exams" }]
  );

  // console.log(examUsersTransections);
  let pdfData = fs.readFileSync("./files/index.html", "utf-8");
  for (i in examUsersTransections) {
    const {
      _id,
      invoiceNumber,
      createdAt,
      amount,
      sgst,
      cgst,
      igst,
      platformFees,
      platformFeesWithoutGST,
      examId: { name },
    } = examUsersTransections[i];
    let finalPDFData = "";
    if (platformFees == 0) continue;
    console.log(
      invoiceNumber,
      amount,
      sgst,
      cgst,
      igst,
      platformFees,
      platformFeesWithoutGST
    );
    const invoiceDate = moment(createdAt).format("DD-MM-YYYY");
    finalPDFData = pdfData.replace(/{{invoiceDate}}/gi, invoiceDate);
    finalPDFData = finalPDFData.replace(/{{invoiceNo}}/gi, invoiceNumber);
    finalPDFData = finalPDFData.replace(/{{examName}}/gi, name);
    finalPDFData = finalPDFData.replace(/{{transectionId}}/gi, _id);
    finalPDFData = finalPDFData.replace(/{{platformFee}}/gi, platformFees);
    finalPDFData = finalPDFData.replace(/{{SGST}}/gi, sgst);
    finalPDFData = finalPDFData.replace(/{{CGST}}/gi, cgst);
    finalPDFData = finalPDFData.replace(/{{IGST}}/gi, igst);
    finalPDFData = finalPDFData.replace(
      /{{platformFeeWithoutGST}}/gi,
      platformFeesWithoutGST
    );
    let platformFeeInWords = await numberToWords(platformFees);
    platformFeeInWords =
      platformFeeInWords[0].toUpperCase() + platformFeeInWords.substring(1);
    finalPDFData = finalPDFData.replace(
      /{{platformFeeInWords}}/gi,
      platformFeeInWords
    );

    let fileName = invoiceNumber.replace(/\//gi, "");
    fileName = fileName.replace(/#/gi, "");
    let finalFilename = await generatePDFFromHTML(finalPDFData, fileName);
    const pdf = fs.readFileSync(finalFilename);
    console.log(finalFilename);
    const base64data = Buffer.from(pdf, "binary");
    const fileUrl = await UploadMultipart.uploadPdfBuffer(
      `${fileName}.pdf`,
      base64data
    );
    console.log("=>>", fileUrl);
    await Service.findAndUpdate(
      Modal.Transactions,
      { _id: _id },
      { invoiceLink: fileUrl }
    );
    const isExists = await fs.existsSync(finalFilename);
    if (isExists) await fs.unlinkSync(finalFilename);
  }
}

async function getDateTimeBeforeMinutes(dateString, minutes) {
  let newDate = new Date(dateString);
  newDate.setMinutes(newDate.getMinutes() - minutes);
  return newDate;
}

async function getAllUserFCMToken() {
  const data = await Modal.Users.aggregate([
    {
      $match: {
        roles: "USER",
        isDeleted: false,
        FCMToken: { $exists: true },
      },
    },
    {
      $group: {
        _id: null,
        FCMTokens: { $addToSet: "$FCMToken" },
        userId: { $addToSet: "$_id" },
      },
    },
  ]);
  return data.length ? data[0] : {};
}

async function getAllUserEmails() {
  const data = await Modal.Users.aggregate([
    {
      $match: {
        roles: "USER",
        isDeleted: false,
        $and: [
          { name: { $exists: true } },
          { email: { $exists: true } },
          { email: { $ne: "" } },
          { name: { $ne: "" } },
        ],
        // FCMToken: { $exists: true }
      },
    },
    {
      $group: {
        _id: null,
        emailsData: {
          $push: { name: "$name", email: "$email", userId: "$_id" },
        },
      },
    },
  ]);
  return data.length ? data[0] : {};
}

async function orderStatusChange() {
  const query = {
    orderStatus: "PENDING",
    createdAt: {
      $lte: new Date(new Date().getTime() - 1000 * 60 * 60)
    }
  }
  const update = {
    orderStatus: CONFIG.APP_CONSTANTS.DATABASE.ORDER_STATUS.UNSHIPPED
  }
  await Service.update(Modal.Orders, query, update);
  // console.log('order status change successfully')
}


async function offerStatusChange() {
  const query = {
    offerStatus: "ACTIVE",
    endDate: {
      $lt: new Date()
    }
  }
  const update = {
    offerStatus: CONFIG.APP_CONSTANTS.DATABASE.OFFER_STATUS.EXPIRY
  }
  await Service.update(Modal.Offer, query, update);

}

module.exports = {
  failActionFunction: failActionFunction,
  sendSuccess: sendSuccess,
  sendError: sendError,
  CryptData: CryptData,
  comparePassword: comparePassword,
  CONFIG: CONFIG,
  uploadImage: uploadImage,
  logout: logout,
  generateRandomString: generateRandomString,
  asyncForEach: asyncForEach,
  emitToUser: emitToUser,
  emitToRoom: emitToRoom,
  emitToSocketId: emitToSocketId,
  joinContestRoom: joinContestRoom,
  leaveContestRoom: leaveContestRoom,
  validateObjectId: validateObjectId,
  destroyRooms: destroyRooms,
  storeSocketId: storeSocketId,
  inWords: inWords,
  randomIntFromInterval: randomIntFromInterval,
  generateInvoice: generateInvoice,
  generateInvoicePDF: generateInvoicePDF,
  numberToWords: numberToWords,
  generatePDFFromHTML: generatePDFFromHTML,
  getDateTimeBeforeMinutes: getDateTimeBeforeMinutes,
  getAllUserFCMToken: getAllUserFCMToken,
  getAllUserEmails: getAllUserEmails,
  uploadVideo: uploadVideo,
  uploadOtherFile: uploadOtherFile,
  authorizationHeaderObj: authorizationHeaderObj,
  deleteS3File: deleteS3File,
  orderStatusChange: orderStatusChange,
  offerStatusChange: offerStatusChange
};
