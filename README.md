# GIHA — Generador Inteligente de Horarios Académicos

Backend del sistema GIHA, desarrollado con **Node.js + TypeScript + Express + Prisma + PostgreSQL**, aplicando conceptos de matemáticas discretas (teoría de conjuntos, álgebra proposicional y combinatoria).

---

## 🚀 Guía de instalación

### 1. Iniciar el proyecto

```bash
npm init -y
```

### 2. Instalar dependencias principales

```bash
# Framework web
npm install express

# Permitir CORS
npm install cors

# PostgreSQL driver
npm install pg

# Cliente de Prisma
npm install @prisma/client
```

### 3. Instalar dependencias de desarrollo

```bash
# TypeScript
npm install -D typescript

# Ejecutar TS directamente (reemplaza a ts-node, compatible con Node moderno)
npm install -D tsx

# Definiciones de tipos para TypeScript
npm install -D @types/express
npm install -D @types/cors
npm install -D @types/pg

# Reinicio automático al guardar cambios
npm install -D nodemon

# ORM Prisma
npm install -D prisma
```

### 4. Inicializar TypeScript

```bash
npx tsc --init
```

### 5. Inicializar Prisma

```bash
npx prisma init
```

Esto crea la carpeta `prisma/` con `schema.prisma`, y un archivo `.env` con la variable `DATABASE_URL`.

### 6. Configurar la conexión a la base de datos

Edita `.env`:

```
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/giha_generador_horarios?schema=public"
```

### 7. Traer las tablas ya existentes (introspección)

Como la base de datos **ya fue creada manualmente** con el script SQL (`courses`, `prerequisites`, `schedule_configurations`, etc.), usamos introspección para que Prisma "lea" esa estructura y arme `schema.prisma` automáticamente:

```bash
npx prisma db pull
```

> ⚠️ No es necesario correr `prisma migrate dev` después de esto — las tablas ya existen. Ver la nota al final del documento.

### 8. Generar el cliente de Prisma

```bash
npx prisma generate
```

Esto genera las funciones tipadas (`prisma.course.findMany()`, `prisma.course.create()`, etc.) que se usan en los controladores.

---

## ▶️ Correr el proyecto

```bash
npm run dev
```

Deberías ver:

```
Servidor GIHA corriendo en http://localhost:3000
```

---

## 📄 Scripts disponibles (`package.json`)

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon --exec \"node --env-file=.env --import tsx\" src/index.ts"
  }
}
```

- **`type: module`** → el proyecto usa ESM (`import`/`export`), no CommonJS.
- **`--env-file=.env`** → carga las variables de entorno de forma nativa (no se necesita el paquete `dotenv`).
- **`--import tsx`** → permite ejecutar archivos `.ts` directamente, sin compilarlos antes.
- **`nodemon`** → reinicia el servidor automáticamente cada vez que guardas un cambio.

---

## 🗂️ Estructura del proyecto

```
giha-backend/
├── prisma/
│   └── schema.prisma       # modelo de datos (generado por introspección)
├── src/
│   ├── controllers/        # lógica de cada endpoint
│   ├── routes/              # definición de rutas
│   ├── utils/                # funciones auxiliares (ej: conversión de horas)
│   ├── db.ts                 # cliente de Prisma
│   └── index.ts              # punto de entrada del servidor
├── .env                     # variables de entorno (NO subir a git)
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## 📌 Nota: introspección vs. migraciones

Este proyecto usa **introspección** (`prisma db pull`) porque la base de datos ya existía antes de usar Prisma.

Si en el futuro quieres agregar una tabla o columna **nueva** y que Prisma la cree por ti, ahí sí usarías migraciones:

```bash
npx prisma migrate dev --name nombre_del_cambio
```

Pero no mezcles ambos flujos sobre las mismas tablas — o Prisma intentará crear algo que ya existe y va a fallar.
