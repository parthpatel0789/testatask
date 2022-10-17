let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Config = require('../Config');

let Product = new Schema({
    name: { type: String },
    code: { type: String, trim: true },
    status: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    isReject: { type: Boolean, default: false },
    categoryId: { type: Schema.ObjectId, ref: 'Categories' },
    subCategoryId: { type: Schema.ObjectId, ref: 'Categories' },
    specificIdCategoryId: { type: Schema.ObjectId, ref: 'Categories' },
    brandId: { type: Schema.ObjectId, ref: 'Brand' },
    discount: { type: Number, default: 0 },
    totalOrder: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    productAvailable: {
        type: String, trim: true,
        enum: Object.values(Config.APP_CONSTANTS.DATABASE.PRODUCT_STATUS),
        default: Config.APP_CONSTANTS.DATABASE.PRODUCT_STATUS.STOCK
    },
    variants: [
        {
            sku: { type: String },
            title: { type: String },
            price: { type: Number },
            qty: { type: Number, default: 0 },
            variantAvailable: {
                type: String, trim: true,
                enum: Object.values(Config.APP_CONSTANTS.DATABASE.PRODUCT_STATUS),
                default: Config.APP_CONSTANTS.DATABASE.PRODUCT_STATUS.STOCK
            },
            variantImage: { type: String }

        }
    ],
    options: [
        {
            name: { type: String },
            values: []
        }
    ],
    images: [{ type: String }],
    description: { type: String },
    isDeleted: { type: Boolean, default: false },
    addedBy: { type: Schema.ObjectId },
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', Product);