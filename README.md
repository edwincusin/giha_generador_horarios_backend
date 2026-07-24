
############################
# INICIAR EL PROYECTO
############################

npm init -y

############################
# DEPENDENCIAS PRINCIPALES
############################

# Framework web
npm install express

# Permitir CORS
npm install cors

# Encriptar claves
npm install bcrypt

# Manejar tokens
npm install jsonwebtoken

# Subir archivos
npm install multer

# PostgreSQL driver
npm install pg

# Prisma PostgreSQL
npm install @prisma/adapter-pg




############################
# DEPENDENCIAS DESARROLLO
############################
definiciones de tipos para TypeScript.
###########################

# TypeScript
npm install -D typescript

//# Ejecutar TS
//npm install -D ts-node

# Ejecutar TS (reemplaza a ts-node, compatible con Node moderno)
npm install -D tsx

# Tipos Express
npm install -D @types/express

# Tipos CORS
npm install -D @types/cors

# Tipos Bcrypt
npm install -D @types/bcrypt

# Tipos JWT
npm install -D @types/jsonwebtoken

# Tipos Multer
npm install -D @types/multer

# Tipos PG
npm install -D @types/pg

# Reinicio automático
npm install -D nodemon

# ORM Prisma
npm install -D prisma

al final
npm install @prisma/client

############################
# INICIALIZAR TYPESCRIPT
############################

# Crear tsconfig
npx tsc --init


############################
# INICIALIZAR PRISMA
############################

# Crear Prisma
npx prisma init

# realizan instrospeccion i ya tienes creado tablas en la bdd
npx prisma db pull


############################
# GENERAR CLIENTE PRISMA
############################

# Generar cliente
npx prisma generate


############################
# CREAR MIGRACION
############################

# Primera migración
npx prisma migrate dev --name init 


"scripts": {
    "dev": "nodemon --exec node --env-file=.env --loader ts-node/esm src/index.ts"

o

"dev": "nodemon --exec \"node --env-file=.env --import tsx\" src/index.ts"
  }, "type": "module",
