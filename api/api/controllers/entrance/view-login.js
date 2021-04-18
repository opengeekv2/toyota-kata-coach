module.exports = {


  friendlyName: 'View login',


  description: 'Display "Login" page.',

  inputs: {
    redirect: {
      type: 'string'
    }
  },

  exits: {

    success: {
      viewTemplatePath: 'pages/entrance/login',
    },

    redirect: {
      description: 'The requesting user is already logged in.',
      responseType: 'redirect'
    }

  },


  fn: async function ({redirect}) {

    if (this.req.isAuthenticated()) {
      throw {redirect: '/'};
    }

    return {
      redirect: redirect,
      message: false
    };

  }


};
