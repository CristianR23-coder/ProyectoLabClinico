import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { ResourceController } from "../../controllers/auth/resource-controller";

export class ResourceRoutes {
  public resourceController: ResourceController = new ResourceController();

  public routes(app: Router): void {
    app.route("/api/resources/public").get(this.resourceController.getAllResources.bind(this.resourceController));
    app.route("/api/resource/:id/public").get(this.resourceController.getResourceById.bind(this.resourceController));
    app.route("/api/resource/public").post(this.resourceController.createResource.bind(this.resourceController));
    app.route("/api/resource/:id/public").patch(this.resourceController.updateResource.bind(this.resourceController));
    app.route("/api/resource/:id/public").delete(this.resourceController.deleteResource.bind(this.resourceController));
    app.route("/api/resource/:id/logic/public").patch(this.resourceController.deleteResourceAdv.bind(this.resourceController));

    app.route("/api/resources").get(authMiddleware, this.resourceController.getAllResources.bind(this.resourceController));
    app.route("/api/resource/:id").get(authMiddleware, this.resourceController.getResourceById.bind(this.resourceController));
    app.route("/api/resource").post(authMiddleware, this.resourceController.createResource.bind(this.resourceController));
    app.route("/api/resource/:id").patch(authMiddleware, this.resourceController.updateResource.bind(this.resourceController));
    app.route("/api/resource/:id").delete(authMiddleware, this.resourceController.deleteResource.bind(this.resourceController));
    app.route("/api/resource/:id/logic").patch(authMiddleware, this.resourceController.deleteResourceAdv.bind(this.resourceController));
  }
}
