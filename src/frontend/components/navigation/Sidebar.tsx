// src/frontend/components/navigation/Sidebar.tsx
'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuNode, QuickLink, UserPreferenceDto } from '@/types/menu.types';
import { usePreferences, useQuickLinks } from '@/frontend/hooks/useMenu';
import * as Icons from 'lucide-react';
import { ChevronRight, ChevronLeft, Pin, PinOff, Zap } from 'lucide-react';

interface SidebarProps {
  tree: MenuNode[];
  quickLinks: QuickLink[];
  preferences: UserPreferenceDto;
}

export function Sidebar({ tree, quickLinks, preferences }: SidebarProps) {
  const pathname = usePathname();
  const prefsMutation = usePreferences();
  const { remove: removeQuickLink } = useQuickLinks();

  const collapsed = preferences.sidebarCollapsed;
  const width = preferences.sidebarWidth;
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    new Set(preferences.expandedMenuKeys),
  );

  const toggleCollapse = useCallback(() => {
    prefsMutation.mutate({ sidebarCollapsed: !collapsed });
  }, [collapsed, prefsMutation]);

  const toggleExpand = useCallback(
    (key: string) => {
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        next.has(key) ? next.delete(key) : next.add(key);
        // Persist expanded state to backend
        prefsMutation.mutate({ expandedMenuKeys: Array.from(next) });
        return next;
      });
    },
    [prefsMutation],
  );

  const isActive = (path: string | null) => path && pathname.startsWith(path);

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen bg-white border-r border-gray-200
        flex flex-col z-40 transition-all duration-300 shadow-sm
      `}
      style={{ width: collapsed ? 64 : width }}
    >
      {/* Brand */}
      <div className="flex items-center h-16 px-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm shrink-0">
          U
        </div>
        {!collapsed && (
          <span className="ml-3 font-bold text-gray-900 text-sm truncate">UMS</span>
        )}
        <button
          onClick={toggleCollapse}
          className="ml-auto p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Quick Links */}
      {quickLinks.length > 0 && (
        <div className="px-3 pt-3 pb-2 border-b border-gray-100">
          {!collapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1">
              Quick Links
            </p>
          )}
          <div className="space-y-0.5">
            {quickLinks.map((ql) => (
              <QuickLinkItem
                key={ql.id}
                ql={ql}
                collapsed={collapsed}
                isActive={!!isActive(ql.menu.path)}
                onRemove={() => removeQuickLink.mutate(ql.menuId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Menu Tree */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2 px-2">
            Navigation
          </p>
        )}
        <ul className="space-y-0.5">
          {tree.map((node) => (
            <MenuItem
              key={node.id}
              node={node}
              depth={0}
              collapsed={collapsed}
              expandedKeys={expandedKeys}
              onToggleExpand={toggleExpand}
              isActive={isActive}
              pathname={pathname}
            />
          ))}
        </ul>
      </nav>

      {/* Bottom: nav mode toggle */}
      {!collapsed && (
        <div className="px-3 py-3 border-t border-gray-100 shrink-0">
          <button
            onClick={() => prefsMutation.mutate({ navMode: 'topbar' })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <Zap size={14} />
            Switch to Top Bar
          </button>
        </div>
      )}
    </aside>
  );
}

// ─── Menu Item (recursive) ────────────────────────────────────────────────────

interface MenuItemProps {
  node: MenuNode;
  depth: number;
  collapsed: boolean;
  expandedKeys: Set<string>;
  onToggleExpand: (key: string) => void;
  isActive: (path: string | null) => boolean | '' | null | undefined;
  pathname: string;
}

function MenuItem({
  node,
  depth,
  collapsed,
  expandedKeys,
  onToggleExpand,
  isActive,
  pathname,
}: MenuItemProps) {
  const hasChildren = node.children.length > 0;
  const expanded = expandedKeys.has(node.key);
  const active = isActive(node.path);
  const { add: addQuickLink } = useQuickLinks();

  const Icon = node.icon ? (Icons as any)[node.icon] : null;
  const paddingLeft = collapsed ? 0 : 8 + depth * 12;

  // Group header (no path)
  if (!node.path && hasChildren) {
    return (
      <li>
        <button
          onClick={() => !collapsed && onToggleExpand(node.key)}
          style={{ paddingLeft }}
          className={`
            w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
            text-sm font-medium text-gray-600 hover:bg-gray-100
            transition-colors group
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? node.label : undefined}
        >
          {Icon && <Icon size={17} className="shrink-0 text-gray-500" />}
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-left">{node.label}</span>
              {node.badgeText && <Badge text={node.badgeText} color={node.badgeColor} />}
              <ChevronRight
                size={14}
                className={`shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
              />
            </>
          )}
        </button>

        {/* Children */}
        {!collapsed && expanded && (
          <ul className="mt-0.5 space-y-0.5">
            {node.children.map((child) => (
              <MenuItem
                key={child.id}
                node={child}
                depth={depth + 1}
                collapsed={collapsed}
                expandedKeys={expandedKeys}
                onToggleExpand={onToggleExpand}
                isActive={isActive}
                pathname={pathname}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  // Leaf item (has path)
  return (
    <li>
      <Link
        href={node.path ?? '#'}
        target={node.target}
        style={{ paddingLeft }}
        className={`
          flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
          transition-colors group relative
          ${active
            ? 'bg-blue-50 text-blue-700 font-semibold'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium'
          }
          ${collapsed ? 'justify-center' : ''}
        `}
        title={collapsed ? node.label : undefined}
      >
        {Icon && (
          <Icon
            size={17}
            className={`shrink-0 ${active ? 'text-blue-600' : 'text-gray-500'}`}
          />
        )}
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{node.label}</span>
            {node.badgeText && <Badge text={node.badgeText} color={node.badgeColor} />}

            {/* Quick link pin button — appears on hover */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addQuickLink.mutate(node.id);
              }}
              className="
                opacity-0 group-hover:opacity-100 transition-opacity
                p-0.5 rounded text-gray-400 hover:text-blue-500
              "
              title="Add to quick links"
            >
              <Pin size={12} />
            </button>
          </>
        )}

        {/* Active indicator */}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-r-full" />
        )}
      </Link>

      {/* Inline children for leaf items that also have children */}
      {hasChildren && !collapsed && expanded && (
        <ul className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <MenuItem
              key={child.id}
              node={child}
              depth={depth + 1}
              collapsed={collapsed}
              expandedKeys={expandedKeys}
              onToggleExpand={onToggleExpand}
              isActive={isActive}
              pathname={pathname}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// ─── Quick Link Item ──────────────────────────────────────────────────────────

function QuickLinkItem({
  ql,
  collapsed,
  isActive,
  onRemove,
}: {
  ql: QuickLink;
  collapsed: boolean;
  isActive: boolean;
  onRemove: () => void;
}) {
  const Icon = ql.menu.icon ? (Icons as any)[ql.menu.icon] : null;

  return (
    <div className="group flex items-center gap-2">
      <Link
        href={ql.menu.path ?? '#'}
        className={`
          flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs
          transition-colors font-medium
          ${isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }
          ${collapsed ? 'justify-center' : ''}
        `}
        title={collapsed ? ql.menu.label : undefined}
      >
        {Icon && <Icon size={14} className="shrink-0" />}
        {!collapsed && <span className="truncate">{ql.menu.label}</span>}
      </Link>

      {!collapsed && (
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-gray-400 hover:text-red-500"
          title="Remove quick link"
        >
          <PinOff size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ text, color }: { text: string; color?: string | null }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${colors[color ?? 'blue'] ?? colors.blue}`}>
      {text}
    </span>
  );
}