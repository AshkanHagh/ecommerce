import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './db/connectDB';

import authRouter from './routes/auth.route';
import roleRouter from './routes/role.route';

const app = express();
const PORT = process.env.PORT || 5500;
connectDB();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/role', roleRouter);

app.listen(PORT, () => console.log(`server is running on Port ${PORT}`));