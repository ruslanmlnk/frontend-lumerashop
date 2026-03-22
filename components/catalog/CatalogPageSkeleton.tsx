const ProductSkeletonCard = () => (
    <div className="flex h-full w-full flex-col rounded-[18px]">
        <div className="aspect-square rounded-[18px] bg-[#f3efe9]" />
        <div className="mx-auto mt-5 h-6 w-[78%] rounded-full bg-[#f3efe9]" />
        <div className="mx-auto mt-4 h-5 w-[34%] rounded-full bg-[#f3efe9]" />
    </div>
);

export default function CatalogPageSkeleton() {
    return (
        <main aria-busy="true" aria-live="polite" className="min-h-[calc(100vh-220px)] bg-white font-sans text-[#111111]">
            <div className="border-b border-neutral-100 bg-[#f9f9f9] py-8">
                <div className="mx-auto max-w-[1140px] px-4 lg:px-0">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="h-3 w-14 rounded-full bg-[#ece6dd]" />
                        <div className="h-3 w-3 rounded-full bg-[#ece6dd]" />
                        <div className="h-3 w-20 rounded-full bg-[#ece6dd]" />
                    </div>
                    <div className="h-12 w-[260px] max-w-full rounded-full bg-[#ece6dd]" />
                </div>
            </div>

            <div className="mx-auto max-w-[1140px] px-4 py-16 lg:px-0">
                <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-10">
                    <aside className="hidden w-full max-w-[250px] shrink-0 self-stretch lg:flex lg:flex-col">
                        <div className="space-y-4">
                            <div className="h-7 w-[160px] rounded-full bg-[#f0ebe3]" />
                            <div className="space-y-3">
                                {Array.from({ length: 7 }).map((_, index) => (
                                    <div key={index} className="h-4 w-[170px] rounded-full bg-[#f5f1eb]" />
                                ))}
                            </div>
                            <div className="pt-5">
                                <div className="h-7 w-[100px] rounded-full bg-[#f0ebe3]" />
                                <div className="mt-5 space-y-4">
                                    <div className="h-20 rounded-[18px] bg-[#f7f4ef]" />
                                    <div className="h-32 rounded-[18px] bg-[#f7f4ef]" />
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div className="min-w-0 w-full flex-1">
                        <div className="mb-10 flex w-full flex-col items-center justify-between gap-4 md:flex-row">
                            <div className="h-4 w-36 rounded-full bg-[#efe8de]" />
                            <div className="h-12 w-[220px] rounded-full bg-[#efe8de]" />
                        </div>

                        <div className="grid w-full min-h-[780px] grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
                            {Array.from({ length: 9 }).map((_, index) => (
                                <ProductSkeletonCard key={index} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
