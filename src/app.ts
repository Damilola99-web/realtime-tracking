import express, { Request, Response, NextFunction } from "express";
import { Server } from "socket.io";
import connectDB from "./database";
import userRoutes from "./routes/user.routes";
import setupWebSocket from "./routes/position.routes";



const app = express();
const httpServer = require("http").createServer(app);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use(userRoutes);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

setupWebSocket(io);


// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!" + err.message);
});

// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
