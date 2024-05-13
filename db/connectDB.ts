import mongoose from 'mongoose';

const connectDB = async () => {
    
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL || '');
        console.log(`Database connected to ${conn.connection.host}`);

    } catch (error) {
        console.log('Database connection failed');
    }
}

export default connectDB;