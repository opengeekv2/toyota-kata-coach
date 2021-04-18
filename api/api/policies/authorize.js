const server = sails.config.oauth2orizeServer;

module.exports = server.authorize(function(clientId, redirectURI, done) {
    Client.findOne({clientId: clientId}, function(err, client) {
        if (err) { return done(err); }
        if (!client) { return done(null, false); }
        if (client.redirectURI != redirectURI) { return done(null, false); }
        return done(null, client, client.redirectURI);
    });
});