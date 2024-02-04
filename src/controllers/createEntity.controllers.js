import mongoose from "mongoose";
import { Entity } from "../models/createEntity.modal.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asynHandler } from "../utils/asynHandler.js";

const createEntity = asynHandler(async (req, res) => {
  const { name, description, entityType, amount } = req.body;

  if (!name || !description || !entityType || !amount) {
    throw new ApiResponse(400, "All fields are required");
  }

  const existingEntity = await Entity.findOne({ name });

  if (existingEntity) {
    return res.json(new ApiResponse(409, "Entity already exists"));
  }

  const entity = await Entity.create({
    name,
    description,
    entityType,
    amount,
    createdBy: req?.user?._id,
  });

  res.json(new ApiResponse(200, "Entity created successfully", entity));
});

const getEntity = asynHandler(async (req, res) => {
  try {
    let { page, pageSize, searchKey } = req.query;

    console.log(page, pageSize);
    if (!page) {
      page = 1;
    }
    if (!pageSize) {
      pageSize = 2;
    }

    const skip = (page - 1) * pageSize;
    const searchQuery = searchKey
      ? {
          $or: [
            { name: { $regex: new RegExp(searchKey, "i") } },
            { description: { $regex: new RegExp(searchKey, "i") } },
            { entityType: { $regex: new RegExp(searchKey, "i") } },
          ],
        }
      : {};

    const totalCount = await Entity.countDocuments(searchQuery);
    const allEntities = await Entity.find(searchQuery)
      .skip(skip)
      .limit(parseInt(pageSize))
      .populate("createdBy", "fullName username");

    if (!allEntities || allEntities.length === 0) {
      return res.json(new ApiResponse(404, "No entities found"));
    }

    res.json(
      new ApiResponse(
        200,
        "All entities fetched successfully",
        allEntities,
        totalCount
      )
    );
  } catch (error) {
    console.error(error);
    res.json(new ApiResponse(500, "Internal Server Error"));
  }
});

const updateEntity = asynHandler(async (req, res) => {
  const { name, description, entityType } = req.body;
  const { id } = req.params;

  if (!name && !description && !entityType) {
    throw new ApiResponse(400, "Please pass at least one field to update");
  }

  try {
    const updatedEntity = await Entity.findOneAndUpdate(
      { _id: id },
      { $set: { name, description, entityType } },
      { new: true }
    );

    if (!updatedEntity) {
      return res.json(new ApiResponse(404, "Entity not found"));
    }

    res.json(
      new ApiResponse(200, "Entity updated successfully", updatedEntity)
    );
  } catch (error) {
    console.error(error);
    res.json(new ApiResponse(500, "Internal Server Error"));
  }
});

const deleteEntity = asynHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ApiResponse(400, "Invalid Entity id");
    }

    const entity = await Entity.findByIdAndDelete(id);

    if (!entity) {
      throw res.json(new ApiResponse(404, "Entity not found"));
    }

    res.json(new ApiResponse(200, "Entity deleted successfully"));
  } catch (error) {
    console.error(error);

    res.json(new ApiResponse(500, "Internal Server Error"));
  }
});

const entityDetail = asynHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findOne({
    _id: new mongoose.Types.ObjectId(id),
  }).select("-password -refreshToken -__v");

  console.log(user);
  if (!user) {
    throw res.json(new ApiResponse(404, "Details not found"));
  }
  res.json(new ApiResponse(200, "Entity detail fetched successfully", user));
});

export { createEntity, getEntity, updateEntity, deleteEntity, entityDetail };
