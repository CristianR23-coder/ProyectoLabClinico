import { Router } from "express";
import { DoctorController } from "../controllers/doctor-controller";

export class DoctorRoutes {
  public doctorController: DoctorController = new DoctorController();

  public routes(app: Router): void {
    app.route("/doctores").get(this.doctorController.getAllDoctors);
    // app.route("/doctor/:id").get(this.doctorController.getDoctorById);
  }
}
