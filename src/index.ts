import express from 'express';

const app=express();
const PORT=process.env.PORT;

app.use(express.json());


app.listen(PORT,()=>{
    console.log(`Ejecutando servidor DE GIHA en http://localhost:${PORT}`);
})