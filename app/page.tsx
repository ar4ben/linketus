import Link from "next/link";

import { Button } from "@/components/ui/button";
import { InstallLinketusCta } from "@/components/install-linketus-cta";

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center justify-center py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
        Presence over communication
      </h1>

      <div className="mt-8 space-y-2 text-lg leading-relaxed text-foreground/90 sm:text-xl">
        <p>Linketus is a simple way to be present with others - even when you&apos;re apart.</p>
        <p>Create a linket, invite people, and check in with a single tap.</p>
        <p>No chat. No noise. Just presence.</p>
      </div>

      <Button asChild size="lg" className="mt-10 h-12 px-8 text-base font-semibold">
        <Link href="/linket/new">Create your first linket</Link>
      </Button>

      <InstallLinketusCta />
    </section>
  );
}
