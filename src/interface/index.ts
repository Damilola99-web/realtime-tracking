import { Document } from "mongoose";
import { Socket } from "socket.io";

enum Role {
    Admin = "admin",
    SuperAdmin = "superadmin",
    User = "user",
}

interface IUser extends Document {
    email: string;
    password: string;
    role?: Role;
}

interface IPosition extends Document {
    userId: string;
    location: {
        type: string;
        coordinates: [number, number];
    };
}

interface CustomSocket extends Socket {
    userId: string;
    token: string;
}

interface MessageResponse {
    message: string;
    data?: any;
}

export { IUser, IPosition, CustomSocket, Role, MessageResponse };