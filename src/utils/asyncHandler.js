// Wraps your async function to automatically catch errors and pass them to the Express error handler.
// No need for try/catch inside every route.

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
