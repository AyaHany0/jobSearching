import express from "express";
import dotenv from "dotenv";
import { bootstrap } from "./src/app.controller.js";

const app = express();
const port = process.env.PORT;
dotenv.config();
bootstrap(app, express);
app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(` listening on port ${port}!`));
