const userRoutes = require("./userRoutes");
const adminRoutes = require("./adminRoutes");
const categoryRoutes = require("./categoryRoutes");
const productRoutes = require("./productRoutes");
const all = [].concat(userRoutes, adminRoutes, categoryRoutes,
    productRoutes);

module.exports = all;