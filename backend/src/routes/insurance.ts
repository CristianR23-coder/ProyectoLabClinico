import { Router } from "express";
import { InsuranceController } from "../controllers/insurance-controller";

export class InsuranceRoutes {
    public insuranceController: InsuranceController = new InsuranceController();

    public routes(app: Router): void {
        app.route("/api/seguros").get(this.insuranceController.getAllInsurances);
        // app.route("/api/seguro/:id").get(this.insuranceController.getInsuranceById);
    }
}