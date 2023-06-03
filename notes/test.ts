import express, { Request, Response, NextFunction } from "express";
import mongoose, { Document, Model } from "mongoose";
import { Server, Socket } from "socket.io";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


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

const app = express();
const httpServer = require("http").createServer(app);
const io = new Server(httpServer);

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/real-time-tracking");
const db = mongoose.connection;
db.once("open", () => {
    console.log("Connected to MongoDB");
});

// Create a schema and model for the user
const userSchema = new mongoose.Schema<IUser>({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(Role), // or use [Role.Admin, Role.SuperAdmin, Role.User],
        default: Role.User
    },
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

// Create a schema and model for the user position
const positionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ["Point"], // 'location.type' must be 'Point' e.g. [40.74, -74.0059] where first element is longitude and second is latitude
            required: true
        },
        coordinates: {
            type: [Number], // array of numbers [longitude, latitude]
            required: true
        },
    },
});

const Position: Model<IPosition> = mongoose.model<IPosition>(
    "Position",
    positionSchema
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, role } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, role });
        await user.save();
        res.status(201).json({ message: "User created" });
    } catch (err) {
        next(err);
    }
});

app.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign({ userId: user._id }, "secret");
        res.json({ token });
    } catch (err) {
        next(err);
    }
});

// Middleware to verify authentication
const authenticateSocket = (socket: CustomSocket, next: NextFunction) => {
    const token = socket.handshake.headers.authorization?.split(" ")[1];
    if (!token) {
        return next(new Error("Authentication failed"));
    }
    try {
        const payload: any = jwt.verify(token, "secret");
        console.log("Payload:", payload);
        socket.userId = payload.userId;
        next();
    } catch (err) {
        next(new Error("Authentication failed"));
    }
};

// WebSocket connection
io.use(authenticateSocket).on("connection", (socket: CustomSocket) => {
    console.log("User connected");

    // Receive position updates from the client
    socket.on("position", async (data) => {
        const latitude = data.location.coordinates[1];
        const longitude = data.location.coordinates[0];
        const userId = socket.userId;

        try {
            // check if the position is already saved in the database
            const checkPosition = await Position.findOne({ location: { type: "Point", coordinates: [longitude, latitude] } })
            if (checkPosition) {
                console.log("Position already exists");
                return socket.emit("position already exists", { userId, latitude, longitude });
            }

            const position = new Position({ userId, location: { type: "Point", coordinates: [longitude, latitude] } });
            await position.save();
            // Send the position to all connected clients
            io.emit("position", { userId, latitude, longitude });
        } catch (err) {
            console.error("Error saving position:", err);
        }
    });

    // Disconnect event
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

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
