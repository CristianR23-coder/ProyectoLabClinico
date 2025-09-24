// src/database/db.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Configuración para cada motor
const dbConfig = {
  mysql: {
    dialect: 'mysql',
    host: process.env.MYSQL_DB_HOST || 'localhost',
    username: process.env.MYSQL_DB_USER || 'root',
    password: process.env.MYSQL_DB_PASSWORD || '',
    database: process.env.MYSQL_DB_NAME || 'labclinico',
    port: parseInt(process.env.MYSQL_DB_PORT || '3306'),
  },
  postgres: {
    dialect: 'postgres',
    host: process.env.POSTGRES_DB_HOST || 'localhost',
    username: process.env.POSTGRES_DB_USER || 'postgres',
    password: process.env.POSTGRES_DB_PASSWORD || '',
    database: process.env.POSTGRES_DB_NAME || 'labclinico',
    port: parseInt(process.env.POSTGRES_DB_PORT || '5432'),
  },
  mssql: {
    dialect: 'mssql',
    host: process.env.MSSQL_DB_HOST || 'localhost',
    username: process.env.MSSQL_DB_USER || 'sa',
    password: process.env.MSSQL_DB_PASSWORD || '',
    database: process.env.MSSQL_DB_NAME || 'labclinico',
    port: parseInt(process.env.MSSQL_DB_PORT || '1433'),
  },
  oracle: {
    dialect: 'oracle',
    host: process.env.ORACLE_DB_HOST || 'localhost',
    username: process.env.ORACLE_DB_USER || 'oracle',
    password: process.env.ORACLE_DB_PASSWORD || '',
    database: process.env.ORACLE_DB_NAME || 'labclinico',
    port: parseInt(process.env.ORACLE_DB_PORT || '1521'),
  },
};

// Motor seleccionado
const dbEngine = process.env.DB_ENGINE || 'mysql';
const config = dbConfig[dbEngine as keyof typeof dbConfig];

if (!config) {
  throw new Error(`❌ Motor de base de datos no soportado: ${dbEngine}`);
}

// Instancia de Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect as any,
    logging: false,
  }
);

// Probar conexión
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Conexión establecida con ${dbEngine} en ${config.host}:${config.port}`);
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
  }
};

export default sequelize;
