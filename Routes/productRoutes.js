const { ProductController: Controller } = require('../Controllers');
const UniversalFunctions = require('../Utils/UniversalFunction');
const Joi = require('joi');
const Config = require('../Config');

module.exports = [

    //add product
    {
        method: 'POST',
        path: '/product',
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    return UniversalFunctions.sendSuccess(null, await Controller.addEditProduct(request.payload, userData))
                }
                catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: 'add edit product API',
            auth: "HybridAuth",
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    productId: Joi.string(),
                    name: Joi.string().required(),
                    sku: Joi.string(),
                    code: Joi.string().required(),
                    categoryId: Joi.string().required(),
                    subCategoryId: Joi.string().required(),
                    specificIdCategoryId: Joi.string().required(),
                    brandId: Joi.string().required(),
                    price: Joi.number().required(),
                    quantity: Joi.number().required(),
                    discount: Joi.number(),
                    description: Joi.string(),
                    images: Joi.array().items(
                        Joi.string()
                    ).required(),
                    variants: Joi.array().items(
                        Joi.object({
                            sku: Joi.string(),
                            title: Joi.string(),
                            qty: Joi.number(),
                            price: Joi.number(),
                            variantImage: Joi.string(),
                        })
                    ),
                    options: Joi.array().items(
                        Joi.object({
                            name: Joi.string(),
                            values: Joi.array(),
                        })
                    )
                }),
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    //get user product
    {
        method: "GET",
        path: "/product",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchProducts(request.query)
                    );
                } catch (e) {
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Fetch products",
            validate: {
                query: Joi.object({
                    skip: Joi.number(),
                    limit: Joi.number(),
                    search: Joi.string(),
                    active: Joi.boolean(),
                    categoryId: Joi.string(),
                    subCategoryId: Joi.string(),
                    specificCategoryIds: Joi.any(),
                    minPrice: Joi.number(),
                    maxPrice: Joi.number(),
                    filter: Joi.string().trim(),
                    colors: Joi.any(),
                    sizes: Joi.any(),
                    barnds: Joi.any(),
                    discounts: Joi.any(),
                }),
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                },
            },
        },
    },

    //get vendor product
    {
        method: "GET",
        path: "/vendor/product",
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    userData.role = 'vendor'
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchProducts(request.query, userData)
                    );
                } catch (e) {
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Fetch products",
            auth: "VendorAuth",
            validate: {
                query: Joi.object({
                    skip: Joi.number(),
                    limit: Joi.number(),
                    search: Joi.string(),
                    active: Joi.boolean(),
                    categoryIds: Joi.any(),
                    minPrice: Joi.number(),
                    maxPrice: Joi.number(),
                    filter: Joi.string().trim(),
                    colors: Joi.any(),
                    sizes: Joi.any(),
                    barnds: Joi.any(),
                    discounts: Joi.any(),
                    isPublic: Joi.boolean(),
                    isReject: Joi.boolean(),
                    isBlocked: Joi.boolean()
                }),
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                },
            },
        },
    },

    //get admin product
    {
        method: "GET",
        path: "/admin/product",
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    userData.role = 'ADMIN'
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchProducts(request.query, userData)
                    );
                } catch (e) {
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Fetch products",
            auth: "AdminAuth",
            validate: {
                query: Joi.object({
                    skip: Joi.number(),
                    limit: Joi.number(),
                    search: Joi.string(),
                    active: Joi.boolean(),
                    categoryIds: Joi.any(),
                    minPrice: Joi.number(),
                    maxPrice: Joi.number(),
                    filter: Joi.string().trim(),
                    colors: Joi.any(),
                    sizes: Joi.any(),
                    barnds: Joi.any(),
                    discounts: Joi.any(),
                    isPublic: Joi.boolean(),
                    isReject: Joi.boolean(),
                    isBlocked: Joi.boolean()
                }),
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                },
            },
        },
    },

    //get product filter
    {
        method: "GET",
        path: "/product_filter",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchProductsFilter(request.query)
                    );
                } catch (e) {
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Fetch product filter",
            validate: {
                query: Joi.object({
                    categoryId: Joi.string().trim().required(),
                    subCategoryId: Joi.string().trim().required()
                }),
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                },
            },
        },
    },

    //publish product
    {
        method: "POST",
        path: "/admin/publishProduct/{productId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.publishProduct(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "publish product",
            auth: "AdminAuth",
            validate: {
                params: Joi.object({
                    productId: Joi.string().required()
                }),
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                },
            },
        },
    },

    //reject product
    {
        method: "POST",
        path: "/admin/rejectProduct/{productId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.rejectProduct(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "reject product",
            auth: "AdminAuth",
            validate: {
                params: Joi.object({
                    productId: Joi.string().required()
                }),
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                },
            },
        },
    },

    //block product
    {
        method: "POST",
        path: "/admin/blockProduct/{productId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.blockProduct(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "block product",
            auth: "AdminAuth",
            validate: {
                params: Joi.object({
                    productId: Joi.string().required()
                }),
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                },
            },
        },
    },


    //get product by id
    {
        method: "GET",
        path: "/product/{productId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchProducts(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "get product by id",
            validate: {
                params: Joi.object({
                    productId: Joi.string().required()
                }),
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                },
            },
        },
    },

    //delete product by id
    {
        method: "DELETE",
        path: "/admin/product/{productId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.deleteProductById(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Delete product by id",
            auth: "AdminAuth",
            tags: ["api", "product"],
            validate: {
                params: Joi.object({
                    productId: Joi.string().required()
                }),
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                },
            },
        },
    },

    //delete product by id
    {
        method: "DELETE",
        path: "/vendor/product/{productId}",
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.deleteProductByIdVendor(request.params, userData)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Delete product by id",
            auth: "VendorAuth",
            tags: ["api", "product"],
            validate: {
                params: Joi.object({
                    productId: Joi.string().required()
                }),
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                },
            },
        },
    },
]