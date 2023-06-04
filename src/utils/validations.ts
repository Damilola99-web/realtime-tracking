import { object, string, TypeOf } from 'zod';

export const zodAuthRegisterSchema = object({
    body: object({
        email: string({
            required_error: "Email is required",
        }).email("Not a valid email"),
        password: string({
            required_error: "Password is required",
        }).min(6, "Password must be at least 6 characters"),
        role: string({
            required_error: "Role is required",
        }).refine((data) => data === "user" || data === "admin", {
            message: "Not a valid role",
        }),
    }),

});

export const zodAuthLoginSchema = object({
    body: object({
        email: string({
            required_error: "Email is required",
        }).email("Not a valid email"),
        password: string({
            required_error: "Password is required",
        }).min(6, "Password must be at least 6 characters"),
    }),
});

export type AuthLoginInput = TypeOf<typeof zodAuthLoginSchema>["body"];


export type AuthRegisterInput = TypeOf<typeof zodAuthRegisterSchema>["body"];

