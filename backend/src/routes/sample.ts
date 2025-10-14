import { Router } from "express";
import { SampleController } from "../controllers/sample-controller";
import { authMiddleware } from "../middleware/auth";

export class SampleRoutes {
	public sampleController: SampleController = new SampleController();

	public routes(app: Router): void {
		app.route("/api/muestras/public").get(this.sampleController.getAllSamples.bind(this.sampleController));
		app.route("/api/muestra/:id/public").get(this.sampleController.getSampleById.bind(this.sampleController));
		app.route("/api/muestra/public").post(this.sampleController.createSample.bind(this.sampleController));
		app.route("/api/muestra/:id/public").patch(this.sampleController.updateSample.bind(this.sampleController));
		app.route("/api/muestra/:id/public").delete(this.sampleController.deleteSample.bind(this.sampleController));
		app.route("/api/muestra/:id/logic/public").patch(this.sampleController.deleteSampleAdv.bind(this.sampleController));

		//rutas protegidas
		app.route("/api/muestras").get(authMiddleware, this.sampleController.getAllSamples.bind(this.sampleController));
		app.route("/api/muestra/:id").get(authMiddleware, this.sampleController.getSampleById.bind(this.sampleController));
		app.route("/api/muestra").post(authMiddleware, this.sampleController.createSample.bind(this.sampleController));
		app.route("/api/muestra/:id").patch(authMiddleware, this.sampleController.updateSample.bind(this.sampleController));
		app.route("/api/muestra/:id").delete(authMiddleware, this.sampleController.deleteSample.bind(this.sampleController));
		app.route("/api/muestra/:id/logic").patch(authMiddleware, this.sampleController.deleteSampleAdv.bind(this.sampleController));
	}
}
