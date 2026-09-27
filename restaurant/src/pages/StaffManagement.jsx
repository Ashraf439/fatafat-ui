import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { listStaff, addStaff, removeStaff, updateStaffPermission } from "../api/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

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
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Staff</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage who has access to your restaurant and what they can do.
        </p>
      </div>

      {/* Add staff form */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Invite staff</h2>
          <form onSubmit={handleAddStaff} className="flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1 space-y-1.5">
              <Label htmlFor="staff-email">Email</Label>
              <Input
                id="staff-email"
                type="email"
                required
                placeholder="name@example.com"
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={newStaff.role}
                onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r] || r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add staff"}
            </Button>
            {formError && (
              <p className="mt-1 w-full rounded-lg bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Staff list */}
      {loading ? (
        <div className="flex items-center gap-3 py-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <p className="text-sm">Loading staff…</p>
        </div>
      ) : staff.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground/70">
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
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{member.email}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{ROLE_LABELS[member.role] || member.role}</span>
              <span className="text-muted-foreground/40">·</span>
              <Badge variant={isActive ? "success" : "muted"} className="px-1.5 py-0">
                {isActive ? "Active" : member.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {expanded ? "Hide permissions" : "Permissions"}
          </button>
          <button
            onClick={() => onRemove(member.userId, member.email)}
            className="text-xs font-medium text-primary hover:underline"
          >
            Remove
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border bg-secondary/30 px-4 py-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground">Permission overrides</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PERMISSIONS.map((perm) => (
              <div
                key={perm}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs"
              >
                <span className="font-mono text-foreground/80">{perm}</span>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => onPermissionChange(member.userId, perm, "GRANT")}
                    className="rounded-md bg-green-50 px-2 py-1 font-medium text-green-700 transition-colors hover:bg-green-100"
                  >
                    Grant
                  </button>
                  <button
                    onClick={() => onPermissionChange(member.userId, perm, "REVOKE")}
                    className="rounded-md bg-destructive/5 px-2 py-1 font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
