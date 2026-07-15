import { PrismaClient } from "./generated/client";
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { env } from "@/config/env";

// ─── Inline Prisma client — seed runs outside Next.js ────────────────────────
// Cannot use @/lib/prisma because it has 'server-only' guard
// Cannot use @/config/env because it has browser guard
// Seed must be self-contained

const connectionString = env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// rest of seed file stays exactly the same...
async function main() {
  console.log('🌱 Seeding database...');
  console.log(`   Environment: ${process.env.NODE_ENV}`);

  await seedPermissions();
  await seedRoles();
  await seedRolePermissions();
  await seedMenus();
  await seedMenuPermissions();
  await seedSuperAdmin();

  if (process.env.NODE_ENV !== 'production') {
    await seedDevUsers();
  }

  console.log('✅ Seeding complete');
}

async function seedPermissions() {
  console.log('  → Seeding permissions...');

  await prisma.permission.createMany({
    data: [
      { name: 'user:create',       module: 'user',       action: 'create',  description: 'Create new users' },
      { name: 'user:read',         module: 'user',       action: 'read',    description: 'View user details' },
      { name: 'user:update',       module: 'user',       action: 'update',  description: 'Update user information' },
      { name: 'user:delete',       module: 'user',       action: 'delete',  description: 'Delete users' },
      { name: 'user:list',         module: 'user',       action: 'list',    description: 'List all users' },
      { name: 'role:create',       module: 'role',       action: 'create',  description: 'Create new roles' },
      { name: 'role:read',         module: 'role',       action: 'read',    description: 'View role details' },
      { name: 'role:update',       module: 'role',       action: 'update',  description: 'Update roles' },
      { name: 'role:delete',       module: 'role',       action: 'delete',  description: 'Delete roles' },
      { name: 'role:assign',       module: 'role',       action: 'assign',  description: 'Assign roles to users' },
      { name: 'permission:read',   module: 'permission', action: 'read',    description: 'View permissions' },
      { name: 'permission:assign', module: 'permission', action: 'assign',  description: 'Assign permissions to roles' },
      { name: 'audit:read',        module: 'audit',      action: 'read',    description: 'View audit logs' },
      { name: 'menu:create',       module: 'menu',       action: 'create',  description: 'Create menu items' },
      { name: 'menu:read',         module: 'menu',       action: 'read',    description: 'View menus' },
      { name: 'menu:update',       module: 'menu',       action: 'update',  description: 'Update menu items' },
      { name: 'menu:delete',       module: 'menu',       action: 'delete',  description: 'Delete menu items' },
      { name: 'menu:assign',       module: 'menu',       action: 'assign',  description: 'Assign menus to roles' },
    ],
    skipDuplicates: true,
  });

  console.log('     ✓ 18 permissions');
}

async function seedRoles() {
  console.log('  → Seeding roles...');

  await prisma.role.createMany({
    data: [
      { name: 'SUPER_ADMIN', description: 'Full unrestricted access to everything' },
      { name: 'ADMIN',       description: 'Administrative access — manage users and roles' },
      { name: 'MANAGER',     description: 'View and manage users within their scope' },
      { name: 'USER',        description: 'Standard authenticated user — least privilege' },
    ],
    skipDuplicates: true,
  });

  console.log('     ✓ 4 roles');
}

