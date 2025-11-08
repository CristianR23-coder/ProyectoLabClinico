import { Request, Response } from "express";
import { Exam, ExamI } from "../database/models/Exam";

export class ExamController {
  // Obtener exámenes. Si ?status=ACTIVE/INACTIVE, filtra; caso contrario trae todos.
  public async getAllExams(req: Request, res: Response) {
    try {
      const rawStatus = (req.query.status as string | undefined)?.toUpperCase();
      const allowed: ExamI['status'][] = ['ACTIVE', 'INACTIVE'];
      const where: Partial<ExamI> = {};

      if (rawStatus && allowed.includes(rawStatus as ExamI['status'])) {
        where.status = rawStatus as ExamI['status'];
      }

      const exams: ExamI[] = await Exam.findAll({ where });
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

  // Create a new exam
  public async createExam(req: Request, res: Response) {
    const { code, name, method, specimenType, processingTimeMin, priceBase, status } = req.body;
    try {
      let body: ExamI = {
        code,
        name,
        method,
        specimenType,
        processingTimeMin,
        priceBase,
        status,
      } as ExamI;

      const newExam = await Exam.create({ ...body } as any);
      res.status(201).json(newExam);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update an exam
  public async updateExam(req: Request, res: Response) {
    const { id: pk } = req.params;
    const { code, name, method, specimenType, processingTimeMin, priceBase, status } = req.body;
    try {
      let body: ExamI = {
        code,
        name,
        method,
        specimenType,
        processingTimeMin,
        priceBase,
        status,
      } as ExamI;

      const examExist = await Exam.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (examExist) {
        await examExist.update(body as any, { where: { id: pk } });
        res.status(200).json(examExist);
      } else {
        res.status(404).json({ error: "Exam not found or inactive" });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete an exam physically
  public async deleteExam(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const examToDelete = await Exam.findByPk(id);

      if (examToDelete) {
        await examToDelete.destroy();
        res.status(200).json({ message: "Exam deleted successfully" });
      } else {
        res.status(404).json({ error: "Exam not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error deleting exam" });
    }
  }

  // Delete an exam logically (change status to "INACTIVE")
  public async deleteExamAdv(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const examToUpdate = await Exam.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (examToUpdate) {
        await examToUpdate.update({ status: "INACTIVE" });
        res.status(200).json({ message: "Exam marked as inactive" });
      } else {
        res.status(404).json({ error: "Exam not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error marking exam as inactive" });
    }
  }
}
