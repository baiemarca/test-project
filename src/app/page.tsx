export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        <p className="text-sm font-medium text-zinc-500">Baie · first deploy</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
          This is a Next.js app on Vercel.
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600">
          Local is localhost. Vercel gives this same page a public URL. Edit,
          redeploy, and the live site updates.
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-zinc-700">
          <li>Run locally</li>
          <li>Deploy with Vercel</li>
          <li>Open the live link</li>
        </ol>
      </div>
    </main>
  );
}
