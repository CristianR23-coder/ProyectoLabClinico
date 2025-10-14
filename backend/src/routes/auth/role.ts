import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { RoleController } from "../../controllers/auth/role-controller";

export class RoleRoutes {
  public roleController: RoleController = new RoleController();

  public routes(app: Router): void {
    app.route("/api/roles/public").get(this.roleController.getAllRoles.bind(this.roleController));
    app.route("/api/role/:id/public").get(this.roleController.getRoleById.bind(this.roleController));
    app.route("/api/role/public").post(this.roleController.createRole.bind(this.roleController));
    app.route("/api/role/:id/public").patch(this.roleController.updateRole.bind(this.roleController));
    app.route("/api/role/:id/public").delete(this.roleController.deleteRole.bind(this.roleController));
    app.route("/api/role/:id/logic/public").patch(this.roleController.deleteRoleAdv.bind(this.roleController));

    app.route("/api/roles").get(authMiddleware, this.roleController.getAllRoles.bind(this.roleController));
    app.route("/api/role/:id").get(authMiddleware, this.roleController.getRoleById.bind(this.roleController));
    app.route("/api/role").post(authMiddleware, this.roleController.createRole.bind(this.roleController));
    app.route("/api/role/:id").patch(authMiddleware, this.roleController.updateRole.bind(this.roleController));
    app.route("/api/role/:id").delete(authMiddleware, this.roleController.deleteRole.bind(this.roleController));
    app.route("/api/role/:id/logic").patch(authMiddleware, this.roleController.deleteRoleAdv.bind(this.roleController));
  }
}
