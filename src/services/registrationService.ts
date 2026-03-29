import { QueryFailedError } from "typeorm";
import { getActivityRepository, getRegistrationRepository } from "../infra/datasource.js";
import { BadRequestError, ConflictError, NotFoundError } from "../infra/HttpError.js";

export type CreateRegistrationInput = {
  activity_id: number;
  name: string;
  email: string;
  phone: string;
  school: string;
  github: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createRegistration(input: CreateRegistrationInput) {
  validateRegistrationInput(input);

  const activityRepo = getActivityRepository();
  const activity = await activityRepo.findOne({ where: { id: input.activity_id } });
  if (!activity) {
    throw new NotFoundError("Activity not found");
  }

  const repo = getRegistrationRepository();
  const registration = repo.create({
    activityId: input.activity_id,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    school: input.school.trim(),
    github: input.github.trim(),
    reviewStatus: "pending",
    reviewedBy: null,
    reviewedAt: null
  });

  try {
    return await repo.save(registration);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new ConflictError(
        "CONFLICT_DUPLICATE_REGISTRATION",
        "Registration already exists for this activity and email"
      );
    }
    throw error;
  }
}

function validateRegistrationInput(input: CreateRegistrationInput) {
  if (!Number.isInteger(input.activity_id) || input.activity_id <= 0) {
    throw new BadRequestError("activity_id must be a positive integer");
  }

  for (const [field, value] of Object.entries(input)) {
    if (field === "activity_id") {
      continue;
    }
    if (typeof value !== "string" || !value.trim()) {
      throw new BadRequestError(`${field} is required`);
    }
  }

  if (!emailRegex.test(input.email.trim())) {
    throw new BadRequestError("email must be valid");
  }
}

function isUniqueConstraintError(error: unknown) {
  if (error instanceof QueryFailedError) {
    return String((error as QueryFailedError & { driverError?: { message?: string } }).driverError?.message ?? "").includes(
      "UNIQUE constraint failed"
    );
  }
  return false;
}
