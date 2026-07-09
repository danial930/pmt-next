// tests/unit/auth.service.test.ts
import { AuthService } from "@/modules/auth/auth.service";
import { AuthRepository } from "@/modules/auth/auth.repository";
import { AuditService } from "@/modules/audit/audit.service";
import { hashPassword } from "@/core/security/hash.util";
import { ApiError } from "@/core/response/api-error";

jest.mock("@/modules/auth/auth.repository");
jest.mock("@/modules/audit/audit.service");

describe("AuthService.login", () => {
  let service: AuthService;
  let repo: jest.Mocked<AuthRepository>;

  beforeEach(() => {
    repo = new AuthRepository() as jest.Mocked<AuthRepository>;
    service = new AuthService(repo, new AuditService() as any);
  });

  it("throws unauthorized for non-existent user", async () => {
    repo.findUserByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: "nouser@test.com", password: "pass" }, {}),
    ).rejects.toThrow(ApiError);
  });

  it("throws unauthorized for incorrect password", async () => {
    const hashed = await hashPassword("CorrectPass1!");
    repo.findUserByEmail.mockResolvedValue({
      id: "1",
      email: "user@test.com",
      password: hashed,
      isActive: true,
      failedLoginCount: 0,
      lockedUntil: null,
      userRoles: [],
    } as any);

    await expect(
      service.login({ email: "user@test.com", password: "WrongPass" }, {}),
    ).rejects.toThrow("Invalid email or password");
  });

  it("locks account after max failed attempts", async () => {
    const hashed = await hashPassword("CorrectPass1!");
    repo.findUserByEmail.mockResolvedValue({
      id: "1",
      email: "user@test.com",
      password: hashed,
      isActive: true,
      failedLoginCount: 4,
      lockedUntil: null,
      userRoles: [],
    } as any);

    await expect(
      service.login({ email: "user@test.com", password: "Wrong" }, {}),
    ).rejects.toThrow("Invalid email or password");

    expect(repo.incrementFailedLogin).toHaveBeenCalledWith(
      "1",
      expect.any(Date),
    );
  });

  it("returns tokens for valid credentials", async () => {
    const hashed = await hashPassword("CorrectPass1!");
    repo.findUserByEmail.mockResolvedValue({
      id: "1",
      email: "user@test.com",
      password: hashed,
      firstName: "John",
      lastName: "Doe",
      isEmailVerified: true,
      isActive: true,
      failedLoginCount: 0,
      lockedUntil: null,
      createdAt: new Date(),
      userRoles: [],
    } as any);

    const result = await service.login(
      { email: "user@test.com", password: "CorrectPass1!" },
      {},
    );

    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
    expect(result.tokens.expiresIn).toBe(900);
  });
});
