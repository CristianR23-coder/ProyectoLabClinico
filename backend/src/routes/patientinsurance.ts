import { Router } from "express";
import { PatientInsuranceController } from "../controllers/patientinsurance-controller";

export class PatientInsuranceRoutes {
	public patientInsuranceController: PatientInsuranceController = new PatientInsuranceController();

	public routes(app: Router): void {
			app.route("/api/patientinsurances").get(this.patientInsuranceController.getAllPatientInsurances);
			// app.route("/api/patientinsurance/:patientId/:insuranceId").get(this.patientInsuranceController.getPatientInsuranceById);
	}
}
