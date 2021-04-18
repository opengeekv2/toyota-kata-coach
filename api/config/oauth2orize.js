const oauth2orize = require('oauth2orize');
const server = oauth2orize.createServer();

server.serializeClient(function(client, done) {
  return done(null, client.id);
});

server.deserializeClient(function(id, done) {
  Client.findOne(id, function(err, client) {
    if (err) { return done(err); }
      return done(null, client);
    });
});

server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done) {
  AuthorizationCode.create({
    client: client.id,
    redirectURI: redirectURI,
    user: user.id,
    scope: ares.scope
  }).fetch().exec(function(err,code){
    if(err){return done(err,null);}
    return done(null,code.code);
  });
}));

server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
  AuthorizationCode.findOne({
                     code: code
                   }).populate('client').populate('user').exec(function(err,code){
                     if(err || !code) {
                       return done(err);
                     }
                     if (client.clientId !== code.client.clientId) {
                       return done(null, false);
                     }
                     if (redirectURI !== code.redirectURI) {
                       return done(null, false);
                     }
                     // Remove Refresh and Access tokens and create new ones
                     RefreshToken.destroy({ user: code.user.id, client: code.client.id }, function (err) {
                       if (err) {
                         return done(err);
                       } else {
                         AccessToken.destroy({ user: code.user.id, client: code.client.id }, function (err) {
                           if (err){
                             return done(err);
                           } else {
                             RefreshToken.create({ user: code.user.id, client: code.client.id }).fetch().exec(function(err, refreshToken){
                               if(err){
                                 return done(err);
                               } else {
                                 AccessToken.create({ user: code.user.id, client: code.client.id }).fetch().exec(function(err, accessToken){
                                   if(err) {
                                     return done(err);
                                   } else {
                                     return done(null, accessToken.token, refreshToken.token, { 'expires_in': sails.config.custom.oauth.tokenLife });
                                   }
                                 });
                               }
                             });
                           }
                         });
                       }
                     });

                   });
}));

server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {

  RefreshToken.findOne({ token: refreshToken }).populate('user').populate('client').exec(function(err, token) {

      if (err) { return done(err); }
      if (!token) { return done(null, false); }
      if (!token) { return done(null, false); } 
      RefreshToken.destroy({ user: token.user.id, client: token.client.id }, function (err) {
        if (err) {
          return done(err);
        } else {
          AccessToken.destroy({ user: token.user.id, client: token.client.id }, function (err) {
            if (err){ 
              return done(err);
            } else {
              RefreshToken.create({ user: token.user.id, client: token.client.id }).fetch().exec(function(err, refreshToken){
                if(err){
                  return done(err);
                } else {
                  AccessToken.create({ user: token.user.id, client: token.client.id }).fetch().exec(function(err, accessToken){
                    if(err) {
                      return done(err);
                    } else {
                      done(null, accessToken.token, refreshToken.token, { 'expires_in': sails.config.custom.oauth.tokenLife });
                    }
                  });
                }
              });
            }
          });
        }
      });
  });
}));

module.exports.oauth2orizeServer = server;