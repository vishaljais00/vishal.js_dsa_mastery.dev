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
  try {
    await MysqlStorageService.initDatabase();
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 JS DSA MySQL Backend Server running on http://localhost:${PORT}`);
      console.log(`=================================================`);
    });
  } catch (err) {
    console.error('Failed to start backend server:', err);
    process.exit(1);
  }
}

startServer();
