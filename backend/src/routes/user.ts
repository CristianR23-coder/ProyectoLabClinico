import { Router, Application } from "express";
import { UserController } from "../controllers/user-controller";

export class UserRoutes {
  public userController: UserController = new UserController();

  public routes(app: Application): void {
    app.route("/usuarios").get(this.userController.getAllUsers);
    // app.route("/usuario/:id").get(this.userController.getUserById);

  }
}
