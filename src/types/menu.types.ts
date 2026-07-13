// src/types/menu.types.ts
export interface MenuNode {
  id: number;
  key: string;
  label: string;
  icon: string | null;
  path: string | null;
  parentId: string | null;
  sortOrder: number;
  target: string;
  badgeText: string | null;
  badgeColor: string | null;
  children: MenuNode[];
}

export interface QuickLink {
  id: number;
  menuId: number;
  sortOrder: number;
  menu: {
    key: string;
    label: string;
    icon: string | null;
    path: string | null;
  };
}

export interface UserPreferenceDto {
  navMode: 'sidebar' | 'topbar';
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  expandedMenuKeys: string[];
}