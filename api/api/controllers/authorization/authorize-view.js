
module.exports = {


  friendlyName: 'Authorize view',


  description: 'Display authorization for Google to access user data.',


  inputs: {
    client_id: {
      type: 'string',
      required: true
    },
    redirect_uri: {
      type: 'string',
      required: true
    },
    state: {
      type: 'string',
      required: true
    },
    response_type: {
      type: 'string'
    }
  },


  exits: {
    success: {
      viewTemplatePath: 'pages/authorization/authorize'
    },
    redirect: {
      responseType: 'redirect',
      description: ''
    }
  },


  fn: async function () {
    return {
      transactionID: this.req.oauth2.transactionID,
      user: this.req.user,
      client: this.req.oauth2.client,
      jwtToken: this.req.query.token
    };

  }


};
