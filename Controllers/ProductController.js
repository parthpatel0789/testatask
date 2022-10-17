const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const TokenManager = require("../Lib/TokenManager");
const mongoose = require("mongoose");
const Model = require("../Models");

//add edit product
async function addEditProduct(payloadData, userData) {
    try {

        if (userData.role == 'ADMIN' || userData.role == 'SUBADMIN') {
            payloadData.isPublic = true
        }
        payloadData.addedBy = userData._id;
        let data;
        // update product
        if (payloadData.productId) {
            data = await Service.findAndUpdate(
                Model.Product,
                { _id: payloadData.productId },
                payloadData,
                { new: true }
            );
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
        }
        // add category
        else {
            payloadData.available = Config.APP_CONSTANTS.DATABASE.PRODUCT_STATUS.STOCK
            const exit = await Service.findOne(Model.Product, { name: payloadData.name })
            if (exit) {
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.PRODUCT_ALREAY_EXIT);
            }
            if (!payloadData.variants) {
                let variant = {
                    sku: payloadData.sku,
                    title: payloadData.name,
                    price: payloadData.price,
                    qty: payloadData.quantity
                }
                payloadData.variants = [variant]
            }
            data = await Service.saveData(Model.Product, payloadData);
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        }
        return data;
    } catch (err) {
        console.log(err);
    }
}

