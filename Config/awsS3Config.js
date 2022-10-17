"use strict";
exports.s3BucketCredentials = {
  bucket: process.env.s3bucket,
  captchaBucket: process.env.s3captchaBucket,
  accessKeyId: process.env.s3accessKeyId,
  secretAccessKey: process.env.s3secretAccessKey,
  s3URL: process.env.s3URL,
};
