// const pg = require("pg");

// const pool = new pg.Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "filesharing",
//   password: "sajak",
//   port: 5432,
// });

// module.exports = pool;

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = prisma;