//fetchProducts
async function fetchProducts(queryData, userData) {
    try {
        let { active = undefined, skip = undefined, limit = undefined, search,
            categoryId, subCategoryId, specificCategoryIds, colors, sizes, isReject = undefined,
            isBlocked = undefined, productId } = queryData;
        let condition = { isDeleted: false, active: true, isPublic: true, isReject: false, isBlocked: false }
        if (productId) {
            condition._id = mongoose.Types.ObjectId(productId)
        }
        if (categoryId) {
            condition.categoryId = mongoose.Types.ObjectId(categoryId)
        }
        if (subCategoryId) {
            condition.subCategoryId = mongoose.Types.ObjectId(subCategoryId)
        }
        if (typeof queryData.isPublic !== "undefined") {
            condition.isPublic = queryData.isPublic
        }
        if (userData && userData.role == 'vendor') {
            condition.addedBy = mongoose.Types.ObjectId(userData._id)
        }
        if (typeof search !== "undefined") {
            condition.name = new RegExp(search, "ig");
        }
        if (typeof active !== "undefined") {
            condition.active = active;
        }
        if (typeof isReject !== "undefined") {
            condition.isReject = isReject;
        }
        if (typeof isBlocked !== "undefined") {
            condition.isBlocked = isBlocked;
        }
        if (typeof specificCategoryIds == 'string') {
            specificCategoryIds = JSON.parse(specificCategoryIds)
        }
        if (specificCategoryIds) {
            specificCategoryId = specificCategoryIds.map((id) => mongoose.Types.ObjectId(id))
            condition.specificIdCategoryId = { $in: specificCategoryId }
        }
        if (queryData.minPrice !== undefined && queryData.maxPrice !== undefined) {
            condition['variants.price'] = { $gte: queryData.minPrice, $lte: queryData.maxPrice }
        }
        if (typeof colors == 'string') {
            colors = JSON.parse(colors)
        }
        if (colors !== undefined) {
            color = colors.map((color) => color)
            condition['options.values'] = { $in: color }
        }
        if (typeof sizes == 'string') {
            sizes = JSON.parse(sizes)
        }
        if (sizes !== undefined) {
            size = sizes.map((size) => size)
            condition['options.values'] = { $in: size }
        }
        let sorting
        if (queryData.filter == "high") {
            sorting = { 'variants.price': -1 }
        } else if (queryData.filter == "low") {
            sorting = { 'variants.price': 1 }
        } else {
            sorting = { _id: -1 }
        }
        const aggregate = [
            { $match: { ...condition } },
            // { $sort: sorting }
        ];
        if (typeof skip !== "undefined" && typeof limit !== "undefined") {
            aggregate.push({ $skip: skip }, { $limit: limit }, { $sort: sorting });
        }
        aggregate.push(
            {
                $lookup: {
                    from: "vendors",
                    let: { "vendorId": "$addedBy" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$vendorId"] },
                                        { $eq: ["$isDeleted", false] },
                                        { $eq: ["$isBlocked", false] },
                                        { $eq: ["$isPublished", true] },
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                fullName: 1,
                                userName: 1,
                                email: 1,
                                mobile: 1,
                            }
                        }
                    ],
                    as: "vendorData"
                },
            },
            {
                $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "brands",
                    let: { "brandId": "$brandId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$brandId"] },
                                        { $eq: ["$isDeleted", false] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1
                            }
                        }
                    ],
                    as: "brandData"
                },
            },
            {
                $unwind: { path: "$brandData", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "categories",
                    let: { "categoryId": "$categoryId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$categoryId"] },
                                        { $eq: ["$isDeleted", false] },
                                        { $eq: ["$active", true] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1
                            }
                        }
                    ],
                    as: "categoryData"
                },
            },
            {
                $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "categories",
                    let: { "subCategoryId": "$subCategoryId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$subCategoryId"] },
                                        { $eq: ["$isDeleted", false] },
                                        { $eq: ["$active", true] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1
                            }
                        }
                    ],
                    as: "subCategoryData"
                },
            },
            {
                $unwind: { path: "$subCategoryData", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "categories",
                    let: { "specificIdCategoryId": "$specificIdCategoryId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$specificIdCategoryId"] },
                                        { $eq: ["$isDeleted", false] },
                                        { $eq: ["$active", true] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1
                            }
                        }
                    ],
                    as: "specificCategoryData"
                },
            },
            {
                $unwind: { path: "$specificCategoryData", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "reviews",
                    let: { "productId": "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$productId", "$$productId"] },
                                        { $eq: ["$isDeleted", false] },
                                        { $eq: ["$isPublic", true] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                review: 1,
                                rating: 1,
                                addedBy: 1,
                                createdAt: 1
                            }
                        }
                    ],
                    as: "reviewData"
                },
            },
            {
                $unwind: { path: "$reviewData", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "users",
                    let: { "userId": "$reviewData.addedBy" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$userId"] },
                                        { $eq: ["$isDeleted", false] },
                                        { $eq: ["$isBlocked", false] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                firstName: 1,
                                lastName: 1,
                                email: 1,
                                mobile: 1
                            }
                        }
                    ],
                    as: "reviewData.userData"
                },
            },
            {
                $unwind: { path: "$reviewData.userData", preserveNullAndEmptyArrays: true },
            },
            {
                $group: {
                    _id: "$_id",
                    root: { $first: "$$ROOT" },
                    reviewData: { $push: "$reviewData" }
                }
            },
            {
                "$addFields": {
                    reviewData: {
                        $filter: {
                            input: '$reviewData',
                            as: 'reviewData',
                            cond: { "$ne": [{ $type: '$$reviewData._id' }, "missing"] }
                        }
                    },
                }
            },
            {
                "$replaceRoot": { "newRoot": { "$mergeObjects": ["$root", { "reviewData": "$reviewData" }] } }
            },
        )
        aggregate.push({
            $sort: sorting
        })
        const data = await Model.Product.aggregate(aggregate);
        const total = await Service.count(Model.Product, condition);
        return { productData: data.length ? data : [], total: total };
    } catch (err) {
        console.log(err);
    }
}

