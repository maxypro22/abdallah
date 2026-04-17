const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', decoded.id)
            .single();

        if (error || !user) {
            throw new Error('User not found');
        }

        req.token = token;
        req.user = user;
        req.user._id = user.id; // Compatibility with existing code that uses ._id
        console.log(`👤 Auth - User: ${user.email}, Role: ${user.role}, FirmID: ${user.law_firm_id}`);
        next();
    } catch (error) {
        console.error('Authentication Error:', error.message);
        // If it helps debugging:
        if (req.header('Authorization')) {
            console.error('Token received (partial):', req.header('Authorization').substring(0, 20) + '...');
        } else {
            console.error('No Authorization header received');
        }
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).send({ error: 'Access denied.' });
        }
        next();
    };
};

module.exports = { auth, checkRole };
