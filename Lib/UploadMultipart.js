let Config = require("../Config");
let UniversalFunctions = require("../Utils/UniversalFunction");
let Path = require("path");
let async = require("async");
let fsExtra = require("fs-extra");
let Fs = require("fs");
let AWS = require("aws-sdk");
let mime = require("mime-types");
const getVideoInfo = require("get-video-info");

AWS.config.update({
  accessKeyId: Config.awsS3Config.s3BucketCredentials.accessKeyId,
  secretAccessKey: Config.awsS3Config.s3BucketCredentials.secretAccessKey,
  //  region:' '
});
var s3 = new AWS.S3();

function uploadMultipart(fileInfo, uploadCb) {
  var options = {
    Bucket: Config.awsS3Config.s3BucketCredentials.bucket,
    Key: fileInfo.filename,
    ACL: "public-read",
    ContentType: mime.lookup(fileInfo.filename),
    ServerSideEncryption: "AES256",
  };

  s3.createMultipartUpload(options, (mpErr, multipart) => {
    if (!mpErr) {
      //console.log("multipart created", multipart.UploadId);
      Fs.readFile(fileInfo.path, (err, fileData) => {
        var partSize = 5242880;
        var parts = Math.ceil(fileData.length / partSize);

        async.times(
          parts,
          (partNum, next) => {
            var rangeStart = partNum * partSize;
            var end = Math.min(rangeStart + partSize, fileData.length);

            console.log(
              "uploading ",
              fileInfo.filename,
              " % ",
              (partNum / parts).toFixed(2)
            );

            partNum++;
            async.retry(
              retryCb => {
                s3.uploadPart(
                  {
                    Body: fileData.slice(rangeStart, end),
                    Bucket: Config.awsS3Config.s3BucketCredentials.bucket,
                    Key: fileInfo.filename,
                    PartNumber: partNum,
                    ACL: "public-read",
                    UploadId: multipart.UploadId,
                  },
                  (err, mData) => {
                    retryCb(err, mData);
                  }
                );
              },
              (err, data) => {
                console.log(data);
                next(err, { ETag: data.ETag, PartNumber: partNum });
              }
            );
          },
          (err, dataPacks) => {
            s3.completeMultipartUpload(
              {
                Bucket: Config.awsS3Config.s3BucketCredentials.bucket,
                Key: fileInfo.filename,
                MultipartUpload: {
                  Parts: dataPacks,
                },
                UploadId: multipart.UploadId,
              },
              uploadCb
            );
          }
        );
      });
    } else {
      uploadCb(mpErr);
    }
  });
}

function uploadFile1(fileObj, uploadCb) {
  var fileName = Path.basename(fileObj.finalUrl);
  var stats = Fs.statSync(fileObj.path);

  var fileSizeInBytes = stats["size"];
  if (fileSizeInBytes < 10242880) {
    async.retry(retryCb => {
      Fs.readFile(fileObj.path, (err, fileData) => {
        s3.putObject(
          {
            Bucket: Config.awsS3Config.s3BucketCredentials.bucket,
            Key: fileName,
            Body: fileData,
            ACL: "public-read",
            ContentType: mime.lookup(fileName),
          },
          retryCb
        );
      });
    }, uploadCb);
  } else {
    fileObj.filename = fileName;
    uploadMultipart(fileObj, uploadCb);
  }
}

