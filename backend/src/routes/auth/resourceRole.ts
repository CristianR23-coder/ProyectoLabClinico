import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { ResourceRoleController } from "../../controllers/auth/resourceRole-controller";

export class ResourceRoleRoutes {
  public resourceRoleController: ResourceRoleController = new ResourceRoleController();

  public routes(app: Router): void {
    app.route("/api/resource-roles/public").get(this.resourceRoleController.getAllResourceRoles.bind(this.resourceRoleController));
    app.route("/api/resource-role/:id/public").get(this.resourceRoleController.getResourceRoleById.bind(this.resourceRoleController));
    app.route("/api/resource-role/public").post(this.resourceRoleController.createResourceRole.bind(this.resourceRoleController));
    app.route("/api/resource-role/:id/public").patch(this.resourceRoleController.updateResourceRole.bind(this.resourceRoleController));
    app.route("/api/resource-role/:id/public").delete(this.resourceRoleController.deleteResourceRole.bind(this.resourceRoleController));
    app.route("/api/resource-role/:id/logic/public").patch(this.resourceRoleController.deleteResourceRoleAdv.bind(this.resourceRoleController));

    app.route("/api/resource-roles").get(authMiddleware, this.resourceRoleController.getAllResourceRoles.bind(this.resourceRoleController));
    app.route("/api/resource-role/:id").get(authMiddleware, this.resourceRoleController.getResourceRoleById.bind(this.resourceRoleController));
    app.route("/api/resource-role").post(authMiddleware, this.resourceRoleController.createResourceRole.bind(this.resourceRoleController));
    app.route("/api/resource-role/:id").patch(authMiddleware, this.resourceRoleController.updateResourceRole.bind(this.resourceRoleController));
    app.route("/api/resource-role/:id").delete(authMiddleware, this.resourceRoleController.deleteResourceRole.bind(this.resourceRoleController));
    app.route("/api/resource-role/:id/logic").patch(authMiddleware, this.resourceRoleController.deleteResourceRoleAdv.bind(this.resourceRoleController));
  }
}
