const bcrypt = require('bcrypt'),
    passport = require('passport'),
    moment = require('moment'),
    BearerStrategy = require('passport-http-bearer').Strategy,
    BasicStrategy = require('passport-http').BasicStrategy,
    LocalStrategy = require('passport-local').Strategy,
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;

passport.use(new LocalStrategy({
        usernameField: 'emailAddress',
        passwordField: 'password'
    },
    async function (user, password, done) {
        const userInstance = await (async () => {
            try {
                return await User.findOne({ 'emailAddress': user });
            } catch (err) {
                done(err);
            }
        })();
        if (!userInstance) {
            return done(null, false, { message: 'Incorrect username.' }); 
        }
        try {
          const result = bcrypt.compare(password, userInstance.password);
          if (result) {
            return done(null, userInstance)
          } else { 
            return done( null, false, { message: 'Invalid password' });
          }
        } catch (err) {
          return done(err, null);
        }
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(async function(id, done) {
    const user = await (async () => {
        try {
            return await User.findOne({ id: id });
        }
        catch (err) {
            done(err);
        }
    })();
    done(null, user);
});

passport.use(new BasicStrategy(
    function (username, password, done) {

        User.findOne({
            email: username
        }, function (err, user) {
    
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
            bcrypt.compare(password, user.hashedPassword, function(err, res){
              if(err){
                return done(err, null);
              } else { 
                if (!res) {
                  return done( null, false, { message: 'Invalid password' });
                } else { 
                  return done(null, user);
                } 
              } 
            });
        });
    }));

passport.use(new ClientPasswordStrategy(

  function (clientId, clientSecret, done) {
  
      Client.findOne({
          clientId: clientId
      }, function (err, client) {
          if (err) {
              return done(err);
          }
          if (!client) {
              return done(null, false);
          }
          if (client.clientSecret != clientSecret) {
              return done(null, false);
          }
          return done(null, client);
      });
  }));

  passport.use(new BearerStrategy(
    function(accessToken, done) {
      AccessToken.findOne({token:accessToken}).populate('user').exec(function(err, token) {
        if (err) { return done(err); }
        if (!token) { return done(null, false); }
  
        var now = moment().unix();
        var creationDate = moment(token.createdAt).unix();
  
        if( now - creationDate > sails.config.custom.oauth.tokenLife ) {
          AccessToken.destroy({ token: accessToken }, function (err) {
            if (err) return done(err);
           });
           console.log('Token expired');
           return done(null, false, { message: 'Token expired' });
         }
  
         var info = {scope: '*'};
         User.findOne({
           id: token.user.id
         })
         .exec(function (err, user) {
           User.findOne({
             id: token.user.id
           },done(err,user,info));
         });
      });
    }
  ));