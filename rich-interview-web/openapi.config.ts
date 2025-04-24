const { generateService } = require("@umijs/openapi");

generateService({
    requestLibPath: "import request from '@/libs/request'",
    schemaPath: "http://49.233.207.238/api/v2/api-docs",
    serversPath: "./src/api/apiTest/",
});