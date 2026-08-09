import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.routes';
import { MysqlStorageService } from './services/mysql-storage.service';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

async function startServer() {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 JS DSA Backend Server running on port ${PORT}`);
    console.log(`=================================================`);
  });

  try {
    await MysqlStorageService.initDatabase();
    console.log(`✅ [Database] Initialized and connected to MySQL successfully.`);
  } catch (err: any) {
    console.error(`❌ [Database Error] Could not connect to MySQL at ${process.env['DB_HOST'] || 'localhost'}:${process.env['DB_PORT'] || 3306}: ${err.message}`);
    console.error(`💡 Tip: Make sure DB_HOST, DB_USER, DB_PASS, and DB_NAME environment variables are set in your cloud dashboard.`);
  }
}

if (process.env.NODE_ENV !== 'production' || require.main === module) {
  startServer();
}

export default app;