async function seedRolePermissions() {
  console.log('  → Seeding role permissions...');

  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({ select: { id: true, name: true } }),
    prisma.permission.findMany({ select: { id: true, name: true } }),
  ]);

  const roleMap = new Map(roles.map((r) => [r.name, r.id]));
  const permMap = new Map(permissions.map((p) => [p.name, p.id]));

  const r = (name: string) => {
    const id = roleMap.get(name);
    if (!id) throw new Error(`Role not found: ${name}`);
    return id;
  };

  const p = (name: string) => {
    const id = permMap.get(name);
    if (!id) throw new Error(`Permission not found: ${name}`);
    return id;
  };

  const mappings = [
    // SUPER_ADMIN — everything
    { roleId: r('SUPER_ADMIN'), permissionId: p('user:create')       },
    { roleId: r('SUPER_ADMIN'), permissionId: p('user:read')         },
    { roleId: r('SUPER_ADMIN'), permissionId: p('user:update')       },
    { roleId: r('SUPER_ADMIN'), permissionId: p('user:delete')       },
    { roleId: r('SUPER_ADMIN'), permissionId: p('user:list')         },
    { roleId: r('SUPER_ADMIN'), permissionId: p('role:create')       },
    { roleId: r('SUPER_ADMIN'), permissionId: p('role:read')         },
    { roleId: r('SUPER_ADMIN'), permissionId: p('role:update')       },
    { roleId: r('SUPER_ADMIN'), permissionId: p('role:delete')       },
    { roleId: r('SUPER_ADMIN'), permissionId: p('role:assign')       },
    { roleId: r('SUPER_ADMIN'), permissionId: p('permission:read')   },
    { roleId: r('SUPER_ADMIN'), permissionId: p('permission:assign') },
    { roleId: r('SUPER_ADMIN'), permissionId: p('audit:read')        },
    { roleId: r('SUPER_ADMIN'), permissionId: p('menu:create')       },
    { roleId: r('SUPER_ADMIN'), permissionId: p('menu:read')         },
    { roleId: r('SUPER_ADMIN'), permissionId: p('menu:update')       },
    { roleId: r('SUPER_ADMIN'), permissionId: p('menu:delete')       },
    { roleId: r('SUPER_ADMIN'), permissionId: p('menu:assign')       },

    // ADMIN — no role:delete, permission:assign, menu:delete
    { roleId: r('ADMIN'), permissionId: p('user:create')     },
    { roleId: r('ADMIN'), permissionId: p('user:read')       },
    { roleId: r('ADMIN'), permissionId: p('user:update')     },
    { roleId: r('ADMIN'), permissionId: p('user:delete')     },
    { roleId: r('ADMIN'), permissionId: p('user:list')       },
    { roleId: r('ADMIN'), permissionId: p('role:create')     },
    { roleId: r('ADMIN'), permissionId: p('role:read')       },
    { roleId: r('ADMIN'), permissionId: p('role:update')     },
    { roleId: r('ADMIN'), permissionId: p('role:assign')     },
    { roleId: r('ADMIN'), permissionId: p('permission:read') },
    { roleId: r('ADMIN'), permissionId: p('audit:read')      },
    { roleId: r('ADMIN'), permissionId: p('menu:create')     },
    { roleId: r('ADMIN'), permissionId: p('menu:read')       },
    { roleId: r('ADMIN'), permissionId: p('menu:update')     },
    { roleId: r('ADMIN'), permissionId: p('menu:assign')     },

    // MANAGER — view/edit users, read-only everything else
    { roleId: r('MANAGER'), permissionId: p('user:read')       },
    { roleId: r('MANAGER'), permissionId: p('user:update')     },
    { roleId: r('MANAGER'), permissionId: p('user:list')       },
    { roleId: r('MANAGER'), permissionId: p('role:read')       },
    { roleId: r('MANAGER'), permissionId: p('permission:read') },
    { roleId: r('MANAGER'), permissionId: p('menu:read')       },

    // USER — absolute minimum
    { roleId: r('USER'), permissionId: p('user:read') },
    { roleId: r('USER'), permissionId: p('menu:read') },
  ];

  await prisma.rolePermission.createMany({
    data: mappings,
    skipDuplicates: true,
  });

  console.log(`     ✓ ${mappings.length} role-permission mappings`);
}

