import { Router } from "express";
import { subscribed } from "../controllers/subscription.controller.js";

const subscribedRouter = Router();

subscribedRouter.post("/subscribes", subscribed);

export default subscribedRouter;
