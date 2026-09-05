import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  listStaff,
  addStaff,
  removeStaff,
  updateStaffPermission,
} from "../api/staff";

const ASSIGNABLE_ROLES = ["RESTAURANT_MANAGER", "RESTAURANT_STAFF", "RESTAURANT_CASHIER"];
const PERMISSIONS = [
  "MENU_ITEM_ADD",
  "MENU_ITEM_REMOVE",
  "ORDER_ACCEPT",
  "ORDER_CANCEL",
  "STAFF_ADD",
  "STAFF_REMOVE",
  "STAFF_MANAGE_PERMISSIONS",
];

const ROLE_LABELS = {
  RESTAURANT_MANAGER: "Manager",
  RESTAURANT_STAFF: "Staff",
  RESTAURANT_CASHIER: "Cashier",
};

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [newStaff, setNewStaff] = useState({ email: "", role: ASSIGNABLE_ROLES[0] });
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    setLoading(true);
    listStaff()
      .then(setStaff)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handleAddStaff(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await addStaff(newStaff);
      toast.success(`Invited ${newStaff.email}`);
      setNewStaff({ email: "", role: ASSIGNABLE_ROLES[0] });
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(staffUserId, email) {
    if (!confirm(`Remove ${email} from staff?`)) return;
    try {
      await removeStaff(staffUserId);
      toast.success("Staff removed");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handlePermissionChange(staffUserId, permissionName, effect) {
    try {
      await updateStaffPermission(staffUserId, { permissionName, effect });
      toast.success(`${permissionName} ${effect.toLowerCase()}ed`);
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1C1B19]">Staff</h1>
        <p className="text-sm text-[#1C1B19]/50 mt-1">
          Manage who has access to your restaurant and what they can do.
        </p>
      </div>

      {/* Add staff form */}
      <div className="mb-8 bg-white rounded-2xl border border-black/5 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-[#1C1B19] mb-4">Invite staff</h2>
        <form onSubmit={handleAddStaff} className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-[#1C1B19]/60 mb-1.5">Email</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-[#EFEDE6] border border-transparent rounded-lg focus:bg-white focus:border-[#CD0000] focus:outline-none focus:ring-2 focus:ring-[#CD0000]/20 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#1C1B19]/60 mb-1.5">Role</label>
            <select
              value={newStaff.role}
              onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
              className="px-3.5 py-2.5 text-sm bg-[#EFEDE6] border border-transparent rounded-lg focus:bg-white focus:border-[#CD0000] focus:outline-none focus:ring-2 focus:ring-[#CD0000]/20 transition-colors"
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-medium bg-[#CD0000] text-white rounded-lg hover:bg-[#A80000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Adding…" : "Add staff"}
          </button>
          {formError && (
            <p className="w-full text-sm text-[#CD0000] bg-[#CD0000]/5 px-3 py-2 rounded-lg mt-1">
              {formError}
            </p>
          )}
        </form>
      </div>

      {/* Staff list */}
      {loading ? (
        <div className="flex items-center gap-3 text-[#1C1B19]/50 py-8">
          <span className="w-4 h-4 border-2 border-[#CD0000] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading staff…</p>
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-12 text-[#1C1B19]/40">
          <p className="text-sm">No staff added yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {staff.map((member) => (
            <StaffCard
              key={member.userId}
              member={member}
              onRemove={handleRemove}
              onPermissionChange={handlePermissionChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StaffCard({ member, onRemove, onPermissionChange }) {
  const [expanded, setExpanded] = useState(false);
  const initials = (member.email || "?").slice(0, 2).toUpperCase();
  const isActive = member.status === "ACTIVE";

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#EFEDE6] flex items-center justify-center text-xs font-semibold text-[#1C1B19]/70 shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-medium text-[#1C1B19] text-sm">{member.email}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-[#1C1B19]/50">
                {ROLE_LABELS[member.role] || member.role}
              </span>
              <span className="text-[#1C1B19]/20">·</span>
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-green-700" : "text-[#1C1B19]/40"
                }`}
              >
                {isActive ? "Active" : member.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-xs font-medium text-[#1C1B19]/50 hover:text-[#1C1B19] transition-colors"
          >
            {expanded ? "Hide permissions" : "Permissions"}
          </button>
          <button
            onClick={() => onRemove(member.userId, member.email)}
            className="text-xs font-medium text-[#CD0000] hover:underline"
          >
            Remove
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-black/5 bg-[#EFEDE6]/40 px-4 py-4">
          <p className="text-xs font-medium text-[#1C1B19]/50 mb-3">Permission overrides</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PERMISSIONS.map((perm) => (
              <div
                key={perm}
                className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2 border border-black/5"
              >
                <span className="text-[#1C1B19]/80 font-mono">{perm}</span>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => onPermissionChange(member.userId, perm, "GRANT")}
                    className="px-2 py-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium"
                  >
                    Grant
                  </button>
                  <button
                    onClick={() => onPermissionChange(member.userId, perm, "REVOKE")}
                    className="px-2 py-1 rounded-md bg-[#CD0000]/5 text-[#CD0000] hover:bg-[#CD0000]/10 transition-colors font-medium"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}