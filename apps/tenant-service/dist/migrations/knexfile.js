"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    development: {
        client: 'mysql2',
        connection: {
            host: process.env.MAIN_DB_HOST,
            port: Number(process.env.MAIN_DB_PORT),
            user: process.env.MAIN_DB_USER,
            password: process.env.MAIN_DB_PASSWORD,
            database: process.env.MAIN_DB_NAME,
        },
        pool: { min: 2, max: 10 },
        migrations: {
            tableName: 'knex_migrations',
            directory: './src/migrations',
        },
    },
    production: {
        client: 'mysql2',
        connection: {
            host: process.env.MAIN_DB_HOST,
            port: Number(process.env.MAIN_DB_PORT),
            user: process.env.MAIN_DB_USER,
            password: process.env.MAIN_DB_PASSWORD,
            database: process.env.MAIN_DB_NAME,
        },
        pool: { min: 2, max: 10 },
        migrations: {
            tableName: 'knex_migrations',
            directory: './src/migrations',
        },
    },
};
exports.default = config;
