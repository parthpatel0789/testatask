
const HapiSwagger = require('hapi-swagger');
const Pack = require('../package');
const Config = require('../Config');

exports.plugin = {
    name: 'swagger-plugin',
    register: async (server, option) => {
        const swaggerOptions = {
            info: {
                title: Config.dbConfig.config.swaggerName + ' Documentation',
                version: Pack.version,
                // enableDocumentation: process.env.NODE_ENV == "prod" ? false : true
            },
        };
        await server.register([
            require('@hapi/inert'),
            require('@hapi/vision')]);
        if (!(process.env.NODE_ENV == "prod"))
            await server.register([
                {
                    plugin: HapiSwagger,
                    options: swaggerOptions
                }
            ]);
    }
};
