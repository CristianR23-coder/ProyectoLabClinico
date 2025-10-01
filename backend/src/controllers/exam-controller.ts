import { Request, Response } from "express";
import { Exam, ExamI } from "../database/models/Exam";

export class ExamController {
  // Obtener todos los exámenes con estado "ACTIVE"
  public async getAllExams(req: Request, res: Response) {
    try {
      const exams: ExamI[] = await Exam.findAll({
        where: { status: "ACTIVE" },
      });
      res.status(200).json({ exams });
    } catch (error) {
      res.status(500).json({ error: "Error fetching exams" });
    }
  }

  // Obtener un examen por ID
  public async getExamById(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const exam = await Exam.findOne({
        where: {
          id: pk,
          status: "ACTIVE",
        },
      });
      if (exam) {
        res.status(200).json(exam);
      } else {
        res.status(404).json({ error: "Exam not found or inactive" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching exam" });
    }
  }
}
