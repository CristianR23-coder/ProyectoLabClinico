import { Router } from "express";
import { ResourceRoleController } from "../../controllers/auth/resourceRole-controller";

export class ResourceRoleRoutes {
  public resourceRoleController: ResourceRoleController = new ResourceRoleController();

  public routes(app: Router): void {
    app.route("/api/resource-roles").get(this.resourceRoleController.getAllResourceRoles.bind(this.resourceRoleController));
    app.route("/api/resource-roles/:id").get(this.resourceRoleController.getResourceRoleById.bind(this.resourceRoleController));
    app.route("/api/resource-role").post(this.resourceRoleController.createResourceRole.bind(this.resourceRoleController));
    app.route("/api/resource-role/:id").put(this.resourceRoleController.updateResourceRole.bind(this.resourceRoleController));
    app.route("/api/resource-role/:id").delete(this.resourceRoleController.deleteResourceRole.bind(this.resourceRoleController));
    app.route("/api/resource-role/:id/soft").delete(this.resourceRoleController.deleteResourceRoleAdv.bind(this.resourceRoleController));
  }
}
