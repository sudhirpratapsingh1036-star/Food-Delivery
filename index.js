import dotenv from 'dotenv';
import { app } from './src/app.js';
import { connectDB } from './src/db/index.js';;

dotenv.config({ path: './.env' });

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on port ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to DB', err);
        process.exit(1);
    });