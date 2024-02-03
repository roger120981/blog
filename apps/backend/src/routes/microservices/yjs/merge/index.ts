import { fromUint8Array, toUint8Array } from "js-base64";
import * as Y from "yjs";

import { getJwtPayloadFromRequest } from "@lib/jwt/getJwtPayloadFromRequest";
import type { Env } from "@lib/types/env";

export default async function merge(
  request: Request,
  env: Env,
): Promise<Response> {
  const payload = await getJwtPayloadFromRequest(request, env);
  if (!payload) return new Response("Invalid JWT.", { status: 400 });

}
