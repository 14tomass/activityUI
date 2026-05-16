function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[#f4f4f6] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-6 py-8 sm:px-10 lg:px-12">
        {children}
      </div>
    </div>
  )
}

export default AppShell
