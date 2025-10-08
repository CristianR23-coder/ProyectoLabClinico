import { Router } from "express";
import { ResultController } from "../controllers/result-controller";

export class ResultRoutes {
	public resultController: ResultController = new ResultController();

	public routes(app: Router): void {
			app.route("/api/resultados").get(this.resultController.getAllResults);
			// app.route("/api/resultado/:id").get(this.resultController.getResultById);
	}
}
