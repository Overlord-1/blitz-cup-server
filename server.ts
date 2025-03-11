import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);

app.get('/',(_req,res) =>{
    res.send('<h1> Hello World </h1>');    
})

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});




