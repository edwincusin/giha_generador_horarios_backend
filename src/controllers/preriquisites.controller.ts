import type { Request, Response } from "express";
import prisma from "../database/prisma.js";


//METODO PARA CONSULTAR TODOS LOSPRERREQUISITOS REGISTRADOS
export const getAllPrerequisites=async(req:Request, res:Response)=>{

    try {
        const prerequisites=await prisma.prerequisites.findMany(
            {
                orderBy :{course_id:"asc"}
            }
        );
        res.status(200).json(prerequisites);
    } catch (error) {
        console.error("Error al recuperar getAllPrerequisites: ",error)
        res.status(500).json({error:"Error al recuperar getAllPrerequisites"});
    }
} 

