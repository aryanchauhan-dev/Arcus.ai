import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResumeSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-1 flex items-center justify-center p-8">
                    <Skeleton className="h-40 w-40 rounded-full" />
                </Card>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-1" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Card>
                <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                </CardContent>
            </Card>
            <div className="grid md:grid-cols-2 gap-4">
                {[0, 1].map((i) => (
                    <Card key={i}>
                        <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
                        <CardContent className="space-y-2">
                            {Array.from({ length: 3 }).map((_, j) => (
                                <div key={j} className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-6 w-20 rounded-full" />
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><Skeleton className="h-5 w-28" /></CardHeader>
                    <CardContent className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex gap-2">
                                <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}