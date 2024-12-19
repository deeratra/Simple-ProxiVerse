import express from 'express';
import { authRouter } from './routes/authRouter';
import { elementRouter } from './routes/elementRouter';
import { roomRouter } from './routes/roomRouter';
import { userRouter } from './routes/userRouter';

const app = express();

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/room", roomRouter);
app.use("/api/v1/element", elementRouter);


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});