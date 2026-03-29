import { Router } from "express";
import { listActivities } from "../services/activityService.js";
import { createRegistration } from "../services/registrationService.js";
import { serializeActivity, serializeRegistration } from "../utils/serializers.js";

export const publicRouter = Router();

publicRouter.get("/activities", async (req, res, next) => {
  try {
    const items = await listActivities(
      typeof req.query.status === "string" ? req.query.status : undefined
    );

    res.json({
      code: 0,
      message: "ok",
      data: {
        items: items.map(serializeActivity),
        total: items.length
      }
    });
  } catch (error) {
    next(error);
  }
});

publicRouter.post("/registrations", async (req, res, next) => {
  try {
    const registration = await createRegistration(req.body);
    res.status(201).json({
      code: 0,
      message: "ok",
      data: serializeRegistration(registration)
    });
  } catch (error) {
    next(error);
  }
});
