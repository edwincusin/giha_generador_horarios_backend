import express from 'express';
import routerCourses from './routes/courses.router.js';
import routerPrerequisites from './routes/prerequisites.router.js';
import routerScheduleConfigurations from './routes/scheduleConfigurations.router.js';
import routerSchedules from './routes/schedule.ruter.js'


import cors from 'cors';

const app=express();
const PORT=process.env.PORT;

app.use(cors());
app.use(express.json());
app.use("/api",routerCourses);
app.use("/api",routerPrerequisites);
app.use("/api", routerScheduleConfigurations);
app.use("/api", routerSchedules);


app.listen(PORT,()=>{
    console.log(`Ejecutando servidor DE GIHA en http://localhost:${PORT}`);
})