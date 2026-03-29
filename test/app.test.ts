import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";
import { destroyDatabase } from "../src/infra/datasource.js";

function makeBasicAuth(username: string, password: string) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

async function bootstrap() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "signup-backend-"));
  const dbPath = path.join(tempDir, "app.db");
  const app = await createApp(dbPath);

  return {
    app,
    cleanup: async () => {
      await destroyDatabase();
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  };
}

async function createActivity(app: Awaited<ReturnType<typeof bootstrap>>["app"], auth: string, overrides?: Record<string, unknown>) {
  const response = await request(app)
    .post("/api/v1/admin/activities")
    .set("Authorization", auth)
    .send({
      title: "Hack Event 2026",
      description: "Main event",
      start_time: "2026-04-01T09:00:00.000Z",
      end_time: "2026-04-03T18:00:00.000Z",
      status: "published",
      ...overrides
    })
    .expect(201);

  return response.body.data;
}

test("phase 1 flow: create activity, register, review, export csv", async () => {
  const { app, cleanup } = await bootstrap();
  const auth = makeBasicAuth("admin", "changeme123");

  try {
    const activity = await createActivity(app, auth);
    const activityId = activity.id;

    const listResponse = await request(app).get("/api/v1/activities").expect(200);
    assert.equal(listResponse.body.data.total, 1);
    assert.equal(listResponse.body.data.page, 1);
    assert.equal(listResponse.body.data.page_size, 20);
    assert.equal(listResponse.body.data.items[0].id, activityId);

    const registrationResponse = await request(app)
      .post("/api/v1/registrations")
      .send({
        activity_id: activityId,
        name: "Alice",
        email: "alice@example.com",
        phone: "+15550000001",
        school: "Example University",
        github: "alicehub"
      })
      .expect(201);

    assert.equal(registrationResponse.body.data.review_status, "pending");

    const duplicateResponse = await request(app)
      .post("/api/v1/registrations")
      .send({
        activity_id: activityId,
        name: "Alice",
        email: "alice@example.com",
        phone: "+15550000001",
        school: "Example University",
        github: "alicehub"
      })
      .expect(409);

    assert.equal(duplicateResponse.body.code, "CONFLICT_DUPLICATE_REGISTRATION");

    const reviewResponse = await request(app)
      .post(`/api/v1/admin/registrations/${registrationResponse.body.data.id}/review`)
      .set("Authorization", auth)
      .send({ action: "approve" })
      .expect(200);

    assert.equal(reviewResponse.body.data.review_status, "approved");
    assert.equal(reviewResponse.body.data.reviewed_by, 1);

    const invalidSecondReview = await request(app)
      .post(`/api/v1/admin/registrations/${registrationResponse.body.data.id}/review`)
      .set("Authorization", auth)
      .send({ action: "reject" })
      .expect(409);

    assert.equal(invalidSecondReview.body.code, "CONFLICT_INVALID_REVIEW_STATE");

    const exportResponse = await request(app)
      .get(`/api/v1/admin/activities/${activityId}/registrations/export.csv`)
      .set("Authorization", auth)
      .expect(200);

    assert.match(String(exportResponse.headers["content-type"]), /^text\/csv/);
    assert.match(exportResponse.text, /name,email,phone,school,github,review_status,created_at/);
    assert.match(exportResponse.text, /alice@example\.com/);
    assert.match(exportResponse.text, /approved/);
  } finally {
    await cleanup();
  }
});

test("admin routes require basic auth", async () => {
  const { app, cleanup } = await bootstrap();

  try {
    const response = await request(app).post("/api/v1/admin/activities").send({
      title: "Hack Event 2026",
      start_time: "2026-04-01T09:00:00.000Z",
      end_time: "2026-04-03T18:00:00.000Z"
    });

    assert.equal(response.status, 401);
    assert.equal(response.body.code, "UNAUTHORIZED");
  } finally {
    await cleanup();
  }
});

test("activities list validates invalid query params with BAD_REQUEST", async () => {
  const { app, cleanup } = await bootstrap();

  try {
    const response = await request(app).get("/api/v1/activities?page=0");

    assert.equal(response.status, 400);
    assert.equal(response.body.code, "BAD_REQUEST");
  } finally {
    await cleanup();
  }
});

test("activities list returns pagination metadata and filtered page results", async () => {
  const { app, cleanup } = await bootstrap();
  const auth = makeBasicAuth("admin", "changeme123");

  try {
    await createActivity(app, auth, {
      title: "Draft activity",
      start_time: "2026-03-31T09:00:00.000Z",
      end_time: "2026-03-31T12:00:00.000Z",
      status: "draft"
    });
    const publishedOne = await createActivity(app, auth, {
      title: "Published one",
      start_time: "2026-04-01T09:00:00.000Z",
      end_time: "2026-04-01T12:00:00.000Z",
      status: "published"
    });
    const publishedTwo = await createActivity(app, auth, {
      title: "Published two",
      start_time: "2026-04-02T09:00:00.000Z",
      end_time: "2026-04-02T12:00:00.000Z",
      status: "published"
    });

    const response = await request(app)
      .get("/api/v1/activities?status=published&page=2&page_size=1")
      .expect(200);

    assert.equal(response.body.data.page, 2);
    assert.equal(response.body.data.page_size, 1);
    assert.equal(response.body.data.total, 2);
    assert.equal(response.body.data.items.length, 1);
    assert.equal(response.body.data.items[0].id, publishedTwo.id);
    assert.notEqual(response.body.data.items[0].id, publishedOne.id);
  } finally {
    await cleanup();
  }
});

test("registration returns NOT_FOUND when activity does not exist", async () => {
  const { app, cleanup } = await bootstrap();

  try {
    const response = await request(app)
      .post("/api/v1/registrations")
      .send({
        activity_id: 9999,
        name: "Alice",
        email: "alice@example.com",
        phone: "+15550000001",
        school: "Example University",
        github: "alicehub"
      });

    assert.equal(response.status, 404);
    assert.equal(response.body.code, "NOT_FOUND");
  } finally {
    await cleanup();
  }
});

test("review returns BAD_REQUEST for invalid action", async () => {
  const { app, cleanup } = await bootstrap();
  const auth = makeBasicAuth("admin", "changeme123");

  try {
    const activity = await createActivity(app, auth);
    const registrationResponse = await request(app)
      .post("/api/v1/registrations")
      .send({
        activity_id: activity.id,
        name: "Alice",
        email: "alice@example.com",
        phone: "+15550000001",
        school: "Example University",
        github: "alicehub"
      })
      .expect(201);

    const response = await request(app)
      .post(`/api/v1/admin/registrations/${registrationResponse.body.data.id}/review`)
      .set("Authorization", auth)
      .send({ action: "maybe" });

    assert.equal(response.status, 400);
    assert.equal(response.body.code, "BAD_REQUEST");
  } finally {
    await cleanup();
  }
});

test("export returns NOT_FOUND when activity does not exist", async () => {
  const { app, cleanup } = await bootstrap();
  const auth = makeBasicAuth("admin", "changeme123");

  try {
    const response = await request(app)
      .get("/api/v1/admin/activities/9999/registrations/export.csv")
      .set("Authorization", auth);

    assert.equal(response.status, 404);
    assert.equal(response.body.code, "NOT_FOUND");
  } finally {
    await cleanup();
  }
});