async function seedMenus() {
  console.log('  → Seeding menus...');

  await prisma.menu.createMany({
    data: [
      { key: 'dashboard',       label: 'Dashboard',       icon: 'LayoutDashboard', path: '/dashboard', sortOrder: 0 },
      { key: 'user-management', label: 'User Management', icon: 'Users',           path: null,         sortOrder: 1 },
      { key: 'system',          label: 'System',          icon: 'Settings2',       path: null,         sortOrder: 2 },
      { key: 'reports',         label: 'Reports',         icon: 'BarChart2',       path: null,         sortOrder: 3 },
      { key: 'settings',        label: 'Settings',        icon: 'Settings',        path: null,         sortOrder: 4 },
    ],
    skipDuplicates: true,
  });

  const parents = await prisma.menu.findMany({
    where: { key: { in: ['user-management', 'system', 'reports', 'settings'] } },
    select: { id: true, key: true },
  });

  const parentMap = new Map(parents.map((m) => [m.key, m.id]));

  await prisma.menu.createMany({
    data: [
      // User Management
      { key: 'users-list',        label: 'All Users',        icon: 'Users',             path: '/dashboard/users',                parentId: parentMap.get('user-management'), sortOrder: 0 },
      { key: 'users-create',      label: 'Create User',      icon: 'UserPlus',          path: '/dashboard/users/create',         parentId: parentMap.get('user-management'), sortOrder: 1 },
      { key: 'users-roles',       label: 'Roles',            icon: 'Shield',            path: '/dashboard/roles',                parentId: parentMap.get('user-management'), sortOrder: 2 },
      { key: 'users-permissions', label: 'Permissions',      icon: 'Key',               path: '/dashboard/permissions',          parentId: parentMap.get('user-management'), sortOrder: 3 },
      // System
      { key: 'system-audit',      label: 'Audit Logs',       icon: 'ScrollText',        path: '/dashboard/audit',                parentId: parentMap.get('system'),          sortOrder: 0 },
      { key: 'system-menus',      label: 'Menu Manager',     icon: 'Menu',              path: '/dashboard/menus',                parentId: parentMap.get('system'),          sortOrder: 1, badgeText: 'Admin', badgeColor: 'red' },
      // Reports
      { key: 'reports-users',     label: 'User Report',      icon: 'FileText',          path: '/dashboard/reports/users',        parentId: parentMap.get('reports'),         sortOrder: 0 },
      { key: 'reports-activity',  label: 'Activity Report',  icon: 'Activity',          path: '/dashboard/reports/activity',     parentId: parentMap.get('reports'),         sortOrder: 1, badgeText: 'New', badgeColor: 'blue' },
      // Settings
      { key: 'settings-profile',  label: 'My Profile',       icon: 'User',              path: '/dashboard/settings/profile',     parentId: parentMap.get('settings'),        sortOrder: 0 },
      { key: 'settings-security', label: 'Security',         icon: 'Lock',              path: '/dashboard/settings/security',    parentId: parentMap.get('settings'),        sortOrder: 1 },
      { key: 'settings-prefs',    label: 'Preferences',      icon: 'SlidersHorizontal', path: '/dashboard/settings/preferences', parentId: parentMap.get('settings'),        sortOrder: 2 },
    ],
    skipDuplicates: true,
  });

  console.log('     ✓ 16 menu items');
}

async function seedMenuPermissions() {
  console.log('  → Seeding menu permissions...');

  const [menus, roles] = await Promise.all([
    prisma.menu.findMany({ select: { id: true, key: true } }),
    prisma.role.findMany({ select: { id: true, name: true } }),
  ]);

  const menuMap = new Map(menus.map((m) => [m.key, m.id]));
  const roleMap = new Map(roles.map((r) => [r.name, r.id]));

  const m = (key: string) => {
    const id = menuMap.get(key);
    if (!id) throw new Error(`Menu not found: ${key}`);
    return id;
  };

  const r = (name: string) => {
    const id = roleMap.get(name);
    if (!id) throw new Error(`Role not found: ${name}`);
    return id;
  };

  const ALL   = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER'] as const;
  const STAFF = ['SUPER_ADMIN', 'ADMIN', 'MANAGER']         as const;
  const ADMIN = ['SUPER_ADMIN', 'ADMIN']                    as const;

  const mappings = [
    ...ALL.map((role)   => ({ menuId: m('dashboard'),           roleId: r(role) })),
    ...STAFF.map((role) => ({ menuId: m('user-management'),     roleId: r(role) })),
    ...STAFF.map((role) => ({ menuId: m('users-list'),          roleId: r(role) })),
    ...STAFF.map((role) => ({ menuId: m('users-roles'),         roleId: r(role) })),
    ...ADMIN.map((role) => ({ menuId: m('users-create'),        roleId: r(role) })),
    ...ADMIN.map((role) => ({ menuId: m('users-permissions'),   roleId: r(role) })),
    ...ADMIN.map((role) => ({ menuId: m('system'),              roleId: r(role) })),
    ...ADMIN.map((role) => ({ menuId: m('system-audit'),        roleId: r(role) })),
    ...ADMIN.map((role) => ({ menuId: m('system-menus'),        roleId: r(role) })),
    ...STAFF.map((role) => ({ menuId: m('reports'),             roleId: r(role) })),
    ...STAFF.map((role) => ({ menuId: m('reports-users'),       roleId: r(role) })),
    ...STAFF.map((role) => ({ menuId: m('reports-activity'),    roleId: r(role) })),
    ...ALL.map((role)   => ({ menuId: m('settings'),            roleId: r(role) })),
    ...ALL.map((role)   => ({ menuId: m('settings-profile'),    roleId: r(role) })),
    ...ALL.map((role)   => ({ menuId: m('settings-security'),   roleId: r(role) })),
    ...ALL.map((role)   => ({ menuId: m('settings-prefs'),      roleId: r(role) })),
  ];

  await prisma.menuPermission.createMany({
    data: mappings,
    skipDuplicates: true,
  });

  console.log(`     ✓ ${mappings.length} menu-role mappings`);
}

