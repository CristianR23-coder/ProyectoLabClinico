import { Request, Response } from "express";
import { Panel, PanelI } from "../database/models/Panel";

export class PanelController {
  // Obtener todos los paneles con status "ACTIVE"
  public async getAllPanels(req: Request, res: Response) {
    try {
      const panels: PanelI[] = await Panel.findAll({
        where: { status: "ACTIVE" },
      });
      res.status(200).json({ panels });
    } catch (error) {
      res.status(500).json({ error: "Error fetching panels" });
    }
  }

  // Obtener un panel por ID
  public async getPanelById(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const panel = await Panel.findOne({
        where: {
          id: pk,
          status: "ACTIVE",
        },
      });
      if (panel) {
        res.status(200).json(panel);
      } else {
        res.status(404).json({ error: "Panel not found or inactive" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching panel" });
    }
  }
}
