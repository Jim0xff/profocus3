import { getRegistrationRepository } from "../infra/datasource.js";
import { BadRequestError, ConflictError, NotFoundError } from "../infra/HttpError.js";

export async function reviewRegistration(
  registrationId: number,
  action: string,
  adminUserId: number
) {
  if (!Number.isInteger(registrationId) || registrationId <= 0) {
    throw new BadRequestError("registration id must be a positive integer");
  }
  if (!["approve", "reject"].includes(action)) {
    throw new BadRequestError("action must be approve or reject");
  }

  const repo = getRegistrationRepository();
  const registration = await repo.findOne({ where: { id: registrationId } });
  if (!registration) {
    throw new NotFoundError("Registration not found");
  }
  if (registration.reviewStatus !== "pending") {
    throw new ConflictError(
      "CONFLICT_INVALID_REVIEW_STATE",
      "Only pending registrations can be reviewed"
    );
  }

  registration.reviewStatus = action === "approve" ? "approved" : "rejected";
  registration.reviewedBy = adminUserId;
  registration.reviewedAt = new Date();

  return repo.save(registration);
}
