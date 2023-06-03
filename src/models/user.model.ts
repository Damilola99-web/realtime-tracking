import mongoose, { Model } from "mongoose";
import { IUser, Role } from "../interface";

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

export { User, Role };