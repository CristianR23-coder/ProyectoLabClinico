import { Router } from "express";
import { ExamController } from "../controllers/exam-controller";

export class ExamRoutes {
    public examController: ExamController = new ExamController();
    public routes(app: Router): void {
        app.route("/examenes").get(this.examController.getAllExams);
        // app.route("/examen/:id").get(this.examController.getExamById);}
    }
}