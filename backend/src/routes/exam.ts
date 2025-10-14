import { Router } from "express";
import { ExamController } from "../controllers/exam-controller";
import { authMiddleware } from "../middleware/auth";

export class ExamRoutes {
    public examController: ExamController = new ExamController();
    public routes(app: Router): void {
        app.route("/api/examenes/public").get(this.examController.getAllExams.bind(this.examController));
        app.route("/api/examen/:id/public").get(this.examController.getExamById.bind(this.examController));
        app.route("/api/examen/public").post(this.examController.createExam.bind(this.examController));
        app.route("/api/examen/:id/public").patch(this.examController.updateExam.bind(this.examController));
        app.route("/api/examen/:id/public").delete(this.examController.deleteExam.bind(this.examController));
        app.route("/api/examen/:id/logic/public").patch(this.examController.deleteExamAdv.bind(this.examController));

        // Rutas protegidas con middleware de autenticación
        app.route("/api/examenes").get(authMiddleware, this.examController.getAllExams.bind(this.examController));
        app.route("/api/examen/:id").get(authMiddleware, this.examController.getExamById.bind(this.examController));
        app.route("/api/examen").post(authMiddleware, this.examController.createExam.bind(this.examController));
        app.route("/api/examen/:id").patch(authMiddleware, this.examController.updateExam.bind(this.examController));
        app.route("/api/examen/:id").delete(authMiddleware, this.examController.deleteExam.bind(this.examController));
        app.route("/api/examen/:id/logic").patch(authMiddleware, this.examController.deleteExamAdv.bind(this.examController));
    }
}
