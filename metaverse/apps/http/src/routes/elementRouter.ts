import { Router } from "express";
import {client} from "@repo/db";
export const elementRouter = Router();

elementRouter.get("/", async (req, res) => {
    // const elements = await client.element.findMany();
    // res.json(elements);
});