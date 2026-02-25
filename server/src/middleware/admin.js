const AdminMiddleware = (req, res, next) => {
    // This assumes you have auth middleware that attaches user to req
    // For now, let's assume it's after auth
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ ok: false, error: 'Access denied. Admin only.' });
    }
    next();
};

module.exports = AdminMiddleware;
