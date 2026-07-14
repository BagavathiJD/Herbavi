import { Router, Request, Response, NextFunction } from "express";

const router = Router();

type PostalApiOffice = {
  District?: string;
  State?: string;
};

type PostalApiResponse = {
  Status?: string;
  PostOffice?: PostalApiOffice[];
};

const POSTAL_API_BASE = "https://api.postalpincode.in/pincode";

function formatPlaceName(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parsePostalPayload(payload: unknown, code: string) {
  const rows = Array.isArray(payload) ? payload : [];
  const result = rows[0] as PostalApiResponse | undefined;

  if (!result || result.Status !== "Success" || !result.PostOffice?.length) {
    return null;
  }

  const office = result.PostOffice[0];
  const district = formatPlaceName(office.District?.trim() || "");
  const state = formatPlaceName(office.State?.trim() || "");

  return {
    pincode: code,
    district,
    state,
    label: district && state ? `${district}, ${state}` : district || state || code,
  };
}

async function fetchPostalPincode(code: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${POSTAL_API_BASE}/${code}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return { error: "Pincode service is temporarily unavailable.", status: 502 as const };
    }

    const payload = await response.json().catch(() => null);
    const location = parsePostalPayload(payload, code);

    if (!location) {
      return { error: "Pincode not found. Please check and try again.", status: 404 as const };
    }

    return { location, status: 200 as const };
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "AbortError";
    return {
      error: isTimeout
        ? "Pincode lookup timed out. Please try again."
        : "Unable to reach pincode service. Please try again.",
      status: 502 as const,
    };
  } finally {
    clearTimeout(timeout);
  }
}

router.get("/:code", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = String(req.params.code).replace(/\D/g, "");
    if (code.length !== 6) {
      res.status(400).json({ error: "Please enter a valid 6-digit pincode." });
      return;
    }

    const result = await fetchPostalPincode(code);

    if (result.status !== 200 || !("location" in result) || !result.location) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    res.json(result.location);
  } catch (err) {
    next(err);
  }
});

export default router;
