import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './db/connectDB';
import multer from 'multer';
import path from 'path';

import authRouter from './routes/user/auth.route';
import roleRouter from './routes/user/role.route';
import userRouter from './routes/user/user.route';
import productRouter from './routes/shop/product.route';
import adminRouter from './routes/admin/admin.route';
import commentRouter from './routes/shop/comment.route';
import errorHandler from './middlewares/errorHandler';
import { upload } from './utils/multer';

const app = express();
const PORT = process.env.PORT || 5500;
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser());
app.use(upload);

app.use('/api/auth', authRouter);
app.use('/api/role', roleRouter);
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/admin', adminRouter);
app.use('/api/comment', commentRouter);

app.use(errorHandler);

app.listen(PORT, () => console.log(`server is running on Port ${PORT}`));