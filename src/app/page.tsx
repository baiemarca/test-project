export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f1e8] px-6 py-16 text-zinc-900">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-14">
        <header>
          <p className="text-sm font-medium tracking-wide text-zinc-500">
            baie-test.vercel.app
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Baie Marcantonio
          </h1>
          <p className="mt-4 text-lg leading-8 text-zinc-600">
            Learning to write code, push it, and put it on the internet.
          </p>
        </header>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Now
          </h2>
          <p className="mt-3 text-base leading-7 text-zinc-700">
            Building small sites with Cursor, GitHub, and Vercel. This page is
            the first one that is actually live.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Links
          </h2>
          <ul className="mt-3 space-y-2 text-base">
            <li>
              <a
                className="underline decoration-zinc-400 underline-offset-4 hover:decoration-zinc-900"
                href="https://github.com/baiemarca/test-project"
              >
                GitHub repo
              </a>
            </li>
            <li>
              <a
                className="underline decoration-zinc-400 underline-offset-4 hover:decoration-zinc-900"
                href="https://baie-test.vercel.app"
              >
                This site
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
