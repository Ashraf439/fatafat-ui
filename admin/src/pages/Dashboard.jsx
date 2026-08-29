import React, { useEffect, useState } from "react";
import {
  approveRestaurent,
  rejectRestaurent,
  getAllApplications,
} from "../api/dashboard";
import { useAuth } from "../context/AuthContext";

const RESTAURANT_STATUS = [
  "UNDER_REVIEW",
  "REJECTED",
  "APPROVED_PENDING_PAYMENT",
  "LIVE",
];

const STATUS_LABEL = {
  UNDER_REVIEW: "Under Review",
  REJECTED: "Rejected",
  APPROVED_PENDING_PAYMENT: "Approved · Pending Payment",
  LIVE: "Live",
};

// Tonal variants of the two brand colors so status badges read distinctly
// without introducing new hues.
const statusTone = (status) => {
  switch (status) {
    case "LIVE":
      return "text-[#B81104] border-[#B81104]";
    case "APPROVED_PENDING_PAYMENT":
      return "text-[#7C0B03] border-[#7C0B03]";
    case "REJECTED":
      return "text-[#7C0B03] border-[#8a8a8a]";
    default:
      return "text-[#7C0B03] border-[#F5EDA0]";
  }
};

const statusBar = (status) => {
  switch (status) {
    case "LIVE":
      return "bg-[#B81104]";
    case "APPROVED_PENDING_PAYMENT":
      return "bg-[#7C0B03]";
    case "REJECTED":
      return "bg-[#8a8a8a]";
    default:
      return "bg-[#F5EDA0]";
  }
};

