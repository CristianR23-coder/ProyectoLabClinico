import { Router } from "express";
import { UserController } from "../../controllers/auth/user-controller";

export class AuthUserRoutes {
  public userController: UserController = new UserController();

  public routes(app: Router): void {
    app.route("/api/auth/users").get(this.userController.getAllUsers.bind(this.userController));
    app.route("/api/auth/users").post(this.userController.createUser.bind(this.userController));
    app.route("/api/auth/users/:id").get(this.userController.getUserById.bind(this.userController));
    app.route("/api/auth/users/:id").delete(this.userController.deleteUser.bind(this.userController));
  }
}
