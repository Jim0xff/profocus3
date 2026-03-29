import type { Activity } from "../models/activity.js";
import type { Registration } from "../models/registration.js";

export function serializeActivity(activity: Activity) {
  return {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    start_time: activity.startTime.toISOString(),
    end_time: activity.endTime.toISOString(),
    status: activity.status,
    created_at: activity.createdAt.toISOString(),
    updated_at: activity.updatedAt.toISOString()
  };
}

export function serializeRegistration(registration: Registration) {
  return {
    id: registration.id,
    activity_id: registration.activityId,
    name: registration.name,
    email: registration.email,
    phone: registration.phone,
    school: registration.school,
    github: registration.github,
    review_status: registration.reviewStatus,
    reviewed_by: registration.reviewedBy,
    reviewed_at: registration.reviewedAt?.toISOString() ?? null,
    created_at: registration.createdAt.toISOString(),
    updated_at: registration.updatedAt.toISOString()
  };
}
