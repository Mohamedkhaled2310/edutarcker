import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import sequelize from './config/db_config.js';
import { syncTables } from './config/db_config.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import studentRouter from './routes/studentRoutes.js';
import attendRoutes from './routes/atendanceRoutes.js';
import teachersRoutes from './routes/teachers.js';
import gradesRoutes from './routes/grades.js';
import communicationsRoutes from './routes/communications.js';
import subjectsRoutes from './routes/subjects.js';
import reportsRoutes from './routes/reports.js';
import cors from "cors";
  
dotenv.config();


const app =express();
app.use(cors({
  origin: "http://localhost:8081",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// app.use('/images', express.static('uploads'));
// app.all('*',(req,res,next)=>{
//     return res.status(404).json({success:httpStatusText.FAIL,message:'Page not found'});
// });

app.use('/api/auth',authRoutes);
app.use('/api/dashboard',dashboardRoutes);
app.use('/api/students', studentRouter);
app.use('/api/attendance',attendRoutes);
app.use('/api/teachers',teachersRoutes);
app.use('/api/grades',gradesRoutes);
app.use('/api/communications',communicationsRoutes);
app.use('/api/subjects',subjectsRoutes);
app.use('/api/reports',reportsRoutes);
//global error handler 
app.use((error,req,res,next)=>{
    res.status(error.statusCode || 500).json({
        status:error.httpStatusText ||'error',
        message:error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
})


const port=process.env.PORT

sequelize.authenticate()
  .then(async () => {
    console.log('Database connection established successfully.');
    await syncTables();
    console.log('Tables synchronized successfully.');
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });