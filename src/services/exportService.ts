import { getActivityRepository, getRegistrationRepository } from "../infra/datasource.js";
import { NotFoundError } from "../infra/HttpError.js";

const columns = [
  "name",
  "email",
  "phone",
  "school",
  "github",
  "review_status",
  "created_at"
];

export async function exportRegistrationsCsv(activityId: number) {
  const activityRepo = getActivityRepository();
  const activity = await activityRepo.findOne({ where: { id: activityId } });
  if (!activity) {
    throw new NotFoundError("Activity not found");
  }

  const repo = getRegistrationRepository();
  const registrations = await repo.find({
    where: { activityId },
    order: { createdAt: "ASC", id: "ASC" }
  });

  const lines = [
    columns.join(","),
    ...registrations.map((registration) =>
      [
        registration.name,
        registration.email,
        registration.phone,
        registration.school,
        registration.github,
        registration.reviewStatus,
        registration.createdAt.toISOString()
      ]
        .map(escapeCsvField)
        .join(",")
    )
  ];

  return {
    filename: `activity_${activityId}_registrations.csv`,
    content: lines.join("\n")
  };
}

function escapeCsvField(value: string) {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }
  return value;
}
