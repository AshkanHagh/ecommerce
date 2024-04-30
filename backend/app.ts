import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './db/connectDB';
import {v2 as cloudinary} from 'cloudinary';

import authRouter from './routes/auth.route';
import roleRouter from './routes/role.route';
import userRouter from './routes/user.route';
import productRouter from './routes/product.route';

const app = express();
const PORT = process.env.PORT || 5500;
connectDB();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/role', roleRouter);
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);

app.listen(PORT, () => console.log(`server is running on Port ${PORT}`));