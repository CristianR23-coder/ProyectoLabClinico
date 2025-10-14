import { Router } from "express";
import { DoctorController } from "../controllers/doctor-controller";
import { authMiddleware } from "../middleware/auth";

export class DoctorRoutes {
  public doctorController: DoctorController = new DoctorController();

  public routes(app: Router): void {
    app.route("/api/doctor/public").post(this.doctorController.createDoctor.bind(this.doctorController));
    app.route("/api/doctores/public").get(this.doctorController.getAllDoctors.bind(this.doctorController));
    app.route("/api/doctor/:id/public").get(this.doctorController.getDoctorById.bind(this.doctorController));
    app.route("/api/doctor/:id/public").patch(this.doctorController.updateDoctor.bind(this.doctorController));
    app.route("/api/doctor/:id/public").delete(this.doctorController.deleteDoctor.bind(this.doctorController));
    app.route("/api/doctor/:id/logic/public").patch(this.doctorController.deleteDoctorAdv.bind(this.doctorController));

    // Rutas protegidas con middleware de autenticación
    app.route("/api/doctor").post(authMiddleware, this.doctorController.createDoctor.bind(this.doctorController));
    app.route("/api/doctores").get(authMiddleware, this.doctorController.getAllDoctors.bind(this.doctorController));
    app.route("/api/doctor/:id").get(authMiddleware, this.doctorController.getDoctorById.bind(this.doctorController));
    app.route("/api/doctor/:id").patch(authMiddleware, this.doctorController.updateDoctor.bind(this.doctorController));
    app.route("/api/doctor/:id").delete(authMiddleware, this.doctorController.deleteDoctor.bind(this.doctorController));
    app.route("/api/doctor/:id/logic").patch(authMiddleware, this.doctorController.deleteDoctorAdv.bind(this.doctorController));
  }
}
