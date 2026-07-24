import { type Request, type Response, type NextFunction, response } from "express";
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
        console.error(error);
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
        console.error(error);
        res
            .status(500)
            .json({ error: " Error al ejecutar endpoint getCourseById" });
    }
};


//ENPOINT POST: CREAR UNA MATERIA
export const createCourse = async (req: Request, res: Response) => {
    try {
        const { name, day, start_time, end_time, modality, difficulty, credits } = req.body

        if (!name || !day || !start_time || !end_time || !modality || !difficulty || !credits) {
            return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
        }

        const newCourse=await prisma.courses.create({
            data:{
                name,
                day,
                start_time:new Date(`1970-01-01T${ start_time }:00.000Z`),
                end_time:new Date(`1970-01-01T${ end_time }:00.000Z`),
                modality,
                difficulty,
                credits:Number(credits)
            }
        });

        res.status(201).json({mensaje:"Materia creada con exito."})
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: " Error al ejecutar endpoint createCourse" });
    }
}

