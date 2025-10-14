import { Router } from "express";
import { ResultController } from "../controllers/result-controller";
import { authMiddleware } from "../middleware/auth";

export class ResultRoutes {
	public resultController: ResultController = new ResultController();

	public routes(app: Router): void {
		app.route("/api/resultados/public").get(this.resultController.getAllResults.bind(this.resultController));
		app.route("/api/resultado/:id/public").get(this.resultController.getResultById.bind(this.resultController));
		app.route("/api/resultado/public").post(this.resultController.createResult.bind(this.resultController));
		app.route("/api/resultado/:id/public").patch(this.resultController.updateResult.bind(this.resultController));
		app.route("/api/resultado/:id/public").delete(this.resultController.deleteResult.bind(this.resultController));
		app.route("/api/resultado/:id/logic/public").patch(this.resultController.deleteResultAdv.bind(this.resultController));

		//rutas protegidas
		app.route("/api/resultados").get(authMiddleware, this.resultController.getAllResults.bind(this.resultController));
		app.route("/api/resultado/:id").get(authMiddleware, this.resultController.getResultById.bind(this.resultController));
		app.route("/api/resultado").post(authMiddleware, this.resultController.createResult.bind(this.resultController));
		app.route("/api/resultado/:id").patch(authMiddleware, this.resultController.updateResult.bind(this.resultController));
		app.route("/api/resultado/:id").delete(authMiddleware, this.resultController.deleteResult.bind(this.resultController));
		app.route("/api/resultado/:id/logic").patch(authMiddleware, this.resultController.deleteResultAdv.bind(this.resultController));
	}
}
