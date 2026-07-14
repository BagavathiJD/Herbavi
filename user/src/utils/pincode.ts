export interface PincodeLocation {
  pincode: string;
  district: string;
  state: string;
  label: string;
}

type PostalApiOffice = {
  District?: string;
  State?: string;
};

type PostalApiResponse = {
  Status?: string;
  PostOffice?: PostalApiOffice[];
};

const POSTAL_API_BASE = 'https://api.postalpincode.in/pincode';

function getPostalLookupUrls(code: string): string[] {
  return [`/api/pincode/${code}`, `/postal-api/pincode/${code}`, `${POSTAL_API_BASE}/${code}`];
}

function formatPlaceName(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function parsePostalPincodePayload(
  payload: unknown,
  code: string,
): PincodeLocation | null {
  const rows = Array.isArray(payload) ? payload : [];
  const result = rows[0] as PostalApiResponse | undefined;

  if (!result || result.Status !== 'Success' || !result.PostOffice?.length) {
    return null;
  }

  const office = result.PostOffice[0];
  const district = formatPlaceName(office.District?.trim() || '');
  const state = formatPlaceName(office.State?.trim() || '');

  return {
    pincode: code,
    district,
    state,
    label: district && state ? `${district}, ${state}` : district || state || code,
  };
}

async function fetchWithTimeout(url: string, timeoutMs = 12000): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

async function fetchFromUrl(code: string, url: string): Promise<PincodeLocation | null> {
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      return null;
    }

    const payload = await res.json().catch(() => null);
    return parsePostalPincodePayload(payload, code);
  } catch {
    return null;
  }
}

export async function fetchPincodeLocation(pincode: string): Promise<PincodeLocation> {
  const code = pincode.replace(/\D/g, '');
  if (code.length !== 6) {
    throw new Error('Please enter a valid 6-digit pincode.');
  }

  for (const url of getPostalLookupUrls(code)) {
    const location = await fetchFromUrl(code, url);
    if (location) {
      return location;
    }
  }

  throw new Error('Pincode not found. Please check and try again.');
}

export function getDeliveryEstimate(
  pincode: string,
  location?: Pick<PincodeLocation, 'district' | 'state' | 'label'>,
) {
  const code = pincode.replace(/\D/g, '');
  if (code.length !== 6) return null;

  const leadDays = 3 + (Number(code[0]) % 4);
  const deliveryDate = new Date();
  let added = 0;
  while (added < leadDays) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    const day = deliveryDate.getDay();
    if (day !== 0) added += 1;
  }

  return {
    pincode: code,
    district: location?.district ?? '',
    state: location?.state ?? '',
    locationLabel: location?.label ?? '',
    leadDays,
    label: deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    }),
  };
}
