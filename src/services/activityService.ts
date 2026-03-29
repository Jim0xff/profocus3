import { getActivityRepository } from "../infra/datasource.js";
import { BadRequestError } from "../infra/HttpError.js";

export type CreateActivityInput = {
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  status?: string;
};

export type ListActivitiesInput = {
  status?: string;
  page: number;
  page_size: number;
};

export async function listActivities(input: ListActivitiesInput) {
  const repo = getActivityRepository();
  const where = input.status ? { status: input.status } : {};
  const [items, total] = await repo.findAndCount({
    where,
    order: {
      startTime: "ASC",
      id: "ASC"
    },
    skip: (input.page - 1) * input.page_size,
    take: input.page_size
  });

  return {
    items,
    page: input.page,
    page_size: input.page_size,
    total
  };
}

export async function createActivity(input: CreateActivityInput) {
  if (!isPlainObject(input)) {
    throw new BadRequestError("request body must be a JSON object");
  }

  if (!input.title?.trim()) {
    throw new BadRequestError("title is required");
  }

  const startTime = new Date(input.start_time);
  const endTime = new Date(input.end_time);
  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    throw new BadRequestError("start_time and end_time must be valid ISO timestamps");
  }
  if (startTime >= endTime) {
    throw new BadRequestError("start_time must be earlier than end_time");
  }

  const repo = getActivityRepository();
  const activity = repo.create({
    title: input.title.trim(),
    description: input.description?.trim() || null,
    startTime,
    endTime,
    status: input.status?.trim() || "draft"
  });

  return repo.save(activity);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
