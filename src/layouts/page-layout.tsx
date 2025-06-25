import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
  refClass,
}: {
  children: React.ReactNode;
  refClass?: React.RefObject<HTMLDivElement> | null;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main
        ref={refClass}
        className="container mx-auto max-w-7xl px-6 flex-grow pt-16"
      >
        {children}
      </main>
    </div>
  );
}
