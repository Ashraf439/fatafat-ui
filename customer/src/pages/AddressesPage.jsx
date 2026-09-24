import { useState } from "react";
import { Loader2, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/States";
import { AddressFormDialog } from "@/features/addresses/AddressFormDialog";
import { AddressSummary } from "@/features/addresses/AddressSummary";
import { useAddresses, useDeleteAddress, useSetDefaultAddress } from "@/features/addresses/queries";

export default function AddressesPage() {
  const addresses = useAddresses();
  const setDefault = useSetDefaultAddress();
  const remove = useDeleteAddress();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (address) => {
    setEditing(address);
    setFormOpen(true);
  };

  const makeDefault = async (address) => {
    try {
      await setDefault.mutateAsync(address.id);
      toast.success("Default address updated");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmDelete = async () => {
    try {
      await remove.mutateAsync(toDelete.id);
      toast.success("Address removed");
      setToDelete(null);
    } catch (err) {
      toast.error(err.message);
      setToDelete(null);
    }
  };

  const list = addresses.data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Saved addresses</h1>
          <p className="text-sm text-muted-foreground">Manage where your orders get delivered.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus /> Add address
        </Button>
      </div>

      {addresses.isError ? (
        <ErrorState error={addresses.error} onRetry={() => addresses.refetch()} />
      ) : addresses.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          description="Add an address to speed up checkout."
          action={<Button onClick={openCreate}>Add address</Button>}
        />
      ) : (
        <ul className="space-y-3">
          {list.map((a) => (
            <li key={a.id}>
              <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <AddressSummary address={a} />
                  {a.isDefault && (
                    <Badge variant="success">
                      <Star /> Default
                    </Badge>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {!a.isDefault && (
                    <Button variant="outline" size="sm" onClick={() => makeDefault(a)} disabled={setDefault.isPending}>
                      Make default
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => openEdit(a)}>
                    <Pencil /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setToDelete(a)}
                    disabled={list.length <= 1}
                    title={list.length <= 1 ? "You need at least one address" : undefined}
                  >
                    <Trash2 /> Remove
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <AddressFormDialog open={formOpen} onOpenChange={setFormOpen} address={editing} isFirst={list.length === 0} />

      <Dialog open={Boolean(toDelete)} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent showClose={false}>
          <DialogHeader>
            <DialogTitle>Remove this address?</DialogTitle>
            <DialogDescription>Past orders keep their delivery details. This can't be undone.</DialogDescription>
          </DialogHeader>
          {toDelete && <AddressSummary address={toDelete} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={remove.isPending}>
              {remove.isPending && <Loader2 className="animate-spin" />} Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
