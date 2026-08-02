--=======================================
--BDD HECHO POSTGRES-PGADMIN4 
--=======================================

--Crear base de datos -> Generador Inteligente de Horarios Académicos
--CREATE DATABASE giha_generador_horarios;

-- BORRAR TABLAS (orden inverso a la creación)
DROP TABLE IF EXISTS discard_reasons;
DROP TABLE IF EXISTS schedule_courses;
DROP TABLE IF EXISTS generated_schedules;
DROP TABLE IF EXISTS configuration_completed_courses;
DROP TABLE IF EXISTS configuration_required_courses;
DROP TABLE IF EXISTS schedule_configurations;
DROP TABLE IF EXISTS prerequisites;
DROP TABLE IF EXISTS courses;


-- 1. COURSES (Materias)
-- Concepto matemático: Conjunto Universal (U)
-- Cada registro es UNA oferta específica (día+hora+modalidad)
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    day VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    modality VARCHAR(20) NOT NULL CHECK (modality IN ('Presencial', 'Virtual')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Baja', 'Media', 'Alta')),
    credits INTEGER NOT NULL CHECK (credits > 0)
);

-- 2. PREREQUISITES (Prerrequisitos)
-- Concepto matemático: Implicación (P → Q)
-- "Si seleccionas course_id, entonces debes tener prerequisite_course_id"

CREATE TABLE prerequisites (
	course_id INTEGER NOT NULL,
	prerequisite_course_id INTEGER NOT NULL,
	
	PRIMARY KEY (course_id,	prerequisite_course_id),
	
	FOREIGN KEY (course_id)	REFERENCES courses(id),
	FOREIGN KEY (prerequisite_course_id) REFERENCES courses(id)
);



-- 3. SCHEDULE_CONFIGURATIONS (Configuraciones)
-- Lo que el usuario arma antes de generar horarios
CREATE TABLE schedule_configurations (
    id SERIAL PRIMARY KEY,
    number_of_courses INTEGER NOT NULL CHECK (number_of_courses > 0),
    maximum_credits INTEGER NOT NULL,
    maximum_difficult_courses INTEGER NOT NULL,
    required_modality VARCHAR(20) NOT NULL CHECK (required_modality IN ('Presencial', 'Virtual')),
    avoid_time_conflicts BOOLEAN DEFAULT TRUE,
    validate_prerequisites BOOLEAN DEFAULT TRUE
);




-- 4. CONFIGURATION_REQUIRED_COURSES
-- Concepto matemático: Subconjunto obligatorio (O ⊆ H)
-- Materias que el usuario exige que SÍ estén en el horario
CREATE TABLE configuration_required_courses (
    configuration_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
	
    PRIMARY KEY (configuration_id, course_id),
    FOREIGN KEY (configuration_id) REFERENCES schedule_configurations(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);





-- 5. CONFIGURATION_COMPLETED_COURSES
-- Materias que el estudiante ya aprobó (para validar prerrequisitos)
CREATE TABLE configuration_completed_courses (
    configuration_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
	
    PRIMARY KEY (configuration_id, course_id),
    FOREIGN KEY (configuration_id) REFERENCES schedule_configurations(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);





-- 6. GENERATED_SCHEDULES (Horarios generados)
-- Cada combinación evaluada (venga de C(n,r))
CREATE TABLE generated_schedules (
    id SERIAL PRIMARY KEY,
    configuration_id INTEGER NOT NULL,
    total_credits INTEGER NOT NULL,
    valid BOOLEAN NOT NULL,
	
    FOREIGN KEY (configuration_id) REFERENCES schedule_configurations(id)
);




-- 7. SCHEDULE_COURSES
-- Concepto matemático: cada horario ES un subconjunto de courses
CREATE TABLE schedule_courses (
    schedule_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
	
    PRIMARY KEY (schedule_id, course_id),
    FOREIGN KEY (schedule_id) REFERENCES generated_schedules(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);





-- 8. DISCARD_REASONS (Motivos de descarte)
-- Concepto matemático: qué proposición dio "false"
CREATE TABLE discard_reasons (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
	
    FOREIGN KEY (schedule_id) REFERENCES generated_schedules(id)
);


SELECT * FROM courses;

--------------------------------SRIPTS PARA HACER PRUEBA-------------------------------------------------
-- ==========================================================================================================
-- SEED DE PRUEBA: 10 materias + prerrequisitos
-- Generador inteligente de horarios académicos
-- Ejecutar directamente en psql o en tu cliente PostgreSQL preferido
-- ==========================================================================================================

BEGIN;

-- Limpia todas las tablas relacionadas y reinicia los contadores de id
-- (ojo: esto borra TODOS los datos existentes, úsalo solo en tu entorno de pruebas)
TRUNCATE TABLE
    discard_reasons,
    schedule_courses,
    generated_schedules,
    configuration_completed_courses,
    configuration_required_courses,
    schedule_configurations,
    prerequisites,
    courses
RESTART IDENTITY CASCADE;

-- ==========================================================================================================
-- MATERIAS (conjunto universal U)
-- ==========================================================================================================
-- Nota: las materias 1 y 7 comparten día y horario (Lunes 08:00-10:00)
-- a propósito, para poder probar la detección de cruces (Paso 8).
INSERT INTO courses (id, name, day, start_time, end_time, modality, difficulty, credits) VALUES
(1,  'Programación',            'Lunes',     '08:00', '10:00', 'Presencial', 'Alta',  4),
(2,  'Matemáticas',             'Lunes',     '10:00', '12:00', 'Presencial', 'Alta',  3),
(3,  'Inglés',                  'Martes',    '08:00', '10:00', 'Virtual',    'Baja',  2),
(4,  'Redes',                   'Miércoles', '08:00', '10:00', 'Presencial', 'Media', 3),
(5,  'Base de datos básica',    'Jueves',    '08:00', '10:00', 'Virtual',    'Media', 3),
(6,  'Base de datos avanzada',  'Jueves',    '10:00', '12:00', 'Virtual',    'Alta',  4),
(7,  'Programación avanzada',   'Lunes',     '08:00', '10:00', 'Presencial', 'Alta',  4),
(8,  'Diseño UX/UI',            'Viernes',   '08:00', '10:00', 'Virtual',    'Baja',  2),
(9,  'Sistemas operativos',     'Martes',    '10:00', '12:00', 'Presencial', 'Media', 3),
(10, 'Álgebra lineal',          'Miércoles', '10:00', '12:00', 'Presencial', 'Media', 3);

-- Sincroniza la secuencia del id autoincremental, ya que insertamos ids explícitos
SELECT setval(pg_get_serial_sequence('courses', 'id'), (SELECT MAX(id) FROM courses));

-- ==========================================================================================================
-- PRERREQUISITOS (implicación P → Q)
-- ==========================================================================================================
INSERT INTO prerequisites (course_id, prerequisite_course_id) VALUES
(6, 5),  -- Base de datos avanzada  → requiere → Base de datos básica
(7, 1),  -- Programación avanzada   → requiere → Programación
(9, 4);  -- Sistemas operativos     → requiere → Redes

COMMIT;

-- ==========================================================================================================
-- Verificación rápida
-- ==========================================================================================================
-- SELECT * FROM courses ORDER BY id;
-- SELECT p.course_id, c1.name AS materia, p.prerequisite_course_id, c2.name AS requiere
-- FROM prerequisites p
-- JOIN courses c1 ON c1.id = p.course_id
-- JOIN courses c2 ON c2.id = p.prerequisite_course_id;

	SELECT name, COUNT(*) 
FROM courses 
GROUP BY name 
HAVING COUNT(*) > 1;

