export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  authUrl: 'http://localhost:8000/api/auth',
  tasksUrl: 'http://localhost:8000/api/tasks',
  categoriesUrl: 'http://localhost:8000/api/categories',
  usersUrl: 'http://localhost:8000/api/users',
  jwtSecret: process.env['JWT_SECRET'] || 'your-fallback-secret-key',
  mongoUri: 'mongodb://localhost:27017/mydb',
  mongoDbName: 'mydb',
  mongoCollection: 'tasks',
  serverPort: process.env['PORT'] || 4000,
  corsOptions: {
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',  
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  }
  
};
