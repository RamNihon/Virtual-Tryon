import DashboardSidebar from "../DashboardSidebar";

/*
  ─── DASHBOARD LAYOUT ───────────────────────────────────────
  This is the shell every dashboard section renders inside.
  It owns the sidebar + the responsive content offset, so
  individual sections (Overview, Garment Shop, Orders, etc.)
  never need to think about the sidebar at all — they just
  render their own content and this wrapper positions it.
--------------------------------------------------------------*/
export default function DashboardLayout({
  activeSection,
  onSectionChange,
  children,
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />

      {/* Content area — offset by the sidebar's width on large screens */}
      <main className="lg:pl-[248px]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
