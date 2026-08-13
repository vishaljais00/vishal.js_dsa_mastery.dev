import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.routes';
import { MysqlStorageService } from './services/mysql-storage.service';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let isDbInitialized = false;
let dbInitPromise: Promise<void> | null = null;

async function ensureDbInit() {
  if (isDbInitialized) return;
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      try {
        await MysqlStorageService.initDatabase();
        isDbInitialized = true;
        console.log(`✅ [Database] Initialized and connected to MySQL successfully.`);
      } catch (err: any) {
        console.error(`❌ [Database Error] Could not connect to MySQL: ${err.message}`);
        console.error(`💡 Tip: Make sure DATABASE_URL or DB_HOST, DB_USER, DB_PASS, and DB_NAME environment variables are set in your cloud dashboard.`);
      } finally {
        dbInitPromise = null;
      }
    })();
  }
  await dbInitPromise;
}

app.use(async (req, res, next) => {
  await ensureDbInit();
  next();
});

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

if (require.main === module || process.env.PORT) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 JS DSA Backend Server running on port ${PORT}`);
    console.log(`=================================================`);
  });
}

export default app;

