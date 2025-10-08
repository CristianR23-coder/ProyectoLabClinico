import { Router } from "express";
import { PanelItemController } from "../controllers/panelitem-controller";

export class PanelItemRoutes {
	public panelItemController: PanelItemController = new PanelItemController();

	public routes(app: Router): void {
			app.route("/api/panelitems").get(this.panelItemController.getAllPanelItems);
			// app.route("/api/panelitem/:id").get(this.panelItemController.getPanelItemById);
	}
}
