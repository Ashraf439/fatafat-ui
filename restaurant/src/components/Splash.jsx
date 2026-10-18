import {Loader2} from "lucide-react";

export function Splash() {
    return (
        <div className = "flex min-h-screen items-center justify-center text-primary" role = "status" aria-label="Loading">
            <Loader2 className = "size-8 animate-spin" />
        </div>
    );
}

export function PageLoader() {
    return (
        <div className="flex justify-center py-24 text-primary" role="status" aria-label="Loading">
            <Loader2 className="size-6 animate-spin"></Loader2>
        </div>
    )
}