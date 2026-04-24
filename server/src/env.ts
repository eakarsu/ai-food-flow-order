import dotenv from 'dotenv';
import path from 'path';

// Load environment variables - project root .env
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });
dotenv.config();
