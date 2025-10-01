import dotenv from 'dotenv';
import express, { Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { Routes } from '../routes/index';

// Importa sequelize como *named export* para mantener la base del anterior
import sequelize from '../database/db';

// Carga variables de entorno al estilo del código base anterior
dotenv.config();

export class App {
  public app: Application;
  public routePrv: Routes = new Routes();

  constructor(private port?: number | string) {
    this.app = express();
    this.validateEnv();   // Puedes mantener esta validación adicional
    this.settings();
    this.middlewares();
    this.routes();        // Igual que en el código base: rutas antes de DB
    this.dbConnection();  // Igual que el anterior: se llama en el constructor
    this.handleErrors();  // Mantengo tus capturas globales
  }

  private validateEnv(): void {
    const required = ['DB_ENGINE', 'PORT'];
    required.forEach((key) => {
      if (!process.env[key]) {
        throw new Error(`⚠️ Missing required env var: ${key}`);
      }
    });
  }

  // Configuración básica (misma idea del anterior)
  private settings(): void {
    this.app.set('port', this.port || process.env.PORT || 4000);
  }

  // Middlewares (el base tenía morgan/json/urlencoded; aquí conservamos cors que ya usabas)
  private middlewares(): void {
    this.app.use(morgan('dev'));
    this.app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  // Rutas (siguiendo el patrón del anterior con this.routePrv.clientRoutes.routes(this.app))
  private routes(): void {
    // Root opcional:
    this.app.get('/', (_req, res) => res.json({ message: 'API running 🚀' }));
    this.routePrv.userRoutes.routes(this.app);

    // Monta las rutas como en el código “anterior”

  }

  // Conexión y sincronización de la base de datos (mismo patrón del anterior)
  private async dbConnection(): Promise<void> {
    try {
      // Para seguir la base del anterior, uso force: true (¡ojo: destruye tablas!)
      await sequelize.sync({ force: true });
      console.log('Database connected successfully');
    } catch (err) {
      console.error('Unable to connect to the database:', err);
    }
  }

  // Manejo global de errores (esto es extra de tu versión, lo conservo)
  private handleErrors(): void {
    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught Exception:', err);
    });
    process.on('unhandledRejection', (reason) => {
      console.error('❌ Unhandled Rejection:', reason);
    });
  }

  // Escuchar (siguiendo el estilo del anterior con async/await)
  public async listen(): Promise<void> {
    const port = this.app.get('port');
    await this.app.listen(port);
    console.log('Server on port', port);
  }
}
