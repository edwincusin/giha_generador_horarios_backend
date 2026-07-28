import type { Request, Response } from "express";
import prisma from "../database/prisma.js";


//METODO PARA CONSULTAR TODOS LOSPRERREQUISITOS REGISTRADOS
export const getAllPrerequisites = async (req: Request, res: Response) => {

    try {
        const prerequisites = await prisma.prerequisites.findMany(
            {
                orderBy: { course_id: "asc" }
            }
        );
        res.status(200).json(prerequisites);
    } catch (error) {
        console.error("Error al recuperar getAllPrerequisites: ", error)
        res.status(500).json({ error: "Error al recuperar getAllPrerequisites" });
    }
}

//METODO PARA CONSULTAR PRESRREQUISITOS POR ID O CURSO
export const getPrerequisitesbyCourse = async (req: Request, res: Response) => {

    try {
        const { course_id } = req.params

        const prerequisite = await prisma.prerequisites.findMany(
            {
                where: { course_id: Number(course_id) }
            }
        )

        res.status(200).json(prerequisite);

    } catch (error) {
        console.error("Error al recuperar getPrerequisitesbyCourse: ", error)
        res.status(500).json({ error: "Error al recuperar getPrerequisitesbyCourse" });
    }
}


//ASIGNAR PRERREQUISITO A UNA MATERIA
export const createPrerequisite = async (req: Request, res: Response) => {
    try {
        const { course_id, prerequisite_course_id } = req.body

        if (!course_id || !prerequisite_course_id) {
            return res.status(400).json({ error: "Campos vacios, todos los campos son obligatorios" });
        }

        if (course_id === prerequisite_course_id) {
            return res.status(400).json({ error: "La misma materia no puede ser considerado como prerequisito." });
        }


        const course = await prisma.courses.findUnique({
            where: { id: Number(course_id) }
        })

        const prerequisite = await prisma.courses.findUnique({
            where: { id: Number(prerequisite_course_id) }
        })

        if (!course || !prerequisite) {
            return res.status(400).json({ error: "Una de las materias no existe." });
        }

        await prisma.prerequisites.create({
            data: {
                course_id: Number(course_id),
                prerequisite_course_id: Number(prerequisite_course_id)
            }
        })

        res.status(201).json({ mensaje: "Prerrequisito creada." })

    } catch (error) {
        console.error("Error al  createPrerequisite: ", error)
        res.status(500).json({ error: "Error al  createPrerequisite" });
    }
}

//METODO PARA ELIMINAR PRERREQUISITO POR PARAM, ID COURSE + ID PRERREQUISITO COURSE
export const deletePrerequisite = async (req: Request, res: Response) => {

    try {
        const { course_id, prerequisite_course_id } = req.params

        const prerequisite = await prisma.prerequisites.findUnique({
            where: {
                course_id_prerequisite_course_id: {
                    course_id: Number(course_id),
                    prerequisite_course_id: Number(prerequisite_course_id)
                }
            }
        })

        if (!prerequisite) {
            return res.status(404).json({ error: "No existe el prerrequisito para eliminar." })
        }

        await prisma.prerequisites.delete({
            where: {
                course_id_prerequisite_course_id: {
                    course_id: Number(course_id),
                    prerequisite_course_id: Number(prerequisite_course_id)
                }
            }
        })
        res.status(200).json({ mensaje: "Prerrequisito eliminada." })

    } catch (error) {
        console.error("Error al recuperar deletePrerequisite: ", error)
        res.status(500).json({ error: "Error al recuperar deletePrerequisite" });
    }
}