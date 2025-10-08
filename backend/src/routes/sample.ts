import { Router } from "express";
import { SampleController } from "../controllers/sample-controller";

export class SampleRoutes {
	public sampleController: SampleController = new SampleController();

	public routes(app: Router): void {
			app.route("/api/muestras").get(this.sampleController.getAllSamples);
			// app.route("/api/muestra/:id").get(this.sampleController.getSampleById);
	}
}
