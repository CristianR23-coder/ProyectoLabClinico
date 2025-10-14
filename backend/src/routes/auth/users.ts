import { Router } from "express";
import { UserController } from "../../controllers/auth/user-controller";
import { authMiddleware } from "../../middleware/auth";

export class AuthUserRoutes {
  public userController: UserController = new UserController();

  public routes(app: Router): void {
    app.route("/api/auth/users/public").get(this.userController.getAllUsers.bind(this.userController));
    app.route("/api/auth/users/public").post(this.userController.createUser.bind(this.userController));
    app.route("/api/auth/users/:id/public").get(this.userController.getUserById.bind(this.userController));
    app.route("/api/auth/users/:id/public").patch(this.userController.updateUser.bind(this.userController));
    app.route("/api/auth/users/:id/public").delete(this.userController.deleteUser.bind(this.userController));
    app.route("/api/auth/users/:id/logic/public").patch(this.userController.deleteUserAdv.bind(this.userController));
    
    app.route("/api/auth/users").get(authMiddleware, this.userController.getAllUsers.bind(this.userController));
    app.route("/api/auth/users").post(authMiddleware, this.userController.createUser.bind(this.userController));
    app.route("/api/auth/users/:id").patch(authMiddleware, this.userController.updateUser.bind(this.userController));
    app.route("/api/auth/users/:id").get(authMiddleware, this.userController.getUserById.bind(this.userController));
    app.route("/api/auth/users/:id").delete(authMiddleware, this.userController.deleteUser.bind(this.userController));
    app.route("/api/auth/users/:id/logic").patch(authMiddleware, this.userController.deleteUserAdv.bind(this.userController));
  }
}