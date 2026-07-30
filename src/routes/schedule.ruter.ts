
import { Router } from "express";
import { generateSchedules } from "../controllers/schedules.controller.js"; // ajusta la ruta según tu carpeta

const router = Router();

// POST /schedules/generate
router.post("/schedules/generate", generateSchedules);

export default router;