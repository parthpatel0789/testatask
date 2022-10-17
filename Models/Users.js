let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Users = new Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    password: {
        type: String
    },
    gender: {
        type: String
    },
    dob: {
        type: String
    },
    alternateNumber: {
        type: String
    },
    addresses: [{
        name: { type: String },
        mobile: { type: String },
        address: { type: String },
        pincode: { type: String },
        location: { type: String },
        city: { type: String },
        state: { type: String },
        type: { type: String },
        default: { type: Boolean, default: false },
    }],
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    accessToken: { type: String, trim: true, index: true, sparse: true, default: null },
    custId: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Users', Users);




