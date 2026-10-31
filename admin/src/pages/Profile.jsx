import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile } from "../api/profile";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        setProfile(await getMyProfile());
      } catch (e) {
        setError(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-[#FFFACD] font-serif text-lg text-[#7C0B03]">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#7C0B03] border-t-transparent" />
        Loading profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F5EDA0] to-[#FFFACD] px-[5vw] py-10 text-[#2A1810]">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5 border-b-[3px] border-[#B81104] pb-5">
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-[#B81104]">Admin Account</p>
          <h1 className="font-serif text-3xl font-bold leading-tight text-[#7C0B03] md:text-4xl">Profile</h1>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="rounded-full border-2 border-[#B81104] bg-transparent px-6 py-3 text-sm font-semibold text-[#7C0B03] transition-all hover:bg-[#B81104]/10"
          >
            Back to dashboard
          </button>
          <button
            onClick={signOut}
            className="rounded-full border-2 border-[#B81104] bg-transparent px-6 py-3 text-sm font-semibold text-[#7C0B03] transition-all hover:bg-[#B81104]/10"
          >
            Log out
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border-l-4 border-[#B81104] bg-[#FFFDF6] px-4 py-3 text-sm font-semibold text-[#7C0B03]">
          {error}
        </div>
      )}

      {profile && (
        <div className="max-w-xl rounded-2xl border border-[#B81104]/20 bg-[#FFFDF6] p-6 shadow-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#7C0B03]/60">
            Admins are added manually — contact a super admin to change these details.
          </p>

          <div className="grid gap-3.5">
            <Field label="Name" value={profile.name || "—"} />
            <Field label="Email" value={profile.email} />
            <Field label="Phone number" value={profile.phoneNumber || "—"} />
            <Field label="Roles" value={(profile.roles ?? []).join(", ") || "—"} />
          </div>
        </div>
      )}
    </div>
  );
};

function Field({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#B81104]/10 pb-2.5 text-[13.5px]">
      <span className="font-semibold text-[#7C0B03]/60">{label}</span>
      <span className="text-right font-medium text-[#2A1810]">{value}</span>
    </div>
  );
}

export default Profile;