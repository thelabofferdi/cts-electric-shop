import { useQuery as useTanstackQuery, useQueryClient } from "@tanstack/react-query";
import { apiBaseUrl } from "@/lib/http";

const TOKEN_KEY = "cts_v2_access_token";

export const viewerRefetchInterval = () =>
  typeof window !== "undefined" && window.localStorage.getItem(TOKEN_KEY) ? 3000 : false;

export const endpoint = (reference: unknown, args: any = {}) => {
  const key = String(reference);
  const query = (values: Record<string, unknown>) => {
    const params = new URLSearchParams();
    for (const [name, value] of Object.entries(values)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) value.forEach((item) => params.append(name, String(item)));
      else params.set(name, String(value));
    }
    const serialized = params.toString();
    return serialized ? `?${serialized}` : "";
  };
  const id = args?.id ?? args?._id;
  const encoded = (value: unknown) => encodeURIComponent(String(value));
  const table: Record<string, { method: string; path: string; body?: unknown }> = {
    "users.viewer": { method: "GET", path: "/api/v1/auth/me" },
    "shop.getStorefront": { method: "GET", path: "/api/v1/public/shop" },
    "shop.getProductBySlug": { method: "GET", path: `/api/v1/public/shop/products/${encoded(args.slug)}` },
    "shop.submitReservation": { method: "POST", path: "/api/v1/public/shop/reservations", body: args },
    "shop.getAdminOverview": { method: "GET", path: "/api/v1/admin/shop/overview" },
    "shop.initializeCatalog": { method: "POST", path: "/api/v1/admin/shop/initialize" },
    "shop.generateProductImageUploadUrl": { method: "POST", path: "/api/v1/storage/upload-url" },
    "shop.discardProductImage": { method: "DELETE", path: `/api/v1/storage/${encoded(args.storageId)}` },
    "shop.saveProduct": {
      method: "PUT",
      path: `/api/v1/admin/shop/products/${encoded(args.id ?? args.product?.slug ?? "new")}`,
      body: args.product ?? args,
    },
    "shop.removeProduct": { method: "DELETE", path: `/api/v1/admin/shop/products/${encoded(args.id ?? id)}` },
    "shop.updateReservation": {
      method: "PATCH",
      path: `/api/v1/admin/shop/reservations/${encoded(args.id ?? id)}`,
      body: { status: args.status, adminNotes: args.adminNotes },
    },
    "shop.saveConfig": { method: "PUT", path: "/api/v1/admin/shop/config", body: args.value ?? args },
    "shopAppointments.getPublicConfig": { method: "GET", path: "/api/v1/public/shop/appointments/config" },
    "shopAppointments.getAvailableSlots": { method: "GET", path: `/api/v1/public/shop/appointments/slots${query(args)}` },
    "shopAppointments.create": { method: "POST", path: "/api/v1/public/shop/appointments", body: args },
    "shopAppointments.getAll": { method: "GET", path: "/api/v1/admin/shop/appointments" },
    "shopAppointments.saveConfig": { method: "PUT", path: "/api/v1/admin/shop/appointments/config", body: args.value ?? args },
    "shopAppointments.update": {
      method: "PATCH",
      path: `/api/v1/admin/shop/appointments/${encoded(args.id ?? id)}`,
      body: { status: args.status, requestedAt: args.requestedAt, adminNotes: args.adminNotes },
    },
  };
  const entry = table[key];
  if (!entry) throw new Error(`Endpoint non mappé pour la référence: ${key}`);
  return entry;
};

function shopRecord(value: any): any {
  if (!value || typeof value !== "object") return value;
  const result = { ...value };
  if (result.createdAt !== undefined && result.created_at === undefined) {
    result.created_at = result.createdAt;
  }
  return result;
}

function transform(value: any): any {
  if (Array.isArray(value)) return value.map(transform);
  if (!value || typeof value !== "object") return value;
  const result: Record<string, any> = {};
  for (const [key, item] of Object.entries(value)) {
    const mappedKey = key === "id" ? "_id" : key;
    result[mappedKey] = transform(item);
  }
  return result;
}

async function request(reference: unknown, args: any = {}) {
  const { method, path, body } = endpoint(reference, args);
  const token = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
  if (String(reference) === "users.viewer" && !token) return null;
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
  });
  if (!response.ok && !(String(reference) === "shop.getProductBySlug" && response.status === 404)) {
    const detail = (await response.json().catch(() => null))?.detail;
    throw new Error(detail ?? `Erreur API (${response.status})`);
  }
  if (response.status === 404 && String(reference) === "shop.getProductBySlug") return null;
  if (response.status === 204) return undefined;
  return responsePayload(reference, await response.json());
}

export function responsePayload(reference: unknown, payload: any): any {
  const key = String(reference);
  if (key === "shopAppointments.getAvailableSlots") {
    return Array.isArray(payload) ? payload : transform(payload?.slots ?? []);
  }
  if (key === "shop.getStorefront" || key === "shop.getAdminOverview") {
    const result = transform(payload);
    if (Array.isArray(result?.products)) result.products = result.products.map(shopRecord);
    if (Array.isArray(result?.reservations)) result.reservations = result.reservations.map(shopRecord);
    return result;
  }
  if (key === "shop.getProductBySlug") return shopRecord(transform(payload));
  if (key === "shopAppointments.getAll") return Array.isArray(payload) ? payload.map(shopRecord) : [];
  if (key === "shop.generateProductImageUploadUrl") return payload.uploadUrl;
  if (key === "users.viewer" && payload?.id) return transform(payload);
  return transform(payload?.settings ?? payload);
}

export function useQuery(reference: unknown, args: any = {}) {
  const enabled = args !== "skip";
  const query = useTanstackQuery({
    queryKey: [String(reference), args],
    queryFn: () => request(reference, args).catch((error) => {
      if (String(reference) === "users.viewer") return null;
      throw error;
    }),
    enabled,
    refetchInterval: reference === "users.viewer" ? viewerRefetchInterval : false,
    retry: false,
  });
  return enabled ? query.data : undefined;
}

export function useMutation(reference: unknown) {
  const client = useQueryClient();
  return async (args: any = {}) => {
    const result = await request(reference, args);
    await client.invalidateQueries();
    return result;
  };
}

export function useConvexAuth() {
  const viewer = useTanstackQuery({
    queryKey: ["shop-auth-viewer"],
    queryFn: () => request("users.viewer").catch(() => null),
    refetchInterval: viewerRefetchInterval,
    retry: false,
  });
  return { isLoading: viewer.isPending, isAuthenticated: Boolean(viewer.data) };
}
