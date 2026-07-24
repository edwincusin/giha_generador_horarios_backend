// Importa el módulo pg para crear y administrar conexiones PostgreSQL
import pg from "pg";

// Importa el adaptador que conecta Prisma con PostgreSQL
import { PrismaPg } from "@prisma/adapter-pg";

// Importa el cliente Prisma generado automáticamente desde el esquema
import { PrismaClient } from "../../generated/prisma/client.js";

// Crea un pool de conexiones reutilizables usando la URL del archivo .env
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Crea el adaptador que permitirá a Prisma usar el pool PostgreSQL
const adapter = new PrismaPg(pool);

// Instancia el cliente Prisma para realizar operaciones CRUD en la base de datos
const prisma = new PrismaClient({ adapter });

// Exporta la instancia para utilizarla en controladores y servicios
export default prisma;

