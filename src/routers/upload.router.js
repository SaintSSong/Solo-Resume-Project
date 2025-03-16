import { FileController } from "../controllers/file.controller.js";

import express from "express";

const uploadRouter = express.Router();

const fileController = new FileController();

// /uploads/:filename 경로를 처리하는 라우트
uploadRouter.get("/:filename", fileController.getImage);

export { uploadRouter };
