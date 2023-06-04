import express, { Request, Response, NextFunction } from "express";
import { Server } from "socket.io";
import connectDB from "./database";
import userRoutes from "./routes/user.routes";
import setupWebSocket from "./routes/position.routes";
import { MessageResponse } from "./interface";
import { ErrorHandler, NotFound } from "./error/errorhandler";

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

app.get<{}, MessageResponse>("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Hello world!"
  });
});


app.use(NotFound);
app.use(ErrorHandler);

// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
