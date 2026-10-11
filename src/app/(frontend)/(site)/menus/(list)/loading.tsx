import { Skeleton } from '@/components/ui/Skeleton'

/** Shown on first navigation to /menus (filter changes keep the old results, dimmed). */
export default function Loading() {
  return (
    <div className="container-wide flex flex-col gap-10 pt-12 pb-(--spacing-section) md:pt-16" aria-busy="true" aria-label="Loading menus">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-14 w-2/3 max-w-xl" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="hidden flex-col gap-4 lg:col-span-3 lg:flex">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:col-span-9 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="flex flex-col gap-3 rounded-md border border-border p-0">
              <Skeleton className="aspect-[4/3] rounded-b-none" />
              <div className="flex flex-col gap-3 p-5">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
