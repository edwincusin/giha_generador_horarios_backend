import { Router } from "express";
import {
    getAllConfigurations,
    getConfigurationById,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration
} from "../controllers/scheduleConfigurations.controller.js";

const routerScheduleConfigurations = Router();

// GET
routerScheduleConfigurations.get("/schedule-configurations", getAllConfigurations);
routerScheduleConfigurations.get("/schedule-configurations/:id", getConfigurationById);

// POST
routerScheduleConfigurations.post("/schedule-configurations", createConfiguration);

// PUT
routerScheduleConfigurations.put("/schedule-configurations/:id", updateConfiguration);

// DELETE
routerScheduleConfigurations.delete("/schedule-configurations/:id", deleteConfiguration);

export default routerScheduleConfigurations;