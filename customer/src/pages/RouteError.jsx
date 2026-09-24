import { useRouteError } from "react-router-dom";
import { ErrorState } from "@/components/States";

/** Last-resort boundary for render/loader crashes inside a route. */
export default function RouteError() {
  const error = useRouteError();
  return (
    <div className="mx-auto max-w-xl p-6">
      <ErrorState
        title="Something broke"
        error={{ message: error?.message ?? "An unexpected error occurred." }}
        onRetry={() => window.location.reload()}
      />
    </div>
  );
}
