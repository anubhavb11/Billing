import { createApi } from "../lib/bills-api.mjs";
import { getPool } from "../lib/db.mjs";

const handle = createApi({ getPool, getPin: () => process.env.SHOP_PIN });

export default (req) => handle(req);

export const config = {
  path: [
    "/api/ping",
    "/api/bills",
    "/api/bills/:billNo",
    "/api/bills/:billNo/sent",
    "/api/public/bills/:token",
    "/api/settings",
    "/api/catalog",
    "/api/catalog/rules",
    "/api/bills/:billNo/track",
    "/api/cash/handover",
    "/api/khata/payments",
    "/api/khata/payments/:id",
    "/api/delivery/orders",
    "/api/delivery/orders/:billNo/step",
    "/api/delivery/location",
  ],
};
