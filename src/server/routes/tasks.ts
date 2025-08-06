import { Router } from 'express';
import { MongoClient } from 'mongodb';
import { PriorityLevel } from '../../app/models/task.model';

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: PriorityLevel; // 1=High, 2=Medium, 3=Low
  categorie_id: number;
  newCategorie?: string; // Optional for new categories
  created_at: string;
  updated_at: string;
}

const router = Router();
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);


router.get('/', async (req, res) => {
  try {
    await client.connect();
    const tasks = await client.db('mydb').collection('tasks').find().toArray();
    res.json(tasks);
  } finally {
    await client.close();
  }




// Mock database - replace with real DB in production
let tasks: Task[] = [
  { id: 1, title: 'Learn Angular', completed: true },
  { id: 2, title: 'Build API', completed: true }
];

// GET all tasks
router.get('/', (req, res) => {
  res.json(tasks);
});

// GET single task
router.get('/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

// POST new task
router.post('/', (req, res) => {
  const newTask: Task = {
    id: tasks.length + 1,
    title: req.body.title,
    completed: req.body.completed || false
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT update task
router.put('/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ message: 'Task not found' });

  task.title = req.body.title || task.title;
  task.completed = req.body.completed !== undefined ? req.body.completed : task.completed;
  
  res.json(task);
});

// DELETE task
router.delete('/:id', (req, res) => {
  tasks = tasks.filter(t => t.id !== parseInt(req.params.id));
  res.status(204).end();
});

export default router;
