import { Router } from "express";
import { createPrerequisite,deletePrerequisite,getAllPrerequisites,getPrerequisitesbyCourse} from "../controllers/prerequisites.controller.js";

const routerPrerequisites=Router();

//GET
routerPrerequisites.get("/prerequisites",getAllPrerequisites);

routerPrerequisites.get("/prerequisites/:course_id",getPrerequisitesbyCourse);

//POST
routerPrerequisites.post("/prerequisites",createPrerequisite);

//DELETE
routerPrerequisites.delete("/prerequisites/:course_id/:prerequisite_course_id",deletePrerequisite);

export default routerPrerequisites