var uploadFilesOnS3 = function (fileData, callback) {
  var imageFile = false, videoFile = false, audioFile = false, otherFile = false;
  var filename;
  let ext;
  let fileType = '';
  var dataToUpload = []

  //check file data
  if (!fileData || !fileData.filename) {
    return callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
  } else {
    console.log(fileData, '===============> filedata')
    filename = fileData.filename.toString();
    ext = filename.substr(filename.lastIndexOf('.')).toLowerCase();
    let videosFilesExt = ['.3gp', '.3GP', '.mp4', '.MP4', '.avi', '.AVI', '.mpeg'];
    let imageFilesExt = ['.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG', '.gif', '.GIF'];
    let audioFilesExt = ['.mp3', '.MP3', '.aac'];
    let otherFiles = ['.xlsx', '.pdf', '.csv', '.docx', '.doc', '.ppt', '.pptx', '.html'];

    if (ext) {
      if (imageFilesExt.indexOf(ext) >= 0) {
        imageFile = true
        fileType = 'Pic_';
      }
      else if (videosFilesExt.indexOf(ext) >= 0) {
        videoFile = true
        fileType = 'Vid_';
      }
      else if (audioFilesExt.indexOf(ext) >= 0) {
        audioFile = true;
        fileType = 'Aud_';
      }
      else if (otherFiles.indexOf(ext) >= 0) {
        otherFile = true;
        fileType = 'Doc_';
      }
      else return callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.FILE_TYPE_NOT_ALLOWED)

    } else {
      return callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.FILE_TYPE_NOT_ALLOWED)
    }
  }


  //  create file names ==============

  console.log(fileData.filename)

  fileData.original = getFileNameWithUserId(false, filename, fileType);
  fileData.thumb = "";
  // for set parrallel uploads on s3 bucket

  if (imageFile) {
    // fileData.thumb = getFileNameWithUserId(true, imageFile && filename || (filename.substr(0, filename.lastIndexOf('.'))) + '.jpg');
    // dataToUpload.push({
    //     path: Path.resolve('.') + '/uploads/' + fileData.thumb,
    //     finalUrl: Config.awsS3Config.s3BucketCredentials.s3URL + fileData.thumb,
    // })
  }

  dataToUpload.push({
    path: fileData.path,
    finalUrl: Config.awsS3Config.s3BucketCredentials.s3URL + fileData.original
  });


  async.auto({
    checkVideoDuration: function (cb) {
      if (!imageFile && !otherFile) {
        getVideoInfo(fileData.path).then(info => {
          if (info.format.duration < 10) {
            cb()
          } else {
            cb()
          }
        })
      } else {
        cb()
      }
    },
    creatingThumb: ['checkVideoDuration', function (err, cb) {
      if (imageFile) {
        console.log('=======  IMAGE ===============')
        // createThumbnailImage(fileData.path, Path.resolve('.') + '/uploads/' + fileData.thumb, function (err) {
        //     cb()
        // })
        cb()
      } else if (videoFile) {
        console.log('=======  VIDEO ===============')
        cb()
        // createVideoThumb(fileData, Path.resolve('.') + '/uploads/' + fileData.thumb, function (err) {
        //    if(err) cb(err);
        //     else cb()
        // })
      }
      else {
        console.log('=======  AUDIO/OTHER ===============')
        cb()
      }
    }],
    uploadOnS3: ['creatingThumb', function (err, cb) {
      var functionsArray = [];

      if (imageFile) {
        dataToUpload.forEach(function (obj) {

          functionsArray.push((function (data) {
            return function (internalCb) {
              uploadFile1(data, internalCb)
            }
          })(obj))
        });

        async.parallel(functionsArray, (err, result) => {
          deleteFile(Path.resolve('.') + '/uploads/' + fileData.thumb);
          cb(err)
        })

      }
      else {
        var fileName = Path.basename(dataToUpload[0].finalUrl);
        console.log("#############", fileName);
        Fs.readFile(dataToUpload[0].path, (err, fileData) => {
          s3.putObject({
            Bucket: Config.awsS3Config.s3BucketCredentials.bucket,
            Key: fileName,
            Body: fileData,
            ACL: 'public-read',
            ContentType: mime.lookup(fileName)
          }, cb, err);
        });
      }

    }]
  }, function (err) {
    let type;
    if (imageFile) type = 'IMAGE';
    if (videoFile) type = 'VIDEO';
    if (audioFile) type = 'AUDIO';
    if (otherFile) type = 'OTHER';

    let responseObject = {
      fileName: fileData.filename,
      ext: ext.replace('.', ''),
      original: Config.awsS3Config.s3BucketCredentials.s3URL + fileData.original,
      thumbnail: Config.awsS3Config.s3BucketCredentials.s3URL + fileData.thumb,
      type: type
    };

    if (audioFile || otherFile || videoFile) responseObject.thumbnail = responseObject.original;

    callback(err, responseObject);
  })
};

