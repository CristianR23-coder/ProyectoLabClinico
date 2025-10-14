import { Router } from "express";
import { ParameterController } from "../controllers/parameter-controller";
import { authMiddleware } from "../middleware/auth";

export class ParameterRoutes {
	public parameterController: ParameterController = new ParameterController();

	public routes(app: Router): void {
		app.route("/api/parametros/public").get(this.parameterController.getAllParameters.bind(this.parameterController));
		app.route("/api/parametro/:id/public").get(this.parameterController.getParameterById.bind(this.parameterController));
		app.route("/api/parametro/public").post(this.parameterController.createParameter.bind(this.parameterController));
		app.route("/api/parametro/:id/public").patch(this.parameterController.updateParameter.bind(this.parameterController));
		app.route("/api/parametro/:id/public").delete(this.parameterController.deleteParameter.bind(this.parameterController));
		app.route("/api/parametro/:id/logic/public").patch(this.parameterController.deleteParameterAdv.bind(this.parameterController));

		// Protected routes
		app.route("/api/parametros").get(authMiddleware, this.parameterController.getAllParameters.bind(this.parameterController));
		app.route("/api/parametro/:id").get(authMiddleware, this.parameterController.getParameterById.bind(this.parameterController));
		app.route("/api/parametro").post(authMiddleware, this.parameterController.createParameter.bind(this.parameterController));
		app.route("/api/parametro/:id").patch(authMiddleware, this.parameterController.updateParameter.bind(this.parameterController));
		app.route("/api/parametro/:id").delete(authMiddleware, this.parameterController.deleteParameter.bind(this.parameterController));
		app.route("/api/parametro/:id/logic").patch(authMiddleware, this.parameterController.deleteParameterAdv.bind(this.parameterController));
	}
}
