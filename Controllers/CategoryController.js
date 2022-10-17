const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const TokenManager = require("../Lib/TokenManager");
const mongoose = require("mongoose");
const Model = require("../Models");


//add edit category
async function addEditCategory(payloadData, userData) {
    try {
        const exit = await Service.findOne(Model.Categories, { name: payloadData.name, isDeleted: false })
        if (exit) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.CATEGORY_ALREAY_EXIT);
        }
        let data;
        // update category
        if (payloadData.categoryId) {
            data = await Service.findAndUpdate(
                Model.Categories,
                { _id: payloadData.categoryId },
                payloadData,
                { new: true }
            );
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
        }
        // add category
        else {
            payloadData.addedBy = userData._id;
            data = await Service.saveData(Model.Categories, payloadData);
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        }
        return data;
    } catch (err) {
        console.log(err);
    }
}

//fetch category
async function fetchCategories(queryData) {
    try {
        const { skip = undefined, limit = undefined, search, active = undefined } = queryData;
        let query = { isDeleted: false, parentCategoryId: null }
        let projection = { isDeleted: 0, __v: 0 }
        let options = { sort: { _id: -1 } };
        if (typeof skip !== "undefined" && typeof limit !== "undefined")
            options = { skip: skip, limit: limit, sort: { _id: -1 } };
        if (search)
            query.name = new RegExp(search, "ig");
        if (typeof active !== "undefined")
            query.active = active;
        let data = await Service.getData(Model.Categories, query, projection, options)
        let total = await Service.count(Model.Categories, query)
        return {
            categoryData: data,
            total: total
        }
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//delete category
async function deleteCategoryById(paramsData, userData) {
    try {
        const { categoryId } = paramsData;
        const resp = await Service.findAndUpdate(Model.Categories, { _id: categoryId }, { $set: { isDeleted: true } });
        if (resp)
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED;
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST)
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//category status change
async function categoryStatusChange(paramsData) {
    try {
        let find = await Service.findOne(Model.Categories, { _id: paramsData.categoryId })
        if (!find)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST)
        let active
        if (find.active)
            active = false
        else
            active = true
        let data = await Service.findAndUpdate(Model.Categories, { _id: paramsData.categoryId }, { active: active }, { lean: true, new: true })
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        if (active)
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.ACTIVE;
        else
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.INACTIVE;

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//add-edit specific-category
async function addEditSpecificCategory(payloadData, userData) {
    try {
        const exit = await Service.findOne(Model.Categories, { name: payloadData.name });
        if (exit) {
            return Promise.reject(
                Config.APP_CONSTANTS.STATUS_MSG.ERROR.CATEGORY_ALREAY_EXIT
            );
        }
        payloadData.addedBy = userData._id;
        let data;
        // update specific-category
        if (payloadData.specificIdCategoryId) {
            data = await Service.findAndUpdate(
                Model.Categories,
                { _id: payloadData.specificIdCategoryId },
                payloadData,
                { new: true }
            );
            if (!data)
                return Promise.reject(
                    Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST
                );
        }
        // add specific-category
        else {
            data = await Service.saveData(Model.Categories, payloadData);
            if (!data)
                return Promise.reject(
                    Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR
                );
        }
        return data;
    } catch (err) {
        console.log(err.message);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//get all category name
async function fetchAllCategoryName(queryData) {
    try {
        let query = { isDeleted: false, active: true, parentCategoryId: null, childCategoryId: null };
        if (queryData.parentCategoryId) {
            query.parentCategoryId = queryData.parentCategoryId
        }
        if (queryData.childCategoryId) {
            query.childCategoryId = queryData.childCategoryId
        }
        const categories = await Service.getData(Model.Categories, query, {
            name: 1,
        });
        if (!categories)
            return Promise.reject(
                Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR
            );
        return categories;
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}


//allCategory
async function allCategory() {
    try {
        let condition = {
            isDeleted: false, active: true, parentCategoryId: null, childCategoryId: null
        }
        const aggregate = [
            { $match: { ...condition } },
            {
                $project: {
                    name: 1
                }
            }
        ];
        aggregate.push(
            {
                $lookup: {
                    from: "categories",
                    let: { "parentCategoryId": "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$parentCategoryId", "$$parentCategoryId"] },
                                        { $eq: ["$childCategoryId", null] },
                                        { $eq: ["$isDeleted", false] },
                                        { $eq: ["$active", true] },
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
                    let: { "parentCategoryId": "$_id", "childCategoryId": "$subCategoryData._id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$parentCategoryId", "$$parentCategoryId"] },
                                        { $eq: ["$childCategoryId", "$$childCategoryId"] },
                                        { $eq: ["$isDeleted", false] },
                                        { $eq: ["$active", true] },
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
                    as: "subCategoryData.specificCategoryData"
                },
            },
            {
                $group: {
                    _id: "$_id",
                    root: { $first: "$$ROOT" },
                    subCategoryData: { $push: "$subCategoryData" },
                }
            },
            {
                "$replaceRoot": { "newRoot": { "$mergeObjects": ["$root", { "subCategoryData": "$subCategoryData" }] } }
            },

        )
        const data = await Model.Categories.aggregate(aggregate);
        return {
            allCategoryData: data.length ? data : []
        };
    } catch (err) {
        console.log(err);
    }
}

//fetch SpecificCategories
async function fetchSpecificCategories(queryData) {
    try {
        const { parentCategoryId, childCategoryId, skip = undefined, limit = undefined, search, active = undefined } = queryData;
        let query = { isDeleted: false, parentCategoryId: parentCategoryId, childCategoryId: childCategoryId }
        let projection = { isDeleted: 0, __v: 0 }
        let options = { sort: { _id: -1 } };
        if (typeof skip !== "undefined" && typeof limit !== "undefined")
            options = { skip: skip, limit: limit, sort: { _id: -1 } };
        if (search)
            query.name = new RegExp(search, "ig");
        if (typeof active !== "undefined")
            query.active = active;
        let data = await Service.populateData(Model.Categories, query, projection, options, [{
            path: "parentCategoryId",
            select: "name",
            model: "Categories",
        },
        {
            path: "childCategoryId",
            select: "name",
            model: "Categories",
        }])
        let total = await Service.count(Model.Categories, query)
        return {
            specificCategoryData: data,
            total: total
        }
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}
module.exports = {
    addEditCategory,
    fetchCategories,
    deleteCategoryById,
    categoryStatusChange,
    addEditSpecificCategory,
    fetchAllCategoryName,
    allCategory,
    fetchSpecificCategories
}

