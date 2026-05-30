import type { RequestHandler } from "express";

export function loggerMiddleware(): RequestHandler {
  return (req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const ms = Date.now() - start;
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify({
          level: "info",
          msg: "http_request",
          requestId: res.locals.requestId,
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: ms
        })
      );
    });
    next();
  };
}

