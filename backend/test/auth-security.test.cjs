const { test } = require("node:test");
const assert = require("node:assert/strict");
const { AuthService } = require("../dist/modules/auth/auth.service");

test("published demo credentials cannot authenticate without a persisted account", async () => {
  const service = new AuthService(
    { user: { findUnique: async () => null } },
    {},
    {},
  );
  assert.equal(
    await service.validateUser("clubmanager@gmail.com", "equi123"),
    null,
  );
});

test("horse owner list query must be scoped to their identity", async () => {
  const { HorsesService } = require("../dist/modules/horses/horses.service");
  let query;
  const service = new HorsesService({
    horse: {
      findMany: async (args) => {
        query = args;
        return [];
      },
    },
  });
  await service.findAll({ id: "owner-a", role: "HORSE_OWNER" });
  assert.deepEqual(query.where, { ownerId: "owner-a" });
});
