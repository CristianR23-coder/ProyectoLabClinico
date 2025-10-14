import { Router } from "express";
import { PanelItemController } from "../controllers/panelitem-controller";
import { authMiddleware } from "../middleware/auth";

export class PanelItemRoutes {
	public panelItemController: PanelItemController = new PanelItemController();

	public routes(app: Router): void {
		app.route("/api/panelitems/public").get(this.panelItemController.getAllPanelItems.bind(this.panelItemController));
		app.route("/api/panelitem/:id/public").get(this.panelItemController.getPanelItemById.bind(this.panelItemController));
		app.route("/api/panelitem/public").post(this.panelItemController.createPanelItem.bind(this.panelItemController));
		app.route("/api/panelitem/:id/public").patch(this.panelItemController.updatePanelItem.bind(this.panelItemController));
		app.route("/api/panelitem/:id/public").delete(this.panelItemController.deletePanelItem.bind(this.panelItemController));
		app.route("/api/panelitem/:id/logic/public").patch(this.panelItemController.deletePanelItemAdv.bind(this.panelItemController));

		// Protected routes
		app.route("/api/panelitems").get(authMiddleware, this.panelItemController.getAllPanelItems.bind(this.panelItemController));
		app.route("/api/panelitem/:id").get(authMiddleware, this.panelItemController.getPanelItemById.bind(this.panelItemController));
		app.route("/api/panelitem").post(authMiddleware, this.panelItemController.createPanelItem.bind(this.panelItemController));
		app.route("/api/panelitem/:id").patch(authMiddleware, this.panelItemController.updatePanelItem.bind(this.panelItemController));
		app.route("/api/panelitem/:id").delete(authMiddleware, this.panelItemController.deletePanelItem.bind(this.panelItemController));
		app.route("/api/panelitem/:id/logic").patch(authMiddleware, this.panelItemController.deletePanelItemAdv.bind(this.panelItemController));
	}
}
