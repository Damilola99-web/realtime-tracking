import { Server, Socket } from "socket.io";
import { CustomSocket } from "../interface";
import authenticateSocket from "../middleware";
import { Position } from "../models/position.model";


const setupWebSocket = (io: Server) => {
    io.use(authenticateSocket).on("connection", (socket: CustomSocket) => {
        console.log("User connected");

        socket.on("position", async (data) => {
            const latitude = data.location.coordinates[1];
            const longitude = data.location.coordinates[0];
            const userId = socket.userId;

            try {
                const checkPosition = await Position.findOne({ location: { type: "Point", coordinates: [longitude, latitude] } });
                if (checkPosition) {
                    console.log("Position already exists");
                    return socket.emit("position already exists", { userId, latitude, longitude });
                }

                const position = new Position({ userId, location: { type: "Point", coordinates: [longitude, latitude] } });
                await position.save();
                // emit to all clients from the server
                io.emit("log", { userId, latitude, longitude });
            } catch (err) {
                console.error("Error saving position:", err);
                socket.emit("error saving position", { userId, latitude, longitude });
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });
};

export default setupWebSocket;
