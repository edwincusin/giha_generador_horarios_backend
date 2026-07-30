import type { courses } from "../../generated/prisma/client.js";

//28. Paso 6: representar cada horario como un conjunto
//=====================================================================================================

// Convierte un horario (arreglo de materias) en un Set
// con solo los NOMBRES. Esto nos permite usar .has() para
// verificar pertenencia (∈) y comparar subconjuntos (⊆) fácilmente.
export const getCourseNameSet = (schedule: courses[]) => {
    return new Set(
        schedule.map(course => course.name) // nos quedamos solo con el campo "name" de cada materia
    );
}



// 29. Paso 7: validar materias obligatorias
// ====================================================================================================

// Concepto matemático: Subconjunto obligatorio (O ⊆ H)
// "O" = materias obligatorias que pidió el usuario
// "H" = materias del horario generado
//
// Verifica que TODAS las materias obligatorias (O)
// estén presentes dentro del horario (H).
export const includesRequiredCourses = (scheduleSet: Set<string>, requiredCoursesSet: Set<string>) => {

    // [...requiredCoursesSet] convierte el Set en un arreglo normal,
    // porque .every() es un método de arreglos, no existe en los Sets directamente.

    return [...requiredCoursesSet].every(
        // .every() revisa: ¿esta condición se cumple para TODOS los elementos?
        // Si UNA sola materia obligatoria no está en el horario, devuelve false.
        course => scheduleSet.has(course) // ¿esta materia obligatoria pertenece (∈) al horario?
    );
}


/**30. Paso 8: detectar cruces de horario */
//=======================================================================================================

//validar que cruce de horarios
export function haveTimeConflict(courseA: courses, courseB: courses) {
    if (courseA.day !== courseB.day) {
        return false;
    }
    return (
        courseA.start_time < courseB.end_time &&
        courseB.start_time < courseA.end_time
    ); //true || false
}

//Esta usa haveTimeConflict para revisar todas las combinaciones
//de pares dentro de un horario completo (no solo 2 materias sueltas, sino un arreglo con varias)
export function hasScheduleConflicts(courses: courses[]) {
    for (let i = 0; i < courses.length; i++) {
        for (let j = i + 1; j < courses.length; j++) {
            if (haveTimeConflict(courses[i]!, courses[j]!)) {
                return true;
            }
        }
    }
    return false;
}
//Observación:
// Dos materias no se consideran cruzadas cuando una termina exactamente en el
// mismo instante en que inicia la otra.


//31. Paso 9: validar la modalidad
//=========================================================================================================

export type RequiredModality = "Cualquiera" | "Presencial" | "Virtual";

//validar que el horario cumpla con la modalidad requerida
export function meetsModalityRule(schedule: courses[], requiredModality: RequiredModality): boolean {
    if (requiredModality === "Cualquiera") {
        return true;
    }
    return schedule.some(course => course.modality === requiredModality); //true o false
}


//32. Paso 10: validar la dificultad
//=========================================================================================================

//validar que el horario no supere el máximo de materias difíciles
export function meetsDifficultyRule(schedule: courses[], maximumDifficultCourses: number): boolean {
    const difficultCourses = schedule.filter(
        course => course.difficulty === "Alta"
    );

    return difficultCourses.length <= maximumDifficultCourses; //true o false
}

///33. Paso 11: validar créditos
//=========================================================================================================
//validar que el horario no supere el máximo de créditos permitido
export function meetsCreditLimit(schedule: courses[], maximumCredits: number): boolean {
    const totalCredits = schedule.reduce(
        (total, course) => total + course.credits, 0
    );

    return totalCredits <= maximumCredits;
}



//34. Paso 12: validar prerrequisitos  parte 1
// ===============================================

import type { prerequisites } from "../../generated/prisma/client.js";

// Tipo simple que usarán las funciones de validación
export type CourseWithPrereqs = courses & { prerequisites: number[] };

// Transforma los datos crudos de Prisma a la forma simple
export function mapToSimpleSchedule(coursesFromDb: (courses & { prerequisites_prerequisites_course_idTocourses: prerequisites[] })[]): CourseWithPrereqs[] {
    return coursesFromDb.map(course => ({
        ...course, prerequisites: course.prerequisites_prerequisites_course_idTocourses.map(
            p => p.prerequisite_course_id
        )
    }));
}

// Concepto matemático: Implicación lógica (P → Q)
// P: se seleccionó una materia con prerrequisito
// Q: el prerrequisito está cubierto (ya fue aprobado o está dentro del mismo horario)
//
// Un prerrequisito es válido si la materia prerrequisito:
//   a) ya fue aprobada previamente (está en completedCourses), o
//   b) forma parte del mismo horario generado (está en schedule)
//
// availableCourses = unión (∪) entre las materias del horario y las ya aprobadas
// 34. Paso 12: validar prerrequisitos parte 2
export function meetsPrerequisites(schedule: CourseWithPrereqs[], completedCourses: number[]): boolean {

    const availableCourses = new Set<number>([
        ...schedule.map(course => course.id), ...completedCourses
    ]);

    return schedule.every(course =>
        course.prerequisites.every(prerequisiteId => availableCourses.has(prerequisiteId))
    );
};


// 35. Paso 13: construir la regla completa -- validacion completa
// ==========================================================================================================

