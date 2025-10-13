import { Router } from "express";
import { RoleController } from "../../controllers/auth/role-controller";

export class RoleRoutes {
  public roleController: RoleController = new RoleController();

  public routes(app: Router): void {
    app.route("/api/roles").get(this.roleController.getAllRoles.bind(this.roleController));
    app.route("/api/roles/:id").get(this.roleController.getRoleById.bind(this.roleController));
    app.route("/api/role").post(this.roleController.createRole.bind(this.roleController));
    app.route("/api/role/:id").put(this.roleController.updateRole.bind(this.roleController));
    app.route("/api/role/:id").delete(this.roleController.deleteRole.bind(this.roleController));
    app.route("/api/role/:id/soft").delete(this.roleController.deleteRoleAdv.bind(this.roleController));
  }
}
