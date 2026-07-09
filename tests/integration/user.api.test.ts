// tests/integration/user.api.test.ts

import { prisma } from "@/lib/prisma";
import { UserService } from "@/modules/user/user.service";

describe("User API Integration", () => {
  let service: UserService;
  let createdUserId: string;

  beforeAll(() => {
    service = new UserService();
  });

  afterAll(async () => {
    if (createdUserId) {
      await prisma.user
        .delete({ where: { id: createdUserId } })
        .catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("creates a new user", async () => {
    const result = await service.create(
      {
        email: `test-${Date.now()}@example.com`,
        password: "TestPass1!",
        firstName: "Test",
        lastName: "User",
      },
      "system",
    );

    createdUserId = result.id;
    expect(result.email).toContain("test-");
    expect(result.isActive).toBe(true);
  });

  it("rejects duplicate email", async () => {
    const user = await prisma.user.findUnique({ where: { id: createdUserId } });

    await expect(
      service.create(
        {
          email: user!.email,
          password: "TestPass1!",
          firstName: "Dup",
          lastName: "User",
        },
        "system",
      ),
    ).rejects.toThrow("Email already in use");
  });

  it("lists users with pagination", async () => {
    const result = await service.list(
      {
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        search: undefined,
      } as any,
      "system",
    );

    expect(result.meta.page).toBe(1);
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("soft deletes a user", async () => {
    await service.delete(createdUserId, "other-user-id");
    const deleted = await prisma.user.findUnique({
      where: { id: createdUserId },
    });
    expect(deleted?.isActive).toBe(false);
  });
});
