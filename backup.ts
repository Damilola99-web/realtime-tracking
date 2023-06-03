import express from "express";
import mongoose, { Document, Model } from "mongoose";
import { Server, Socket } from "socket.io";

interface IPosition extends Document {
    userId: string;
    latitude: number;
    longitude: number;
}

const app = express();
const httpServer = require("http").createServer(app);
const io = new Server(httpServer);

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/real-time-tracking");
const db = mongoose.connection;
db.once("open", () => {
    console.log("Connected to MongoDB");
});



// Create a schema and model for the user position
const positionSchema = new mongoose.Schema<IPosition>({
    userId: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
});

const Position: Model<IPosition> = mongoose.model<IPosition>(
    "Position",
    positionSchema
);

// WebSocket connection
io.on("connection", (socket: Socket) => {
    console.log("User connected");

    // Receive position updates from the client
    socket.on("position", async (data) => {
        const { userId, latitude, longitude } = data;


        try {
            // check if position exists in database
            const isExist = await Position.findOne({
                latitude: latitude,
                longitude: longitude,
            });

            if (isExist) {
                console.log("Position already exists");
                return socket.emit("position", isExist);
            }


            // Save the position in the database
            const newPosition = new Position({ userId, latitude, longitude });
            await newPosition.save();
            console.log("Position saved:", newPosition);
        } catch (err) {
            console.error("Error saving position:", err);
        }
    });

    // Disconnect event
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// io error handling
io.on("error", (err) => {
    console.error(err);
});


// error handler
app.use(function (err: any, req: any, res: any, next: any) {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});


// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
