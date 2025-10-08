import { Router, Application } from "express";
import { UserController } from "../controllers/user-controller";

export class UserRoutes {
  public userController: UserController = new UserController();

  public routes(app: Application): void {
    app.route("/api/usuarios").get(this.userController.getAllUsers);
    // app.route("/api/usuario/:id").get(this.userController.getUserById);

  }
}
