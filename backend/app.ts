import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './db/connectDB';
import multer from 'multer';
import path from 'path';

import authRouter from './routes/auth.route';
import roleRouter from './routes/role.route';
import userRouter from './routes/user.route';
import productRouter from './routes/product.route';
import { upload } from './utils/multer';

const app = express();
const PORT = process.env.PORT || 5500;
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser());
// app.use(upload);

app.use('/api/auth', authRouter);
app.use('/api/role', roleRouter);
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);

app.listen(PORT, () => console.log(`server is running on Port ${PORT}`));