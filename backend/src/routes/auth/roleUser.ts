import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { RoleUserController } from "../../controllers/auth/roleUser-controller";

export class RoleUserRoutes {
  public roleUserController: RoleUserController = new RoleUserController();

  public routes(app: Router): void {
    app.route("/api/role-users/public").get(this.roleUserController.getAllRoleUsers.bind(this.roleUserController));
    app.route("/api/role-user/:id/public").get(this.roleUserController.getRoleUserById.bind(this.roleUserController));
    app.route("/api/role-user/public").post(this.roleUserController.createRoleUser.bind(this.roleUserController));
    app.route("/api/role-user/:id/public").patch(this.roleUserController.updateRoleUser.bind(this.roleUserController));
    app.route("/api/role-user/:id/public").delete(this.roleUserController.deleteRoleUser.bind(this.roleUserController));
    app.route("/api/role-user/:id/logic/public").patch(this.roleUserController.deleteRoleUserAdv.bind(this.roleUserController));

    app.route("/api/role-users").get(authMiddleware, this.roleUserController.getAllRoleUsers.bind(this.roleUserController));
    app.route("/api/role-user/:id").get(authMiddleware, this.roleUserController.getRoleUserById.bind(this.roleUserController));
    app.route("/api/role-user").post(authMiddleware, this.roleUserController.createRoleUser.bind(this.roleUserController));
    app.route("/api/role-user/:id").patch(authMiddleware, this.roleUserController.updateRoleUser.bind(this.roleUserController));
    app.route("/api/role-user/:id").delete(authMiddleware, this.roleUserController.deleteRoleUser.bind(this.roleUserController));
    app.route("/api/role-user/:id/logic").patch(authMiddleware, this.roleUserController.deleteRoleUserAdv.bind(this.roleUserController));
  }
}
