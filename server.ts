import { app } from './app';
import connectDB from './db/connectDB';
import {v2 as cloudinary} from 'cloudinary';

const PORT = process.env.PORT || 5500;

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(PORT, () => {
    console.log(`Server is connect with port ${PORT}`);
    connectDB()
});