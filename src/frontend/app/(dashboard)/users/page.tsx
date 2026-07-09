// src/frontend/app/(dashboard)/users/page.tsx
'use client';

import { useDeleteUser, useUsers } from '@/frontend/hooks/useUsers';
import { useState } from 'react';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useUsers({ page, limit: 10, search, sortBy: 'createdAt', sortOrder: 'desc' });
  const deleteUser = useDeleteUser();

  if (isLoading) return <div className="p-6 text-gray-500">Loading users...</div>;
  if (isError) return <div className="p-6 text-red-500">Failed to load users</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.data.map((user : any) => (
              <tr key={user.id}>
                <td className="px-4 py-3 text-sm text-gray-900">{user.firstName} {user.lastName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.roles.join(', ')}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <button
                    onClick={() => deleteUser.mutate(user.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <span>Page {data?.meta.page} of {data?.meta.totalPages} ({data?.meta.total} total)</span>
        <div className="space-x-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
          <button disabled={!data || page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}