const Dashboard = () => {
  const { accessToken, account } = useAuth();

  const [applications, setApplications] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(RESTAURANT_STATUS[0]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const fetchApplications = async () => {
    if (!accessToken) {
      return;
    }
    try {
      setLoading(true);
      setError("");

      const result = await getAllApplications(selectedStatus, accessToken);

      if (Array.isArray(result)) {
        setApplications(result);
      } else if (result && Array.isArray(result.data)) {
        setApplications(result.data);
      } else {
        setApplications([]);
      }
    } catch (e) {
      setError(e.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [accessToken, selectedStatus]);

  const handleApprove = async (applicationId) => {
    if (!applicationId) {
      setError("Application id is missing.");
      return;
    }
    try {
      setActionLoading(applicationId);
      setError("");
      await approveRestaurent(applicationId, accessToken);

      await fetchApplications();
    } catch (e) {
      setError(e.message || "Failed to approve application");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (applicationId) => {
    if (!applicationId) {
      setError("Application id is missing.");
      return;
    }
    try {
      setActionLoading(applicationId);
      setError("");
      await rejectRestaurent(applicationId, accessToken);

      await fetchApplications();
    } catch (e) {
      setError(e.message || "Failed to reject application");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFACD] font-serif text-[#7C0B03] text-lg gap-3">
        <span className="w-4 h-4 border-2 border-[#7C0B03] border-t-transparent rounded-full animate-spin" />
        Loading applications…
      </div>
    );
  }

  const filtered = applications.filter((app) => app.status === selectedStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5EDA0] to-[#FFFACD] text-[#2A1810] px-[5vw] py-10">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-5 mb-7 border-b-[3px] border-[#B81104] pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#B81104] mb-1.5">
            Restaurant Onboarding
          </p>
          <h1 className="font-serif font-bold text-3xl md:text-4xl text-[#7C0B03] leading-tight">
            Welcome, {account?.name || "Admin"}
          </h1>
        </div>
        <button
          onClick={fetchApplications}
          className="bg-[#2A1810] text-[#FFFDF6] rounded-full px-6 py-3 font-semibold text-sm hover:bg-[#B81104] hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          ⟳ Refresh
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-2">
        {RESTAURANT_STATUS.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`text-[13px] font-semibold border-2 border-[#B81104] rounded-full px-4.5 py-2 transition-all ${
              status === selectedStatus
                ? "bg-[#B81104] text-[#FFFACD] shadow-[0_3px_0_#7C0B03]"
                : "bg-transparent text-[#7C0B03] hover:bg-[#B81104]/10"
            }`}
          >
            {STATUS_LABEL[status]}
          </button>
        ))}
      </div>

      <p className="text-sm text-[#7C0B03]/75 mt-3 mb-6">
        {filtered.length} application{filtered.length === 1 ? "" : "s"} · {STATUS_LABEL[selectedStatus]}
      </p>

      {error && (
        <div className="bg-[#FFFDF6] border-l-4 border-[#B81104] text-[#7C0B03] font-semibold text-sm px-4 py-3 rounded-lg mb-5">
          {error}
        </div>
      )}

      {/* Applications */}
      {filtered.length === 0 ? (
        <div className="bg-[#FFFDF6] border-2 border-dashed border-[#B81104]/25 rounded-2xl text-center text-[#7C0B03] px-5 py-16">
          <span className="block font-serif text-2xl mb-2">Nothing here yet</span>
          <span className="block text-sm opacity-70">
            No applications currently sit in "{STATUS_LABEL[selectedStatus]}".
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
          {filtered.map((app) => {
            const applicationId = app.id;
            const isApproved =
              app.status === "LIVE" || app.status === "APPROVED_PENDING_PAYMENT";
            const isRejected = app.status === "REJECTED";
            const isProcessing = actionLoading === applicationId;

            return (
              <div
                key={applicationId}
                className="relative bg-[#FFFDF6] border border-[#B81104]/20 rounded-2xl p-5 pt-6 shadow-sm hover:shadow-lg hover:shadow-[#7C0B03]/10 hover:-translate-y-1 transition-all"
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl ${statusBar(app.status)}`} />

                <div className="flex justify-between items-start gap-2.5 mb-4">
                  <h2 className="font-serif font-bold text-xl text-[#7C0B03] leading-tight">
                    {app.restaurantName}
                  </h2>
                  <span
                    className={`font-serif font-bold text-[10.5px] uppercase tracking-wider px-2.5 py-1 rounded-md border-2 -rotate-3 whitespace-nowrap ${statusTone(
                      app.status
                    )}`}
                  >
                    {STATUS_LABEL[app.status] || app.status}
                  </span>
                </div>

                <div className="grid gap-2.5 mb-1">
                  {app.ownerEmail && (
                    <div className="flex justify-between gap-3 text-[13.5px] pb-2 border-b border-[#B81104]/10">
                      <span className="text-[#7C0B03]/60 font-semibold">Owner Email</span>
                      <span className="text-[#2A1810] font-medium text-right">{app.ownerEmail}</span>
                    </div>
                  )}

                  {(app.city || app.state) && (
                    <div className="flex justify-between gap-3 text-[13.5px] pb-2 border-b border-[#B81104]/10">
                      <span className="text-[#7C0B03]/60 font-semibold">Location</span>
                      <span className="text-[#2A1810] font-medium text-right">
                        {[app.city, app.state].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}

                  {typeof app.attemptNumber !== "undefined" && (
                    <div className="flex justify-between gap-3 text-[13.5px]">
                      <span className="text-[#7C0B03]/60 font-semibold">Attempt</span>
                      <span className="text-[#2A1810] font-medium text-right">#{app.attemptNumber}</span>
                    </div>
                  )}
                </div>

                {app.rejectionReason && (
                  <div className="bg-[#FFFACD] border border-[#B81104]/20 rounded-lg px-3 py-2.5 mt-3.5 text-[13px]">
                    <div className="font-bold text-[#7C0B03] text-[11px] uppercase tracking-wider mb-0.5">
                      Rejection Reason
                    </div>
                    <div>{app.rejectionReason}</div>
                  </div>
                )}

                {!isApproved && !isRejected && (
                  <div className="flex gap-2.5 mt-4.5 pt-4 border-t border-[#B81104]/10">
                    <button
                      type="button"
                      onClick={() => handleApprove(applicationId)}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2.5 font-bold text-[13.5px] bg-[#B81104] text-[#FFFACD] border-2 border-[#B81104] hover:bg-[#7C0B03] hover:border-[#7C0B03] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isProcessing ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-[#FFFACD] border-t-transparent rounded-full animate-spin" />
                          Processing
                        </>
                      ) : (
                        "✓ Approve"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReject(applicationId)}
                      disabled={isProcessing}
                      className="flex-1 rounded-lg px-3.5 py-2.5 font-bold text-[13.5px] bg-transparent text-[#7C0B03] border-2 border-[#B81104] hover:bg-[#B81104]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      × Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;