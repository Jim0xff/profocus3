import { Router } from "express";
import { BadRequestError } from "../infra/HttpError.js";
import { requireAdminAuth } from "../infra/authMiddleware.js";
import { createActivity } from "../services/activityService.js";
import { exportRegistrationsCsv } from "../services/exportService.js";
import { reviewRegistration } from "../services/reviewService.js";
import { serializeActivity, serializeRegistration } from "../utils/serializers.js";

export const adminRouter = Router();

adminRouter.use(requireAdminAuth);

adminRouter.post("/activities", async (req, res, next) => {
  try {
    const activity = await createActivity(req.body);
    res.status(201).json({
      code: 0,
      message: "ok",
      data: serializeActivity(activity)
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/registrations/:id/review", async (req, res, next) => {
  try {
    const reviewed = await reviewRegistration(
      parsePositiveIntegerPathParam(req.params.id, "id"),
      req.body?.action,
      req.adminUser!.id
    );
    res.json({
      code: 0,
      message: "ok",
      data: serializeRegistration(reviewed)
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/activities/:activityId/registrations/export.csv", async (req, res, next) => {
  try {
    const result = await exportRegistrationsCsv(
      parsePositiveIntegerPathParam(req.params.activityId, "activityId")
    );
    res
      .set("Content-Type", "text/csv; charset=utf-8")
      .set("Content-Disposition", `attachment; filename="${result.filename}"`)
      .status(200)
      .send(result.content);
  } catch (error) {
    next(error);
  }
});

function parsePositiveIntegerPathParam(value: string, field: string) {
  if (!/^\d+$/.test(value)) {
    throw new BadRequestError(`${field} must be a positive integer`);
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestError(`${field} must be a positive integer`);
  }

  return parsed;
}
