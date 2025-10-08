import { Router } from "express";
import { PanelController } from "../controllers/panel-controller";

export class PanelRoutes {
	public panelController: PanelController = new PanelController();

	public routes(app: Router): void {
		app.route("/paneles").get(this.panelController.getAllPanels);
		// app.route("/panel/:id").get(this.panelController.getPanelById);
	}
}
