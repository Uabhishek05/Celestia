export function validateBody(schema) {
  return function validationMiddleware(req, res, next) {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: result.error.issues[0]?.message || "Invalid request payload"
      });
    }

    req.body = result.data;
    return next();
  };
}
