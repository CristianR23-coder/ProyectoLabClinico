import { Router } from "express";
import { PatientController } from "../controllers/patient-controller";
import { authMiddleware } from "../middleware/auth";

export class PatientRoutes {
	public patientController: PatientController = new PatientController();

	public routes(app: Router): void {
		app.route("/api/pacientes/public").get(this.patientController.getAllPatients.bind(this.patientController));
		app.route("/api/paciente/:id/public").get(this.patientController.getPatientById.bind(this.patientController));
		app.route("/api/paciente/public").post(this.patientController.createPatient.bind(this.patientController));
		app.route("/api/paciente/:id/public").patch(this.patientController.updatePatient.bind(this.patientController));
		app.route("/api/paciente/:id/public").delete(this.patientController.deletePatient.bind(this.patientController));
		app.route("/api/paciente/:id/logic/public").patch(this.patientController.deletePatientAdv.bind(this.patientController));

		//rutas protegidas
		app.route("/api/pacientes").get(authMiddleware, this.patientController.getAllPatients.bind(this.patientController));
		app.route("/api/paciente/:id").get(authMiddleware, this.patientController.getPatientById.bind(this.patientController));
		app.route("/api/paciente").post(authMiddleware, this.patientController.createPatient.bind(this.patientController));
		app.route("/api/paciente/:id").patch(authMiddleware, this.patientController.updatePatient.bind(this.patientController));
		app.route("/api/paciente/:id").delete(authMiddleware, this.patientController.deletePatient.bind(this.patientController));
		app.route("/api/paciente/:id/logic").patch(authMiddleware, this.patientController.deletePatientAdv.bind(this.patientController));
	}
}
