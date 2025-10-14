import { Router } from "express";
import { PanelController } from "../controllers/panel-controller";
import { authMiddleware } from "../middleware/auth";

export class PanelRoutes {
	public panelController: PanelController = new PanelController();

	public routes(app: Router): void {
		app.route("/api/paneles/public").get(this.panelController.getAllPanels.bind(this.panelController));
		app.route("/api/panel/:id/public").get(this.panelController.getPanelById.bind(this.panelController));
		app.route("/api/panel/public").post(this.panelController.createPanel.bind(this.panelController));
		app.route("/api/panel/:id/public").patch(this.panelController.updatePanel.bind(this.panelController));
		app.route("/api/panel/:id/public").delete(this.panelController.deletePanel.bind(this.panelController));
		app.route("/api/panel/:id/logic/public").patch(this.panelController.deletePanelAdv.bind(this.panelController));

		// Rutas protegidas
		app.route("/api/paneles").get(authMiddleware, this.panelController.getAllPanels.bind(this.panelController));
		app.route("/api/panel/:id").get(authMiddleware, this.panelController.getPanelById.bind(this.panelController));
		app.route("/api/panel").post(authMiddleware, this.panelController.createPanel.bind(this.panelController));
		app.route("/api/panel/:id").patch(authMiddleware, this.panelController.updatePanel.bind(this.panelController));
		app.route("/api/panel/:id").delete(authMiddleware, this.panelController.deletePanel.bind(this.panelController));
		app.route("/api/panel/:id/logic").patch(authMiddleware, this.panelController.deletePanelAdv.bind(this.panelController));
	}
}
