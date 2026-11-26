// Shared helpers for managing places and services ("the catalog") as ADMIN or PROVIDER.

/** Base route of the places area for a role: admins keep their existing routes, providers get /provider/places. */
export const placesHome = (role) => (role === 'PROVIDER' ? '/provider/places' : '/admin/places');

export const newPlacePath = (role) => (role === 'PROVIDER' ? '/provider/places/new' : '/places/new');

export const editPlacePath = (role, placeId) =>
  role === 'PROVIDER' ? `/provider/places/edit/${placeId}` : `/places/edit/${placeId}`;

export const servicesPath = (role, placeId) =>
  role === 'PROVIDER' ? `/provider/places/${placeId}/services` : `/admin/places/${placeId}/services`;

/** Roles that may create and manage places and services. */
export const canUseCatalog = (role) => role === 'ADMIN' || role === 'PROVIDER';

/** Human-readable message for an API error (axios error kept in rejectWithValue payloads). */
export const apiErrorMessage = (error, fallback = 'Something went wrong') => {
  const status = error?.response?.status;
  if (status === 403) return "You don't have permission to change this item.";
  if (status === 404) return 'This item no longer exists.';
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  return data?.message || error?.message || fallback;
};

/** "ADMIN" | "PROVIDER" for an item; items created before ownership tracking count as admin-created. */
export const creatorRole = (item) => (item?.createdByRole === 'PROVIDER' ? 'PROVIDER' : 'ADMIN');

/** Filters items by creator role: 'ALL' | 'ADMIN' | 'PROVIDER'. */
export const filterByCreator = (items, filter) =>
  filter === 'ALL' ? items : items.filter((item) => creatorRole(item) === filter);

export const CREATOR_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'PROVIDER', label: 'Provider' },
];
