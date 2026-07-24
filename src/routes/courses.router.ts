import { Router } from "express";
import { getAllCourses, createCourse, deleteCourse,getCourseById,updateCourse } from "../controllers/courses.controller.js";

const routerCourses=Router();

//GET
routerCourses.get("/courses",getAllCourses);

routerCourses.get("/courses/:id",getCourseById);

//POST
routerCourses.post("/courses",createCourse);

//PUT 
routerCourses.put("/courses/:id",updateCourse);

//DELETE
routerCourses.delete("/courses/:id",deleteCourse);

export default routerCourses