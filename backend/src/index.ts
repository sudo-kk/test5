import cors from 'cors';
// ...existing code...

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://your-frontend-domain.com'
    : 'http://localhost:3000',
  credentials: true,
}));

process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal. Performing graceful shutdown...');
  // Add any cleanup code here
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Add any error handling code here
});

// ...existing code...
