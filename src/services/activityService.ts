import { getActivityRepository } from "../infra/datasource.js";
import { BadRequestError } from "../infra/HttpError.js";

export type CreateActivityInput = {
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  status?: string;
};

export async function listActivities(status?: string) {
  const repo = getActivityRepository();
  const where = status ? { status } : {};
  return repo.find({
    where,
    order: {
      startTime: "ASC",
      id: "ASC"
    }
  });
}

export async function createActivity(input: CreateActivityInput) {
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
