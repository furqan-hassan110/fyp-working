import express from "express";
import {
  createSubTask,
  createTask,
  dashboardStatistics,
  deleteRestoreTask,
  duplicateTask,
  getTask,
  getTasks,
  postTaskActivity,
  trashTask,
  updateSubTaskStage,
  updateTask,
  updateTaskStage,
  upload_screenshot,
} from "../controllers/taskController.js";
import { isAdminRoute, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protectRoute, isAdminRoute, createTask);
router.post("/duplicate/:id", protectRoute, isAdminRoute, duplicateTask);
router.post("/activity/:id", protectRoute, postTaskActivity);


router.get("/dashboard", protectRoute, dashboardStatistics);
router.get("/", protectRoute, getTasks);
router.get("/:id", protectRoute, getTask);
// router.get(
//   "/screenshots/:taskId",
//   protectRoute, // Middleware for authentication
//   getTaskScreenshots
// );


router.put("/create-subtask/:id", protectRoute, isAdminRoute, createSubTask);
router.put("/update/:id", protectRoute, isAdminRoute, updateTask);
router.put("/change-stage/:id", protectRoute, updateTaskStage);
router.put(
  "/upload_screenshot/:taskId",
  protectRoute,
  express.raw({ type: "application/octet-stream", limit: "10mb" }), // Parse raw binary data
  upload_screenshot
);



router.put("/:id", protectRoute, isAdminRoute, trashTask);
router.put(
  "/upload_screenshot/:taskId",
  protectRoute,
  express.raw({ type: 'image/*', limit: '10mb' }),
  upload_screenshot
);

router.delete(
  "/delete-restore/:id?",
  protectRoute,
  isAdminRoute,
  deleteRestoreTask
);


export default router;
