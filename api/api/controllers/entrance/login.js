const passport = require("passport");

module.exports = async function login(req, res) {
    passport.authenticate('local', function(err, user, info) {
      if (info) {
        info.redirect = req.param('redirect');
        if (err == null && !user) {
          res.view('pages/entrance/login', info )
          return;
        }
        if ((err) || (!user)) {
          res.view('pages/entrance/login', info )
          return;
        }
      }
  
      req.logIn(user, function(err) {
        if (err) {
          console.log('err login');
          console.log(err);
          res.view();
          return;
        }

        res.redirect(req.param('redirect'));
        return;
      })
    })(req, res);
};
