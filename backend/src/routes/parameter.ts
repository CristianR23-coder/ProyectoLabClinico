import { Router } from "express";
import { ParameterController } from "../controllers/parameter-controller";

export class ParameterRoutes {
	public parameterController: ParameterController = new ParameterController();

	public routes(app: Router): void {
		app.route("/parametros").get(this.parameterController.getAllParameters);
		// app.route("/parametro/:id").get(this.parameterController.getParameterById);
	}
}
