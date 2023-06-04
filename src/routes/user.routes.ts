import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from "express";
import { User } from "../models/user.model";
import {HttpResponse } from "../error/error";


const router = express.Router();


router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, role } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            throw HttpResponse.Conflict; 
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, role });
        await user.save();
        res.status(201).json({ message: "User created" });
    } catch (err) {
        next(err);
    }
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            throw HttpResponse.NotFound;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw HttpResponse.BadRequest;
        }
        const token = jwt.sign({ userId: user._id }, "secret");
        res.json({ token });
    } catch (err) {
        next(err);
    }
});

export default router;