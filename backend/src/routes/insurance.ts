import { Router } from "express";
import { InsuranceController } from "../controllers/insurance-controller";
import { authMiddleware } from "../middleware/auth";

export class InsuranceRoutes {
    public insuranceController: InsuranceController = new InsuranceController();

    public routes(app: Router): void {
        app.route("/api/seguros/public").get(this.insuranceController.getAllInsurances.bind(this.insuranceController));
        app.route("/api/seguro/:id/public").get(this.insuranceController.getInsuranceById.bind(this.insuranceController));
        app.route("/api/seguro/public").post(this.insuranceController.createInsurance.bind(this.insuranceController));
        app.route("/api/seguro/:id/public").patch(this.insuranceController.updateInsurance.bind(this.insuranceController));
        app.route("/api/seguro/:id/public").delete(this.insuranceController.deleteInsurance.bind(this.insuranceController));
        app.route("/api/seguro/:id/logic/public").patch(this.insuranceController.deleteInsuranceAdv.bind(this.insuranceController));

        // Rutas protegidas con middleware de autenticación
        app.route("/api/seguros").get(authMiddleware, this.insuranceController.getAllInsurances.bind(this.insuranceController));
        app.route("/api/seguro/:id").get(authMiddleware, this.insuranceController.getInsuranceById.bind(this.insuranceController));
        app.route("/api/seguro").post(authMiddleware, this.insuranceController.createInsurance.bind(this.insuranceController));
        app.route("/api/seguro/:id").patch(authMiddleware, this.insuranceController.updateInsurance.bind(this.insuranceController));
        app.route("/api/seguro/:id").delete(authMiddleware, this.insuranceController.deleteInsurance.bind(this.insuranceController));
        app.route("/api/seguro/:id/logic").patch(authMiddleware, this.insuranceController.deleteInsuranceAdv.bind(this.insuranceController));
    }
}
