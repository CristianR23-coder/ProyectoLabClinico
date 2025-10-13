import { Router } from "express";
import { ResourceController } from "../../controllers/auth/resource-controller";

export class ResourceRoutes {
  public resourceController: ResourceController = new ResourceController();

  public routes(app: Router): void {
    app.route("/api/resources").get(this.resourceController.getAllResources.bind(this.resourceController));
    app.route("/api/resources/:id").get(this.resourceController.getResourceById.bind(this.resourceController));
    app.route("/api/resource").post(this.resourceController.createResource.bind(this.resourceController));
    app.route("/api/resource/:id").put(this.resourceController.updateResource.bind(this.resourceController));
    app.route("/api/resource/:id").delete(this.resourceController.deleteResource.bind(this.resourceController));
    app.route("/api/resource/:id/soft").delete(this.resourceController.deleteResourceAdv.bind(this.resourceController));
  }
}
