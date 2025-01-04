import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/authRouter';
import { elementRouter } from './routes/elementRouter';
import { roomRouter } from './routes/roomRouter';
import { userRouter } from './routes/userRouter';
import { mapsRouter } from './routes/mapsRouter';

const app = express();
app.use(express.json());
app.use(
  cors()
);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/room', roomRouter);
app.use('/api/v1/element', elementRouter);
app.use('/api/v1/maps', mapsRouter);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