//fetch Products Filter
async function fetchProductsFilter(queryData) {
    try {
        let { categoryId, subCategoryId } = queryData;
        let condition = {
            isDeleted: false, isPublic: true, active: true,
            categoryId: mongoose.Types.ObjectId(categoryId),
            subCategoryId: mongoose.Types.ObjectId(subCategoryId),
        }
        const aggregate = [
            { $match: { ...condition } },
        ];
        aggregate.push(
            {
                $lookup: {
                    from: "categories",
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$parentCategoryId", mongoose.Types.ObjectId(categoryId)] },
                                        { $eq: ["$childCategoryId", mongoose.Types.ObjectId(subCategoryId)] },
                                        { $eq: ["$isDeleted", false] },
                                        { $eq: ["$active", true] },
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                icon: 1,
                            }
                        }
                    ],
                    as: "specificCategoryData"
                },
            },
            {
                $project: {
                    specificCategoryData: 1,
                    variants: 1,
                    sizes: {
                        $filter: {
                            input: "$options",
                            cond: { "$eq": ["$$this.name", "Size"] }
                        }
                    },
                    colors: {
                        $filter: {
                            input: "$options",
                            cond: { "$eq": ["$$this.name", "Color"] }
                        }
                    },
                    materials: {
                        $filter: {
                            input: "$options",
                            cond: { "$eq": ["$$this.name", "Material"] }
                        }
                    },
                    customize: {
                        $filter: {
                            input: "$options",
                            cond: { "$eq": ["$$this.name", "Customize"] }
                        }
                    },
                }
            },
            {
                $unwind: { path: "$sizes", preserveNullAndEmptyArrays: true },
            },
            {
                $unwind: { path: "$sizes.values", preserveNullAndEmptyArrays: true },
            },
            {
                $unwind: { path: "$colors", preserveNullAndEmptyArrays: true },
            },
            {
                $unwind: { path: "$colors.values", preserveNullAndEmptyArrays: true },
            },
            {
                $unwind: { path: "$variants", preserveNullAndEmptyArrays: true },
            },
            {
                $unwind: { path: "$materials", preserveNullAndEmptyArrays: true },
            },
            {
                $unwind: { path: "$materials.values", preserveNullAndEmptyArrays: true },
            },
            {
                $unwind: { path: "$customize", preserveNullAndEmptyArrays: true },
            },
            {
                $unwind: { path: "$customize.values", preserveNullAndEmptyArrays: true },
            },


            {
                $group: {
                    _id: null,
                    specificCategoryData: { $first: "$specificCategoryData" },
                    sizes: { $addToSet: "$sizes.values" },
                    colors: { $addToSet: "$colors.values" },
                    maxPrice: { $max: "$variants.price" },
                    minPrice: { $min: "$variants.price" },
                    Material: { $addToSet: "$materials.values" },
                    Customize: { $addToSet: "$customize.values" }
                }
            },
            { $unset: "_id" }
        )
        const data = await Model.Product.aggregate(aggregate);
        return {
            productFilterData: data.length ? data[0] : []
        };
    } catch (err) {
        console.log(err);
    }
}


//publishProduct
async function publishProduct(paramsData) {
    try {
        const publishProduct = await Service.findAndUpdate(Model.Product,
            { _id: paramsData.productId }, { isPublic: true }, { new: true })
        if (!publishProduct)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return publishProduct
    }
    catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//reject product
async function rejectProduct(paramsData) {
    try {
        const rejectProduct = await Service.findAndUpdate(Model.Product,
            { _id: paramsData.productId }, { isReject: true }, { new: true })
        if (!rejectProduct)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return rejectProduct
    }
    catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//block product
async function blockProduct(paramsData) {
    try {
        let find = await Service.findOne(Model.Product, { _id: paramsData.productId })
        if (!find)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST)
        let isBlocked
        if (find.isBlocked)
            isBlocked = false
        else
            isBlocked = true
        let data = await Service.findAndUpdate(Model.Product, { _id: paramsData.productId }, { isBlocked: isBlocked }, { lean: true, new: true })
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        if (isBlocked)
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.BLOCK;
        else
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UNBLOCK;
    }
    catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//delete product by id
async function deleteProductById(paramsData) {
    try {
        const { productId } = paramsData;
        const resp = await Service.findAndUpdate(
            Model.Product,
            { _id: productId },
            { $set: { isDeleted: true } }
        );
        if (resp) return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED;
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//delete product by id vendor
async function deleteProductByIdVendor(paramsData, userData) {
    try {
        const { productId } = paramsData;
        const resp = await Service.findAndUpdate(
            Model.Product,
            { _id: productId, addedBy: userData._id },
            { $set: { isDeleted: true } }
        );
        if (resp) return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED;
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}
module.exports = {
    addEditProduct,
    fetchProducts,
    fetchProductsFilter,
    publishProduct,
    rejectProduct,
    blockProduct,
    deleteProductById,
    deleteProductByIdVendor
}