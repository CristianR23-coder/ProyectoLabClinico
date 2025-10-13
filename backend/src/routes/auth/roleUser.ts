import { Router } from "express";
import { RoleUserController } from "../../controllers/auth/roleUser-controller";

export class RoleUserRoutes {
  public roleUserController: RoleUserController = new RoleUserController();

  public routes(app: Router): void {
    app.route("/api/role-users").get(this.roleUserController.getAllRoleUsers.bind(this.roleUserController));
    app.route("/api/role-users/:id").get(this.roleUserController.getRoleUserById.bind(this.roleUserController));
    app.route("/api/role-user").post(this.roleUserController.createRoleUser.bind(this.roleUserController));
    app.route("/api/role-user/:id").put(this.roleUserController.updateRoleUser.bind(this.roleUserController));
    app.route("/api/role-user/:id").delete(this.roleUserController.deleteRoleUser.bind(this.roleUserController));
    app.route("/api/role-user/:id/soft").delete(this.roleUserController.deleteRoleUserAdv.bind(this.roleUserController));
  }
}
