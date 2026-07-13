// src/modules/menu/menu.service.ts
import { MenuRepository } from './menu.repository';
import { MenuNode, QuickLink, UserPreferenceDto } from '@/types/menu.types';
import { ApiError } from '@/core/response/api-error';

export class MenuService {
  constructor(private repo: MenuRepository = new MenuRepository()) {}

  // ─── Build tree ────────────────────────────────────────────────────────────

  async getMenuTreeForUser(userId: string, userRoles: string[], userPermissions: string[]): Promise<{
    tree: MenuNode[];
    quickLinks: QuickLink[];
    preferences: UserPreferenceDto;
  }> {
    const [allMenus, userAccess, quickLinks, preferences] = await Promise.all([
      this.repo.findAllWithPermissions(),
      this.repo.findUserMenuAccess(userId),
      this.repo.findUserQuickLinks(userId),
      this.repo.findUserPreference(userId),
    ]);

    // Build access lookup map
    const accessMap = new Map(userAccess.map((a) => [a.menuId, a.access]));

    // Filter menus user can see
    const visibleMenus = allMenus.filter((menu) => {
      // Explicit user-level deny always wins
      if (accessMap.get(menu.id) === 'deny') return false;

      // Explicit user-level allow bypasses role check
      if (accessMap.get(menu.id) === 'allow') return true;

      // No permissions defined = visible to everyone
      if (menu.menuPermissions.length === 0) return true;

      // Check role match
      const hasRole = menu.menuPermissions.some(
        (mp) => mp.role && userRoles.includes(mp.role.name),
      );

      // Check permission match
      const hasPermission = menu.menuPermissions.some(
        (mp) => mp.permission && userPermissions.includes(mp.permission.name),
      );

      return hasRole || hasPermission;
    });

    // Assemble into tree — single pass O(n)
    const tree = this.buildTree(visibleMenus);

    return {
      tree,
        quickLinks: quickLinks.map((ql : any) => ({
        id: ql.id,
        menuId: ql.menuId,
        sortOrder: ql.sortOrder,
        menu: ql.menu,
      })),
      preferences: this.toPreferenceDto(preferences),
    };
  }

  private buildTree(flatMenus: any[]): MenuNode[] {
    const map = new Map<string, MenuNode>();
    const roots: MenuNode[] = [];

    // First pass: create all nodes
    for (const m of flatMenus) {
      map.set(m.id, {
        id: m.id,
        key: m.key,
        label: m.label,
        icon: m.icon,
        path: m.path,
        parentId: m.parentId,
        sortOrder: m.sortOrder,
        target: m.target,
        badgeText: m.badgeText,
        badgeColor: m.badgeColor,
        children: [],
      });
    }

    // Second pass: attach children to parents
    for (const node of map.values()) {
      if (!node.parentId) {
        roots.push(node);
      } else {
        const parent = map.get(node.parentId);
        if (parent) {
          parent.children.push(node);
        }
      }
    }

    // Sort each level by sortOrder
    const sortNodes = (nodes: MenuNode[]): MenuNode[] => {
      return nodes
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((n) => ({ ...n, children: sortNodes(n.children) }));
    };

    return sortNodes(roots);
  }

  private toPreferenceDto(pref: any): UserPreferenceDto {
    return {
      navMode: pref?.navMode ?? 'sidebar',
      sidebarCollapsed: pref?.sidebarCollapsed ?? false,
      sidebarWidth: pref?.sidebarWidth ?? 260,
      theme: pref?.theme ?? 'light',
      accentColor: pref?.accentColor ?? 'blue',
      expandedMenuKeys: pref?.expandedMenuKeys ?? [],
    };
  }

  // ─── Quick Links ───────────────────────────────────────────────────────────

  async addQuickLink(userId: string, menuId: string): Promise<void> {
    const menu = await this.repo.findMenuById(menuId);
    if (!menu) throw ApiError.notFound('Menu item not found');
    if (!menu.path) throw ApiError.badRequest('Cannot add a group header as a quick link');

    const existing = await this.repo.findUserQuickLinks(userId);
    if (existing.length >= 10) {
      throw ApiError.badRequest('Maximum of 10 quick links allowed');
    }

    const sortOrder = existing.length;
    await this.repo.upsertQuickLink(userId, menuId, sortOrder);
  }

  async removeQuickLink(userId: string, menuId: string): Promise<void> {
    await this.repo.removeQuickLink(userId, menuId);
  }

  async reorderQuickLinks(userId: string, menuIds: string[]): Promise<void> {
    await this.repo.reorderQuickLinks(userId, menuIds);
  }

  // ─── Preferences ──────────────────────────────────────────────────────────

  async updatePreferences(
    userId: string,
    data: Partial<UserPreferenceDto>,
  ): Promise<UserPreferenceDto> {
    const updated = await this.repo.upsertUserPreference(userId, data);
    return this.toPreferenceDto(updated);
  }
}