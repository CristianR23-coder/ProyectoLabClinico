import { Router } from "express";
import { PatientInsuranceController } from "../controllers/patientinsurance-controller";
import { authMiddleware } from "../middleware/auth";

export class PatientInsuranceRoutes {
	public patientInsuranceController: PatientInsuranceController = new PatientInsuranceController();

	public routes(app: Router): void {
		app.route("/api/patientinsurances/public").get(this.patientInsuranceController.getAllPatientInsurances.bind(this.patientInsuranceController));
		app.route("/api/patientinsurance/:patientId/:insuranceId/public").get(this.patientInsuranceController.getPatientInsuranceById.bind(this.patientInsuranceController));
		app.route("/api/patientinsurance/public").post(this.patientInsuranceController.createPatientInsurance.bind(this.patientInsuranceController));
		app.route("/api/patientinsurance/:patientId/:insuranceId/public").patch(this.patientInsuranceController.updatePatientInsurance.bind(this.patientInsuranceController));
		app.route("/api/patientinsurance/:patientId/:insuranceId/public").delete(this.patientInsuranceController.deletePatientInsurance.bind(this.patientInsuranceController));
		app.route("/api/patientinsurance/:patientId/:insuranceId/logic/public").patch(this.patientInsuranceController.deletePatientInsuranceAdv.bind(this.patientInsuranceController));
	
		//rutas protegidas
		app.route("/api/patientinsurances").get(authMiddleware, this.patientInsuranceController.getAllPatientInsurances.bind(this.patientInsuranceController));
		app.route("/api/patientinsurance/:patientId/:insuranceId").get(authMiddleware, this.patientInsuranceController.getPatientInsuranceById.bind(this.patientInsuranceController));
		app.route("/api/patientinsurance").post(authMiddleware, this.patientInsuranceController.createPatientInsurance.bind(this.patientInsuranceController));
		app.route("/api/patientinsurance/:patientId/:insuranceId").patch(authMiddleware, this.patientInsuranceController.updatePatientInsurance.bind(this.patientInsuranceController));
		app.route("/api/patientinsurance/:patientId/:insuranceId").delete(authMiddleware, this.patientInsuranceController.deletePatientInsurance.bind(this.patientInsuranceController));
		app.route("/api/patientinsurance/:patientId/:insuranceId/logic").patch(authMiddleware, this.patientInsuranceController.deletePatientInsuranceAdv.bind(this.patientInsuranceController));
	}
}