import { Router } from "express";
import {
  createEntity,
  deleteEntity,
  entityDetail,
  getEntity,
  updateEntity,
} from "../controllers/createEntity.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const entityRouter = Router();

entityRouter.route("/create-entity").post(verifyJWT, createEntity);
entityRouter.get("/get-entity", getEntity);
entityRouter.patch("/update-entity/:id", updateEntity);
entityRouter.delete("/delete-entity/:id", deleteEntity);
entityRouter.get("/details/:id", entityDetail);

export default entityRouter;
