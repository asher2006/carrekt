const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack || err.message);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large. Max 10MB allowed.' });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const status = err.status || 500;
  const message = isProduction && status === 500
    ? 'Internal server error'
    : err.message || 'Internal server error';

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;

