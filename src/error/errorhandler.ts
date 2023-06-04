import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ApiResponse } from "./error";


export const NotFound = (req: Request, res: Response, next: NextFunction) => {
    next(new ApiResponse(404, 'Not found', 'Route does not exist'));
}

export const ErrorHandler: ErrorRequestHandler = (err:Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiResponse) {
        res.status(err.status).send({ status: err.status, error: err.error, message: err.message });
    } else {
        res.status(500).send({ error: 'Internal server error' });
    }
};