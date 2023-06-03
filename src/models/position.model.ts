import mongoose, { Model, Document } from "mongoose";
import { IPosition } from "../interface";

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

export { Position };