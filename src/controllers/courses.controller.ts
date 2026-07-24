import type { Request, Response, NextFunction } from "express";
import prisma from "../database/prisma.js";

//POINT GET DE TODAS LAS MATERIAS
export const getAllCourses = async (req: Request, res: Response) => {
    try {
        const courses = await prisma.courses.findMany({
            orderBy: { id: "asc" },
        });

        if (courses.length === 0) {
            return res
                .status(404)
                .json({ mensaje: "No existen cursos para mostrar" });
        }

        res.status(200).json(courses);
    } catch (error) {
        res
            .status(500)
            .json({ error: " Error al ejecutar endpoint getAllCourses" });
    }
};

//POINT GET DE UNA MATERIA POR ID
export const getCourseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const course = await prisma.courses.findUnique({
            where: { id: Number(id) },
        });

        if (!course) {
            return res.status(404).json({ mensaje: "Materia no existe" });
        }

        res.status(200).json(course);
    } catch (error) {
        res
            .status(500)
            .json({ error: " Error al ejecutar endpoint getCourseById" });
    }
};
