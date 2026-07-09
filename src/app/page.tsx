import UsersPage from "@/frontend/app/(dashboard)/users/page";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-gray-900">UMS</h1>
      <p className="mt-4 text-gray-500">User Management System is running.</p>
      
        <a href="/api/auth/login"
        className="mt-6 text-blue-600 hover:underline text-sm"
      >
        <UsersPage></UsersPage>
      </a>
    </main>
  );
}