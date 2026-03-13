export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">sync</span>
        <p className="mt-4 text-slate-600">Loading itinerary...</p>
      </div>
    </div>
  )
}
