import { Router } from "express";
import { listActivities } from "../services/activityService.js";
import { createRegistration } from "../services/registrationService.js";
import { BadRequestError } from "../infra/HttpError.js";
import { serializeActivity, serializeRegistration } from "../utils/serializers.js";

export const publicRouter = Router();

publicRouter.get("/activities", async (req, res, next) => {
  try {
    const query = parseListActivitiesQuery(req.query);
    const result = await listActivities(query);

    res.json({
      code: 0,
      message: "ok",
      data: {
        items: result.items.map(serializeActivity),
        page: result.page,
        page_size: result.page_size,
        total: result.total
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

function parseListActivitiesQuery(query: Record<string, unknown>) {
  return {
    status: parseOptionalStringQuery(query.status, "status"),
    page: parsePositiveIntegerQuery(query.page, "page", 1),
    page_size: parsePositiveIntegerQuery(query.page_size, "page_size", 20, 100)
  };
}

function parseOptionalStringQuery(value: unknown, field: string) {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function parsePositiveIntegerQuery(
  value: unknown,
  field: string,
  defaultValue: number,
  maxValue?: number
) {
  if (value === undefined) {
    return defaultValue;
  }
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new BadRequestError(`${field} must be a positive integer`);
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestError(`${field} must be a positive integer`);
  }
  if (maxValue !== undefined && parsed > maxValue) {
    throw new BadRequestError(`${field} must be less than or equal to ${maxValue}`);
  }

  return parsed;
}