async function seedSuperAdmin() {
  console.log('  → Seeding superadmin...');

  const email     = env.SUPERADMIN_EMAIL;
  const password  = env.SUPERADMIN_PASSWORD;
  const firstName = env.SUPERADMIN_FIRST_NAME ?? 'Super';
  const lastName  = env.SUPERADMIN_LAST_NAME  ?? 'Admin';

  if (!email || !password) {
    throw new Error('SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set in .env');
  }

  const role = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  if (!role) throw new Error('SUPER_ADMIN role not found');

  const superAdmin = await prisma.user.upsert({
    where:  { email },
    update: {
      password: await bcrypt.hash(password, 12),
      isEmailVerified: true,
      isActive: true,
    },
    create: {
      email,
      password: await bcrypt.hash(password, 12),
      firstName,
      lastName,
      isEmailVerified: true,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where:  { userId_roleId: { userId: superAdmin.id, roleId: role.id } },
    update: {},
    create: { userId: superAdmin.id, roleId: role.id, createdBy: superAdmin.id },
  });

  console.log(`     ✓ ${email}`);
}

async function seedDevUsers() {
  console.log('  → Seeding dev users...');

  const devUsers = [
    { email: 'admin@ums.dev',   password: 'Admin@1234',  firstName: 'System', lastName: 'Admin',   roleName: 'ADMIN'   },
    { email: 'manager@ums.dev', password: 'Manager@123', firstName: 'Jane',   lastName: 'Manager', roleName: 'MANAGER' },
    { email: 'user@ums.dev',    password: 'User@12345',  firstName: 'John',   lastName: 'Doe',     roleName: 'USER'    },
  ];

  const hashed = await Promise.all(
    devUsers.map((u) => bcrypt.hash(u.password, 10)),
  );

  await prisma.user.createMany({
    data: devUsers.map((u, i) => ({
      email:           u.email,
      password:        hashed[i],
      firstName:       u.firstName,
      lastName:        u.lastName,
      isEmailVerified: true,
      isActive:        true,
    })),
    skipDuplicates: true,
  });

  const [insertedUsers, roles] = await Promise.all([
    prisma.user.findMany({
      where:  { email: { in: devUsers.map((u) => u.email) } },
      select: { id: true, email: true },
    }),
    prisma.role.findMany({ select: { id: true, name: true } }),
  ]);

  const userMap = new Map(insertedUsers.map((u) => [u.email, u.id]));
  const roleMap = new Map(roles.map((r) => [r.name, r.id]));

  await prisma.userRole.createMany({
    data: devUsers.map((u) => ({
      userId: userMap.get(u.email)!,
      roleId: roleMap.get(u.roleName)!,
    })),
    skipDuplicates: true,
  });

  devUsers.forEach((u) => console.log(`     ✓ ${u.email} (${u.roleName})`));
}

// ─────────────────────────────────────────────────────────────────────────────

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());