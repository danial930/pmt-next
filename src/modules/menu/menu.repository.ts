// src/modules/menu/menu.repository.ts
import { prisma } from '@/lib/prisma';

export class MenuRepository {
  // Fetch all visible menus with permission data in one query
  async findAllWithPermissions() {
    return prisma.menu.findMany({
      where: { isActive: true, isVisible: true },
      include: {
        menuPermissions: {
          where: { isActive: true },
          include: { role: true, permission: true },
        },
      },
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async findUserMenuAccess(userId: number) {
    return prisma.userMenuAccess.findMany({
      where: { userId, isActive: true },
      select: { menuId: true, access: true },
    });
  }

  async findUserQuickLinks(userId: number) {
    return prisma.userQuickLink.findMany({
      where: { userId, isActive: true },
      include: {
        menu: {
          select: { key: true, label: true, icon: true, path: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async upsertQuickLink(userId: number, menuId: number, sortOrder: number) {
    return prisma.userQuickLink.upsert({
      where: { userId_menuId: { userId, menuId } },
      update: { isActive: true, sortOrder, updatedBy: userId },
      create: { userId, menuId, sortOrder, createdBy: userId },
    });
  }

  async removeQuickLink(userId: number, menuId: number) {
    return prisma.userQuickLink.updateMany({
      where: { userId, menuId },
      data: { isActive: false, updatedBy: userId },
    });
  }

  async reorderQuickLinks(userId: number, menuIds: number[]) {
    return prisma.$transaction(
      menuIds.map((menuId, index) =>
        prisma.userQuickLink.updateMany({
          where: { userId, menuId, isActive: true },
          data: { sortOrder: index, updatedBy: userId },
        }),
      ),
    );
  }

  async findUserPreference(userId: number) {
    return prisma.userPreference.findUnique({ where: { userId } });
  }

  async upsertUserPreference(userId: number, data: Partial<{
    navMode: string;
    sidebarCollapsed: boolean;
    sidebarWidth: number;
    theme: string;
    accentColor: string;
    expandedMenuKeys: string[];
  }>) {
    return prisma.userPreference.upsert({
      where: { userId },
      update: { ...data, updatedBy: userId },
      create: { userId, ...data, createdBy: userId },
    });
  }

  async findMenuById(id: number) {
    return prisma.menu.findUnique({ where: { id } });
  }

  // Admin — full CRUD
  async createMenu(data: {
    key: string;
    label: string;
    icon?: string;
    path?: string;
    parentId?: number;
    sortOrder?: number;
    target?: string;
    badgeText?: string;
    badgeColor?: string;
    createdBy: string;
  }) {
    return prisma.menu.create({ data });
  }

  async updateMenu(id: number, data: Partial<{
    label: string;
    icon: string;
    path: string;
    parentId: number;
    sortOrder: number;
    isVisible: boolean;
    badgeText: string;
    badgeColor: string;
    updatedBy: string;
  }>) {
    return prisma.menu.update({ where: { id }, data });
  }

  async assignMenuToRole(menuId: number, roleId: number, createdBy: string) {
    return prisma.menuPermission.upsert({
      where: { menuId_roleId_permissionId: { menuId, roleId, permissionId: null as any } },
      update: { isActive: true, updatedBy: createdBy },
      create: { menuId, roleId, createdBy },
    });
  }

  async setUserMenuAccess(
    userId: number,
    menuId: number,
    access: 'allow' | 'deny',
    createdBy: string,
  ) {
    return prisma.userMenuAccess.upsert({
      where: { userId_menuId: { userId, menuId } },
      update: { access, isActive: true, updatedBy: createdBy },
      create: { userId, menuId, access, createdBy },
    });
  }
}