import 'dotenv/config';
import express, { Application } from 'express';
import morgan from 'morgan';

// importa tu conexión Sequelize
import sequelize, { testConnection } from '../database/db';

export class App {
  public app: Application;

  constructor(private port?: number | string) {
    this.app = express();
    this.settings();
    this.middlewares();
    // intenta conectar a la BD al construir la app
    this.dbConnection();
    // this.routes(); // (opcional) acá montarías tus rutas
  }

  // Configuración de la app
  private settings(): void {
    this.app.set('port', this.port || process.env.PORT || 4000);
  }

  // Middlewares
  private middlewares(): void {
    this.app.use(morgan('dev'));
    this.app.use(express.json());                        // JSON raw
    this.app.use(express.urlencoded({ extended: false })); // x-www-form-urlencoded
  }

  // Conexión a la base de datos
  private async dbConnection(): Promise<void> {
    try {
      // prueba la conexión
      await testConnection();

      // (opcional) sincroniza modelos si quieres crear tablas automáticamente
      // await sequelize.sync({ alter: false });
      // console.log('🗃️  Modelos sincronizados');

    } catch (err) {
      console.error('❌ No se pudo conectar a la base de datos:', err);
      // si quieres, puedes hacer process.exit(1) para no levantar el server sin BD
      // process.exit(1);
    }
  }

  // Levantar servidor (no async; usa callback)
  public listen(): void {
    const port = this.app.get('port');
    this.app.listen(port, () => {
      console.log(`🚀 Server on http://localhost:${port}`);
    });
  }
}
