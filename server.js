const path = require("path");
const dotenv = require("dotenv").config({ path: "./.env" });
const Hapi = require("@hapi/hapi");
const Config = require("./Config");
const Routes = require("./Routes");
const Plugins = require("./Plugins");
const fs = require("fs");
const bootStrap = require('./Utils/bootStrap');


const init = async () => {
  let serverObject = {
    port: process.env.PORT,
    routes: {
      cors: true,
    },
  };
  const server = Hapi.server({ ...serverObject });
  await server.register(Plugins);
  server.route(Routes);

  server.route([
    {
      method: "GET",
      path: "/files/{param*}",
      handler: function (request, h) {
        return h.file("." + request.path);
      },
    },
  ]);

  try {
    await server.start(function () { });
    console.log("Server running at:", server.info.uri);

  } catch (err) {
    console.log(err);
  }

};

process
  .on("unhandledRejection", (reason, p) => {
    console.error(reason, "Unhandled Rejection at Promise", p);
  })
  .on("uncaughtException", err => {
    console.error(err, "Uncaught Exception thrown");
  });

init();

