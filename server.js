import express from "express";
import dotenv from "dotenv";
import allReposHandler from "./api/repos/all.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/repos/all", allReposHandler);

app.listen(PORT, () => {
    console.log(`Server jalan di http://localhost:${PORT}/api/repos/all`);
});