function deleteFile(path) {
  fsExtra.remove(path, function (err) {
    console.log("error deleting file>>", err);
  });
}
function deleteFromS3(fileName, callback) {
  let key = fileName.split("/");
  s3.deleteObject(
    {
      Bucket: Config.awsS3Config.s3BucketCredentials.bucket,
      Key: key[3],
    },
    function (err, data) {
      callback(err, data);
    }
  );
}
/*
function createThumbnailImage(originalPath, thumbnailPath, callback) {
    var gm = require('gm').subClass({imageMagick: true});
    gm(originalPath)
        .resize(Config.APP_CONSTANTS.SERVER.THUMB_WIDTH, Config.APP_CONSTANTS.SERVER.THUMB_HEIGHT, "!")
        .autoOrient()
        .write(thumbnailPath, function (err, data) {
            callback(err)
        })
};*/

function createThumbnailImage(originalPath, thumbnailPath, callback) {
  var gm = require("gm").subClass({ graphicsMagick: true });

  var readStream = Fs.createReadStream(originalPath);
  gm(readStream).size({ bufferStream: true }, function (err, size) {
    if (size) {
      this.thumb(
        size.width,
        size.height,
        thumbnailPath,
        20,
        /* .autoOrient()
                     .write(thumbnailPath1,*/ function (err, data) {
          if (err) callback(err);
          else callback();
        }
      );
    } else {
      this.thumb(
        50,
        50,
        thumbnailPath,
        20,
        /* .autoOrient()
                     .write(thumbnailPath1,*/ function (err, data) {
          if (err) callback(err);
          else callback();
        }
      );
    }
    /*  if (size.width > 200) {
                  this.resize(200, (size.height / size.width) * 200)
              } else {
                  this.resize(100, (size.height / size.width) * 100)
              }*/
  });
}

function createVideoThumb(fileData, thumbnailPath, thumbnailName, callback) {
  const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
  var ffmpeg = require("fluent-ffmpeg");
  ffmpeg.setFfmpegPath(ffmpegPath);
  new ffmpeg(fileData.path)
    .on("end", function () {
      callback();
    })
    .on("error", function (err) {
      callback(err);
    })
    .takeScreenshots({
      count: 1,
      timestamps: ['00:00:00'],
      folder: thumbnailPath,
      filename: thumbnailName,
      // size: "320x240",
    });
}

let getFileNameWithUserId = function (thumbFlag, fullFileName, other = false) {
  let prefix = Config.APP_CONSTANTS.DATABASE.PROFILE_PIC_PREFIX.ORIGINAL;
  let id = Math.round(Math.random() * new Date().getTime());
  let ext =
    fullFileName &&
    fullFileName.length > 0 &&
    fullFileName.substr(
      fullFileName.lastIndexOf(".") || 0,
      fullFileName.length
    );
  if (thumbFlag) {
    prefix = Config.APP_CONSTANTS.DATABASE.PROFILE_PIC_PREFIX.THUMB;
  }
  if (other) prefix = other;
  return prefix + id + ext;
};

let uploadPdfBuffer = async function (fileName, fileBuffer) {
  return new Promise(async (resolve, reject) => {
    try {
      var options = {
        Bucket: Config.awsS3Config.s3BucketCredentials.bucket,
        Key: fileName,
        Body: fileBuffer,
        ACL: "public-read",
        ContentType: mime.lookup(fileName),
      };
      console.log(options);
      s3.upload(options, function (err, resp) {
        console.log(resp);
        console.log("Successfully uploaded package.");
        resolve(resp.Location);
      });
    } catch (err) {
      console.log(err);
      resolve(false);
    }
  });
};

module.exports = {
  uploadFilesOnS3: uploadFilesOnS3,
  deleteFromS3: deleteFromS3,
  deleteFile: deleteFile,
  createThumbnailImage: createThumbnailImage,
  uploadPdfBuffer: uploadPdfBuffer,
};
