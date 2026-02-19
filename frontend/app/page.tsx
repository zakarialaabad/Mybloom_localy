/**
 * Public landing page — statically generated at build time (SSG).
 * No auth links exposed here. Access the dashboard directly at /dashboard;
 * unauthenticated users are redirected to /login automatically.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-white px-4">
      <div className="w-full max-w-lg space-y-4 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-brand-700">Parfum</h1>
        <p className="text-lg text-gray-500">Your premium fragrance destination</p>
      </div>
    </main>
  );
}
