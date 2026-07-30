import type { Request, Response } from "express";
import prisma from "../database/prisma.js";

//METODO PARA CONSULTAR TODAS LAS CONFIGURACIONES REGISTRADAS
export const getAllConfigurations = async (req: Request, res: Response) => {
    try {
        const configurations = await prisma.schedule_configurations.findMany({
            orderBy: { id: "asc" }
        });

        res.status(200).json(configurations);
    } catch (error) {
        console.error("Error al recuperar getAllConfigurations: ", error);
        res.status(500).json({ error: "Error al recuperar getAllConfigurations" });
    }
};

//METODO PARA CONSULTAR UNA CONFIGURACION POR ID
export const getConfigurationById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (isNaN(Number(id))) {
            return res.status(400).json({ error: "ID de configuración inválido, no es un numero" });
        }

        const configuration = await prisma.schedule_configurations.findUnique({
            where: { id: Number(id) }
        });

        if (!configuration) {
            return res.status(404).json({ error: "Configuración no encontrada" });
        }

        res.status(200).json(configuration);
    } catch (error) {
        console.error("Error al recuperar getConfigurationById: ", error);
        res.status(500).json({ error: "Error al recuperar getConfigurationById" });
    }
};

//METODO PARA CREAR UNA CONFIGURACION COMPLETA
export const createConfiguration = async (req: Request, res: Response) => {
    try {
        const {
            number_of_courses,
            maximum_credits,
            maximum_difficult_courses,
            required_modality,
            avoid_time_conflicts,
            validate_prerequisites,
            required_courses,     // arreglo de ids, ej: [2, 5]
            completed_courses     // arreglo de ids, ej: [1, 3]
        } = req.body;

        if (!number_of_courses || !maximum_credits || maximum_difficult_courses === undefined || !required_modality) {
            return res.status(400).json({ error: "Faltan campos obligatorios en la configuración" });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Crea la configuración principal
            const configuration = await tx.schedule_configurations.create({
                data: {
                    number_of_courses: Number(number_of_courses),
                    maximum_credits: Number(maximum_credits),
                    maximum_difficult_courses: Number(maximum_difficult_courses),
                    required_modality,
                    avoid_time_conflicts: avoid_time_conflicts ?? true,
                    validate_prerequisites: validate_prerequisites ?? true,
                }
            });

            // 2. Crea las materias obligatorias, si vinieron
            if (Array.isArray(required_courses) && required_courses.length > 0) {
                await tx.configuration_required_courses.createMany({
                    data: required_courses.map((courseId: number) => ({
                        configuration_id: configuration.id,
                        course_id: Number(courseId)
                    }))
                });
            }

            // 3. Crea las materias ya aprobadas, si vinieron
            if (Array.isArray(completed_courses) && completed_courses.length > 0) {
                await tx.configuration_completed_courses.createMany({
                    data: completed_courses.map((courseId: number) => ({
                        configuration_id: configuration.id,
                        course_id: Number(courseId)
                    }))
                });
            }

            return configuration;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error("Error al crear createConfiguration: ", error);
        res.status(500).json({ error: "Error al crear createConfiguration" });
    }
};

// Reemplaza los datos + las materias obligatorias/aprobadas por id
export const updateConfiguration = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            number_of_courses,
            maximum_credits,
            maximum_difficult_courses,
            required_modality,
            avoid_time_conflicts,
            validate_prerequisites,
            required_courses,
            completed_courses
        } = req.body;

        if (isNaN(Number(id))) {
            return res.status(400).json({ error: "ID de configuración inválido" });
        }

        const existing = await prisma.schedule_configurations.findUnique({
            where: { id: Number(id) }
        });

        if (!existing) {
            return res.status(404).json({ error: "Configuración no encontrada" });
        }

        const result = await prisma.$transaction(async (tx) => {
            const configuration = await tx.schedule_configurations.update({
                where: { id: Number(id) },
                data: {
                    number_of_courses: Number(number_of_courses),
                    maximum_credits: Number(maximum_credits),
                    maximum_difficult_courses: Number(maximum_difficult_courses),
                    required_modality,
                    avoid_time_conflicts: avoid_time_conflicts ?? true,
                    validate_prerequisites: validate_prerequisites ?? true,
                }
            });

            // Borra las materias obligatorias/aprobadas anteriores,
            // y crea las nuevas (más simple que comparar cuáles cambiaron)
            await tx.configuration_required_courses.deleteMany({
                where: { configuration_id: Number(id) }
            });

            await tx.configuration_completed_courses.deleteMany({
                where: { configuration_id: Number(id) }
            });

            if (Array.isArray(required_courses) && required_courses.length > 0) {
                await tx.configuration_required_courses.createMany({
                    data: required_courses.map((courseId: number) => ({
                        configuration_id: Number(id),
                        course_id: Number(courseId)
                    }))
                });
            }

            if (Array.isArray(completed_courses) && completed_courses.length > 0) {
                await tx.configuration_completed_courses.createMany({
                    data: completed_courses.map((courseId: number) => ({
                        configuration_id: Number(id),
                        course_id: Number(courseId)
                    }))
                });
            }

            return configuration;
        });

        res.status(200).json(result);
    } catch (error) {
        console.error("Error al actualizar updateConfiguration: ", error);
        res.status(500).json({ error: "Error al actualizar updateConfiguration" });
    }
};


// Borra la configuración y sus tablas dependientes(borrado jerárquico manual)

export const deleteConfiguration = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (isNaN(Number(id))) {
            return res.status(400).json({ error: "ID de configuración inválido" });
        }

        const existing = await prisma.schedule_configurations.findUnique({
            where: { id: Number(id) }
        });

        if (!existing) {
            return res.status(404).json({ error: "Configuración no encontrada" });
        }

        await prisma.$transaction(async (tx) => {
            await tx.configuration_required_courses.deleteMany({
                where: { configuration_id: Number(id) }
            });

            await tx.configuration_completed_courses.deleteMany({
                where: { configuration_id: Number(id) }
            });

            await tx.schedule_configurations.delete({
                where: { id: Number(id) }
            });
        });

        res.status(200).json({ mensaje: "Configuración eliminada con éxito" });
    } catch (error) {
        console.error("Error al eliminar deleteConfiguration: ", error);
        res.status(500).json({ error: "Error al eliminar deleteConfiguration" });
    }
};