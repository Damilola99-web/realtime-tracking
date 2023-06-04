import { NextFunction } from "express";
import { CustomSocket } from "../interface";
import jwt from "jsonwebtoken";



// Middleware to verify authentication
const authenticateSocket = (socket: CustomSocket, next: NextFunction): void => {
    const token = socket.handshake.headers.authorization?.split(" ")[1];
    if (!token) {
        return next(new Error("Authentication failed - 🔒🔒🔒🔒🔒"));
    }
    try {
        const payload: any = jwt.verify(token, "secret");
        console.log("Payload:", payload);
        socket.userId = payload.userId;
        next();
    } catch (err) {
        next(new Error("Authentication failed 🔥🔥🔥🔥" + err));
    }
};


export default authenticateSocket;