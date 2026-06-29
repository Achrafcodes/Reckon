export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Form side */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-paper lg:px-16">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10">
            <span
              className="text-2xl text-forest"
              style={{ fontFamily: "var(--font-dm-serif)", fontStyle: "italic" }}
            >
              Reckon
            </span>
          </div>
          {children}
        </div>
      </div>

      {/* Branding panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between bg-ink px-16 py-14 shrink-0">
        <div />
        <div>
          <p
            className="text-6xl xl:text-7xl leading-[1.1] text-white mb-8"
            style={{ fontFamily: "var(--font-dm-serif)", fontStyle: "italic" }}
          >
            Know where every pound goes.
          </p>
          <p className="text-base text-sidebar-text leading-relaxed max-w-sm">
            Upload a bank statement. Reckon categorizes, tracks, and makes sense of your money — without the spreadsheet.
          </p>
        </div>
        <p className="text-xs text-sidebar-text-muted tracking-wide uppercase">
          Reckon &mdash; Financial clarity
        </p>
      </div>
    </div>
  );
}
