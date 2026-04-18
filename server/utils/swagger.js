const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const createSwaggerSpec = (port) =>
  swaggerJsdoc({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "File Sharing Application API",
        version: "1.0.0",
        description:
          "REST API for the file sharing application. Supports user registration, authentication, and real-time file sharing via rooms. WebSocket events (createRoom, join, message) are documented below but are not callable from Swagger UI.",
      },
      servers: [{ url: `http://localhost:${port}`, description: "Local server" }],
      tags: [
        { name: "Auth", description: "User registration and login" },
        { name: "Files", description: "File upload and download" },
        {
          name: "WebSocket",
          description:
            `Real-time events over ws://localhost:${port} (not callable from Swagger UI)`,
        },
      ],
    },
    apis: [path.join(__dirname, "..", "docs", "swaggerDocs.js")],
  });

const setupSwagger = (app, port) => {
  const swaggerSpec = createSwaggerSpec(port);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
