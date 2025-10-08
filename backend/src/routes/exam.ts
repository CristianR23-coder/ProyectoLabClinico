import { Router } from "express";
import { ExamController } from "../controllers/exam-controller";

export class ExamRoutes {
    public examController: ExamController = new ExamController();
    public routes(app: Router): void {
        app.route("/api/examenes").get(this.examController.getAllExams);
        // app.route("/api/examen/:id").get(this.examController.getExamById);
    }
}