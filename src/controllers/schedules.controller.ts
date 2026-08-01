import type { Request, Response } from "express";
import  prisma  from "../database/prisma.js"; 
import {
    mapToSimpleSchedule,
    generateAndSeparateSchedules,
    type RequiredModality
} from "../utils/scheduleValidation.js"; 

// Recibe la configuración del usuario, consulta las materias
// disponibles, valida que existan suficientes, genera todas las
// combinaciones posibles, las evalúa contra las reglas y devuelve
// los horarios válidos junto con estadísticas del proceso.
export async function generateSchedules(req: Request, res: Response) {
    try {
        const {
            numberOfCourses,
            requiredCourses,
            maximumCredits,
            maximumDifficultCourses,
            requiredModality,
            avoidTimeConflicts,
            validatePrerequisites,
            completedCourses
        } = req.body;

        // 1. Traer todas las materias con sus prerrequisitos
        const coursesFromDb = await prisma.courses.findMany({
            include: {
                prerequisites_prerequisites_course_idTocourses: true
            }
        });

        // 2. Transformar a la forma simple que usan las validaciones
        const allCourses = mapToSimpleSchedule(coursesFromDb);

        // 3. Validar que haya suficientes materias
        if (numberOfCourses > allCourses.length) {
            return res.status(400).json({
                mensaje: "No existen suficientes materias disponibles para cumplir la configuración solicitada.",
                totalCourses: allCourses.length,
                requested: numberOfCourses
            });
        }

        // 4. Armar el objeto de configuración
        const configuration = {
            numberOfCourses,
            requiredCourses: requiredCourses ?? [],
            maximumCredits,
            maximumDifficultCourses,
            requiredModality: (requiredModality ?? "Cualquiera") as RequiredModality,
            completedCourses: completedCourses ?? []
        };

        // 5. Generar, evaluar y separar horarios
        const { totalCombinations, validSchedules, discardedSchedules } =generateAndSeparateSchedules(allCourses, configuration);

        // 6. Responder con el formato del documento
        res.json({
            totalCourses: allCourses.length,
            selectedAmount: numberOfCourses,
            totalCombinations,
            validSchedules: validSchedules.length,
            discardedSchedules: discardedSchedules.length,
            schedules: [...validSchedules,...discardedSchedules].map(item => ({
                courses: item.courses.map(c => c.name),
                totalCredits: item.courses.reduce((sum, c) => sum + c.credits, 0),
                valid: item.evaluation.valid,
                reasons: item.evaluation.reasons
            }))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al generar los horarios." });
    }
}