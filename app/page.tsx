import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-[#0F0E0A] text-[#F5F0E8]">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[#2A2820]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          <span className="font-serif text-xl tracking-tight">WorshipLens</span>
        </div>
        <Link href="/songs" className="text-sm text-[#8A8070] hover:text-[#F5F0E8] transition-colors">Browse Songs</Link>
      </nav>
      <section className="px-8 pt-24 pb-20 max-w-5xl mx-auto">
        <h1 className="font-serif text-6xl md:text-7xl leading-tight tracking-tight mb-6">
          Every song deserves<br />
          <span className="text-[#C4963C]">careful examination.</span>
        </h1>
        <p className="text-[#8A8070] text-xl max-w-2xl leading-relaxed mb-12">
          AI-powered theological reviews through five pastoral lenses — helping Baptist worship leaders choose songs with confidence, scripture, and integrity.
        </p>
        <Link href="/songs" className="bg-[#C4963C] text-[#0F0E0A] px-8 py-3.5 rounded font-medium hover:bg-[#D4A64C] transition-colors text-sm">
          Browse Song Reviews
        </Link>
      </section>
      <footer className="px-8 py-8 border-t border-[#2A2820] flex items-center justify-between text-xs text-[#4A4438]">
        <span>WorshipLens — First Baptist Church, Cedar Hill TX</span>
        <span>CCLI License #365971</span>
      </footer>
    </main>
  );
}
