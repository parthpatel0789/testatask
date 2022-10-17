
let config = require('../Config');
let nodemailer = require('nodemailer');
let sesTransport = require('nodemailer-ses-transport');
const { google } = require('googleapis');
const CLIENT_ID = process.env.CLIENT_ID
const CLEINT_SECRET = process.env.CLEINT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN
const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLEINT_SECRET,
    REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

exports.sendEmail = async function (email, subject, content, attachment) {

    // let transporter = nodemailer.createTransport(sesTransport({
    //     accessKeyId : aws.s3BucketCredentials.accessKeyId,
    //     secretAccessKey: aws.s3BucketCredentials.secretAccessKey,
    //     region:'ap-south-1'
    // }));
    const accessToken = await oAuth2Client.getAccessToken();
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.mail,
            clientId: CLIENT_ID,
            clientSecret: CLEINT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken,
        },
    });

    return new Promise((resolve, reject) => {
        let obj = {
            from: process.env.mail, // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            html: content
        };
        if (attachment)
            obj.attachments = attachment

        transporter.sendMail(obj, (err, res) => {
            console.log('send mail', err, res);
            resolve()
        });
    })
};
