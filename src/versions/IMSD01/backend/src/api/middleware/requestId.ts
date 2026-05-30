import crypto from "node:crypto";
import type { RequestHandler } from "express";

const REQUEST_ID_HEADER = "x-request-id";

export type RequestIdLocals = {
  requestId: string;
};

export function requestIdMiddleware(): RequestHandler {
  return (req, res, next) => {
    const incoming = req.header(REQUEST_ID_HEADER) ?? undefined;
    const requestId = incoming && incoming.trim().length ? incoming.trim() : crypto.randomUUID();

    res.locals.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);
    next();
  };
}
