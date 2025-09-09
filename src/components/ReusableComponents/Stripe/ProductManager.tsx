"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  createStripeProduct,
  getAllProductsFromStripeSettings,
  toggleStripeProductActive,
  deleteStripeProduct,
} from "@/actions/stripe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface StripePrice {
  id: string;
  unit_amount: number | null;
  currency: string;
}

interface StripeProduct {
  id: string;
  name: string;
  description?: string | null;
  default_price?: StripePrice | string | null;
  active: boolean;
  created: number;
}

const ProductManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getAllProductsFromStripeSettings();
      if (res.success) {
        setProducts(res.products || []);
      } else {
        toast.error(res.error || "Failed to fetch products");
      }
    } catch (e) {
      toast.error("Unexpected error fetching products");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return toast.error("Name & price required");
    const amount = parseFloat(price);
    if (isNaN(amount) || amount <= 0) return toast.error("Invalid price");
    try {
      setCreating(true);
      const res = await createStripeProduct(
        name,
        amount,
        currency,
        description || undefined
      );
      if (res.success) {
        toast.success("Product created");
        setName("");
        setPrice("");
        setDescription("");
        await fetchProducts();
      } else {
        toast.error(res.error || "Failed to create");
      }
    } catch (e) {
      toast.error("Unexpected error creating product");
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleProduct = async (
    productId: string,
    currentActive: boolean
  ) => {
    try {
      setActingId(productId);
      const res = await toggleStripeProductActive(productId, !currentActive);
      if (res.success) {
        toast.success(`Product ${currentActive ? "deactivated" : "activated"}`);
        await fetchProducts();
      } else {
        toast.error(res.error || "Action failed");
      }
    } catch (e) {
      toast.error("Unexpected error updating product");
      console.error(e);
    } finally {
      setActingId(null);
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const requestDelete = (productId: string) => {
    setPendingDeleteId(productId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const productId = pendingDeleteId;
    try {
      setActingId(productId);
      const res = await deleteStripeProduct(productId);
      if (res.success) {
        if (res.deleted) {
          toast.success("Product deleted");
        } else if (res.archived) {
          toast.success(res.message || "Product archived");
        } else {
          toast.success("Operation completed");
        }
        await fetchProducts();
      } else {
        toast.error(res.error || "Delete failed");
      }
    } catch (e) {
      toast.error("Unexpected error deleting product");
      console.error(e);
    } finally {
      setActingId(null);
      setDeleteDialogOpen(false);
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={onCreate}
        className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Premium Webinar"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium">
            Price (in {currency.toUpperCase()})
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="19.99"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium">Currency</label>
          <Input
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            placeholder="USD"
          />
        </div>
        <div className="flex flex-col gap-1 md:col-span-4">
          <label className="text-xs font-medium">Description (optional)</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
          />
        </div>
        <div className="md:col-span-4 flex gap-2">
          <Button
            type="submit"
            disabled={creating}
            className="flex items-center gap-2"
          >
            {creating && <Loader2 className="h-4 w-4 animate-spin" />}
            <Plus className="h-4 w-4" /> Create Product
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </form>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && products.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Loading products...
          </div>
        )}
        {!loading && products.length === 0 && (
          <div className="text-sm text-muted-foreground">No products yet.</div>
        )}
        {products.map((p) => {
          const defaultPrice =
            typeof p.default_price === "object" && p.default_price
              ? (p.default_price as StripePrice)
              : undefined;
          return (
            <Card key={p.id} className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm truncate" title={p.name}>
                  {p.name}
                </h4>
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded font-medium tracking-wide inline-flex items-center gap-1 border",
                    p.active
                      ? "bg-green-500/10 text-green-500 border-green-500/30"
                      : "bg-red-500/10 text-red-500 border-red-500/30"
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      p.active ? "bg-green-500" : "bg-red-500"
                    )}
                  />
                  {p.active ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              {defaultPrice && (
                <div className="text-xs font-mono">
                  {(defaultPrice.unit_amount ?? 0) / 100}{" "}
                  {defaultPrice.currency.toUpperCase()}
                </div>
              )}
              {p.description && (
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {p.description}
                </p>
              )}
              <div className="mt-auto flex flex-col gap-1">
                <code className="text-[10px] bg-muted px-2 py-1 rounded">
                  Product: {p.id}
                </code>
                {defaultPrice && (
                  <code className="text-[10px] bg-muted px-2 py-1 rounded">
                    Price: {defaultPrice.id}
                  </code>
                )}
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={actingId === p.id}
                    onClick={() => handleToggleProduct(p.id, p.active)}
                    className="h-7 px-2 text-[11px]"
                  >
                    {actingId === p.id && (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    )}
                    {p.active ? "Deactivate" : "Activate"}
                  </Button>
                  <AlertDialog
                    open={deleteDialogOpen && pendingDeleteId === p.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        setDeleteDialogOpen(false);
                        setPendingDeleteId(null);
                      }
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={actingId === p.id}
                        onClick={() => requestDelete(p.id)}
                        className="h-7 px-2 text-[11px]"
                      >
                        {actingId === p.id && (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        )}
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete product?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action is irreversible. If the product cannot be
                          fully deleted it will be archived instead.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={actingId === p.id}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          disabled={actingId === p.id}
                          onClick={confirmDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {actingId === p.id ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin" />{" "}
                              Deleting...
                            </span>
                          ) : (
                            "Confirm"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {/* Global delete dialog for accessibility fallback (hidden trigger) */}
    </div>
  );
};

export default ProductManager;
