import { Router } from "express";
import { PatientController } from "../controllers/patient-controller";

export class PatientRoutes {
	public patientController: PatientController = new PatientController();

	public routes(app: Router): void {
		app.route("/pacientes").get(this.patientController.getAllPatients);
		// app.route("/paciente/:id").get(this.patientController.getPatientById);
	}
}
