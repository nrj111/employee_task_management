export function notFound(_req, res) { res.status(404).json({ message: 'The requested API route was not found.' }); }

export function errorHandler(error, _req, res, _next) {
  if (error.code === 11000) return res.status(409).json({ message: 'An employee with this email already exists.' });
  if (error.name === 'CastError') return res.status(400).json({ message: 'The supplied record ID is invalid.' });
  if (error.name === 'ValidationError') return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(' ') });
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ message: status >= 500 ? 'Something went wrong. Please try again.' : error.message });
}
