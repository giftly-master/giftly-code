export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F7F7FC] dark:bg-[#0f0f13] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#5A42DE] animate-pulse flex items-center justify-center">
          <span className="text-white font-bold text-xl">G</span>
        </div>
        <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-[#5A42DE] rounded-full animate-[shimmer_1.5s_ease-in-out_infinite] w-1/2" />
        </div>
      </div>
    </div>
  );
}
