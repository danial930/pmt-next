// prisma/seed.ts
import bcrypt from "bcryptjs";
import { ROLES } from "../src/constants/roles.constants";
import { PERMISSIONS } from "../src/constants/permissions.constants";
// import { PrismaClient } from "@prisma/client/extension";
import { PrismaClient } from "./generated/client";

// const prisma = new PrismaClient();

// Import the driver adapter for your specific database (example uses PostgreSQL)
import { PrismaPg } from "@prisma/adapter-pg";
// Initialize the adapter according to your driver's requirements
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
// Pass the adapter instance to PrismaClient
const prisma = new PrismaClient({ adapter });

async function main() {
  // Permissions
  const permissionRecords = await Promise.all(
    Object.values(PERMISSIONS).map((name) => {
      const [module, action] = name.split(":");
      return prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name, module, action },
      });
    }),
  );

  // Roles
  const superAdmin = await prisma.role.upsert({
    where: { name: ROLES.SUPER_ADMIN },
    update: {},
    create: { name: ROLES.SUPER_ADMIN, description: "Full system access" },
  });

  const user = await prisma.role.upsert({
    where: { name: ROLES.USER },
    update: {},
    create: { name: ROLES.USER, description: "Standard user" },
  });

  // Assign ALL permissions to SUPER_ADMIN
  for (const perm of permissionRecords) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: superAdmin.id, permissionId: perm.id },
      },
      update: {},
      create: { roleId: superAdmin.id, permissionId: perm.id },
    });
  }

  // USER gets only read permissions for self-management
  const userPerms = permissionRecords.filter(
    (p) => p.name === PERMISSIONS.USER_READ,
  );
  for (const perm of userPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: user.id, permissionId: perm.id },
      },
      update: {},
      create: { roleId: user.id, permissionId: perm.id },
    });
  }

  // Seed super admin user
  const passwordHash = await bcrypt.hash("SuperAdmin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@ums.com" },
    update: {},
    create: {
      email: "admin@ums.com",
      password: passwordHash,
      firstName: "Super",
      lastName: "Admin",
      isEmailVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: superAdmin.id } },
    update: {},
    create: { userId: admin.id, roleId: superAdmin.id },
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
