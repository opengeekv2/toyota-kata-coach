var passport = require('passport');

module.exports = function(req, res, next) {
	passport.authenticate(
	    ['bearer'],
	    function(err, user, info)
	    {
	        if ((err) || (!user))
	        {
	            return next();
	        }
            delete req.query.access_token;
	        req.user = user;
	        return next();
	    }
	)(req, res);
};