import mongoose from 'mongoose';

const connectDB = async () => {

    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL);

        console.log(`DATABASE connected to ${conn.connection.host}`);

    } catch (error) {
        
        console.log('Failed to connect to DATABASE', error);
        process.exit(1);
    }

}

export default connectDB;