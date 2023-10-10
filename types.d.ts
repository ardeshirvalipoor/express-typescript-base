declare namespace Express {
    export interface Request {
        userId?: string; // or whatever type userId should be
        email?: string;
    }
}