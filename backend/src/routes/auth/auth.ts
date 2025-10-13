import { Router } from "express";
import { AuthController } from "../../controllers/auth/auth-controller";

export class AuthRoutes {
  public authController: AuthController = new AuthController();

  public routes(app: Router): void {
    app.route("/api/auth/register").post(this.authController.register.bind(this.authController));
    app.route("/api/auth/login").post(this.authController.login.bind(this.authController));
    app.route("/api/auth/logout").post(this.authController.logout.bind(this.authController));
  }
}