// Concepto matemático: conjunción de proposiciones (T ∧ O ∧ C ∧ D ∧ R ∧ M ∧ Pr)
// El horario solo es válido cuando TODAS las condiciones son verdaderas al mismo tiempo
export function validateSchedule(
    schedule: CourseWithPrereqs[],
    configuration: {
        numberOfCourses: number;
        requiredCourses: string[];        // nombres de materias obligatorias
        maximumCredits: number;
        maximumDifficultCourses: number;
        requiredModality: RequiredModality;
        completedCourses: number[];       // ids de materias ya aprobadas
    }
): boolean {

    // T: la cantidad de materias coincide con la configuración
    const hasCorrectSize = schedule.length === configuration.numberOfCourses;

    // O: incluye todas las materias obligatorias (subconjunto ⊆)
    const scheduleSet = getCourseNameSet(schedule);
    const requiredSet = new Set(configuration.requiredCourses);
    const hasRequiredCourses = includesRequiredCourses(scheduleSet, requiredSet);

    // C: no tiene cruces de horario
    const hasNoConflicts =!hasScheduleConflicts(schedule);

    // M: cumple la modalidad requerida
    const meetsModality =meetsModalityRule(schedule, configuration.requiredModality);

    // D: no supera el máximo de materias difíciles
    const meetsDifficulty =meetsDifficultyRule(schedule, configuration.maximumDifficultCourses);

    // R: no supera el máximo de créditos
    const meetsCredits =meetsCreditLimit(schedule, configuration.maximumCredits);

    // Pr: cumple todos los prerrequisitos (implicación P → Q)
    const meetsPrereqs = meetsPrerequisites(schedule, configuration.completedCourses);

    // Conjunción final: AND de todas las proposiciones
    return (
        hasCorrectSize &&
        hasRequiredCourses &&
        hasNoConflicts &&
        meetsModality &&
        meetsDifficulty &&
        meetsCredits &&
        meetsPrereqs
    );
}


// 36. Paso 14: explicar las razones de descarte
// ==========================================================================================================

// A diferencia de validateSchedule (que solo dice true/false),
// esta función recorre las mismas reglas pero ACUMULA un mensaje
// por cada proposición que resultó falsa.
export function evaluateSchedule(
    schedule: CourseWithPrereqs[],
    configuration: {
        numberOfCourses: number;
        requiredCourses: string[];
        maximumCredits: number;
        maximumDifficultCourses: number;
        requiredModality: RequiredModality;
        completedCourses: number[];
    }
): { valid: boolean; reasons: string[] } {

    const reasons: string[] = [];

    // T: cantidad correcta de materias
    if (schedule.length !== configuration.numberOfCourses) {
        reasons.push("La cantidad de materias no coincide con la configuración solicitada.");
    }

    // O: incluye las materias obligatorias
    const scheduleSet = getCourseNameSet(schedule);
    const requiredSet = new Set(configuration.requiredCourses);
    if (!includesRequiredCourses(scheduleSet, requiredSet)) {
        reasons.push("No contiene todas las materias obligatorias.");
    }

    // C: no tiene cruces de horario
    if (hasScheduleConflicts(schedule)) {
        reasons.push("El horario tiene cruces.");
    }

    // M: cumple la modalidad requerida
    if (!meetsModalityRule(schedule, configuration.requiredModality)) {
        reasons.push("No cumple la modalidad requerida.");
    }

    // D: no supera el máximo de materias difíciles
    if (!meetsDifficultyRule(schedule, configuration.maximumDifficultCourses)) {
        reasons.push("Supera el máximo de materias difíciles.");
    }

    // R: no supera el máximo de créditos
    if (!meetsCreditLimit(schedule, configuration.maximumCredits)) {
        reasons.push("Supera el máximo de créditos.");
    }

    // Pr: cumple todos los prerrequisitos
    if (!meetsPrerequisites(schedule, configuration.completedCourses)) {
        reasons.push("No cumple los prerrequisitos.");
    }

    return {
        valid: reasons.length === 0,//true si todo es igual  0
        reasons
    };
}



// 37. Paso 15: separar horarios válidos y descartados
// ==========================================================================================================

import { generarCombinaciones } from "./combinatorics.js";

export function generateAndSeparateSchedules(
    allCourses: CourseWithPrereqs[],
    configuration: {
        numberOfCourses: number;
        requiredCourses: string[];
        maximumCredits: number;
        maximumDifficultCourses: number;
        requiredModality: RequiredModality;
        completedCourses: number[];
    }
) {

    // Paso 5: generar TODAS las combinaciones posibles de materias
    // (usa tu función genérica generarCombinaciones)
    const possibleSchedules = generarCombinaciones(allCourses, configuration.numberOfCourses
    );

    // Evaluamos cada combinación una por una
    const evaluatedSchedules = possibleSchedules.map(schedule => ({
        courses: schedule,
        evaluation: evaluateSchedule(schedule, configuration)
    }));

    // Separamos según el resultado de "valid"
    const validSchedules = evaluatedSchedules.filter(
        item => item.evaluation.valid
    );

    const discardedSchedules = evaluatedSchedules.filter(
        item => !item.evaluation.valid
    );

    return {
        totalCombinations: possibleSchedules.length,
        validSchedules,
        discardedSchedules
    };
}