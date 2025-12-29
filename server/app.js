import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';


dotenv.config();


const app =express();

app.use(express.json());
app.use(cookieParser());
// app.use('/images', express.static('uploads'));




// app.all('*',(req,res,next)=>{
//     return res.status(404).json({success:httpStatusText.FAIL,message:'Page not found'});
// });

//global error handler 
app.use((error,req,res,next)=>{
    res.status(error.statusCode || 500).json({
        status:error.httpStatusText ||'error',
        message:error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
})

const port=process.env.PORT
app.listen(port,()=>{
    console.log(`run on port ${port}`);
    
})