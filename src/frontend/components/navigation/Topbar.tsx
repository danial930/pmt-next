// src/frontend/components/navigation/Topbar.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuNode, UserPreferenceDto } from '@/types/menu.types';
import { usePreferences } from '@/frontend/hooks/useMenu';
import * as Icons from 'lucide-react';
import { ChevronDown, LayoutDashboard } from 'lucide-react';

interface TopbarProps {
  tree: MenuNode[];
  preferences: UserPreferenceDto;
}

export function Topbar({ tree, preferences }: TopbarProps) {
  const pathname = usePathname();
  const prefsMutation = usePreferences();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center px-4 shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-6">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
          U
        </div>
        <span className="font-bold text-gray-900 text-sm">UMS</span>
      </div>

      {/* Nav items */}
      <nav className="flex items-center gap-1 flex-1">
        {tree.map((node) => (
          <TopbarItem key={node.id} node={node} pathname={pathname} />
        ))}
      </nav>

      {/* Switch to sidebar */}
      <button
        onClick={() => prefsMutation.mutate({ navMode: 'sidebar' })}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors ml-4"
      >
        <LayoutDashboard size={14} />
        Switch to Sidebar
      </button>
    </header>
  );
}

// ─── Topbar Item (recursive dropdown) ────────────────────────────────────────

function TopbarItem({ node, pathname, depth = 0 }: {
  node: MenuNode;
  pathname: string;
  depth?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasChildren = node.children.length > 0;
  const active = node.path && pathname.startsWith(node.path);
  const Icon = node.icon ? (Icons as any)[node.icon] : null;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!hasChildren) {
    return (
      <Link
        href={node.path ?? '#'}
        className={`
          flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
        `}
      >
        {Icon && <Icon size={15} />}
        {node.label}
        {node.badgeText && (
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">
            {node.badgeText}
          </span>
        )}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`
          flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${open || active ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}
        `}
      >
        {Icon && <Icon size={15} />}
        {node.label}
        <ChevronDown
          size={13}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className={`
            absolute top-full mt-1 bg-white rounded-xl border border-gray-200
            shadow-xl py-1.5 z-50 min-w-[200px]
            ${depth > 0 ? 'left-full top-0 mt-0 ml-1' : 'left-0'}
          `}
        >
          {node.children.map((child) => (
            <TopbarDropdownItem
              key={child.id}
              node={child}
              pathname={pathname}
              depth={depth + 1}
              onClose={() => setOpen(false)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TopbarDropdownItem({ node, pathname, depth, onClose }: {
  node: MenuNode;
  pathname: string;
  depth: number;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasChildren = node.children.length > 0;
  const active = node.path && pathname.startsWith(node.path);
  const Icon = node.icon ? (Icons as any)[node.icon] : null;

  if (!hasChildren) {
    return (
      <Link
        href={node.path ?? '#'}
        onClick={onClose}
        className={`
          flex items-center gap-2.5 px-4 py-2 text-sm transition-colors
          ${active ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}
        `}
      >
        {Icon && <Icon size={15} className="text-gray-400 shrink-0" />}
        <span className="flex-1">{node.label}</span>
        {node.badgeText && (
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded-full">
            {node.badgeText}
          </span>
        )}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
        {Icon && <Icon size={15} className="text-gray-400 shrink-0" />}
        <span className="flex-1 text-left">{node.label}</span>
        <ChevronDown size={13} className="-rotate-90 text-gray-400" />
      </button>

      {open && (
        <div className="absolute left-full top-0 ml-1 bg-white rounded-xl border border-gray-200 shadow-xl py-1.5 min-w-[200px] z-50">
          {node.children.map((child) => (
            <TopbarDropdownItem
              key={child.id}
              node={child}
              pathname={pathname}
              depth={depth + 1}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </div>
  );
}