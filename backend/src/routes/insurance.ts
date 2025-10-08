import { Router } from "express";
import { InsuranceController } from "../controllers/insurance-controller";

export class InsuranceRoutes {
    public insuranceController: InsuranceController = new InsuranceController();

    public routes(app: Router): void {
        app.route("/seguros").get(this.insuranceController.getAllInsurances);
        // app.route("/seguro/:id").get(this.insuranceController.getInsuranceById);
    }
}