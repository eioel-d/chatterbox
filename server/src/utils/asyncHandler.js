export const asyncHandler = (fn) => (req, res) =>
  fn(req, res).catch((e) => res.status(400).json({ error: e.message }));
