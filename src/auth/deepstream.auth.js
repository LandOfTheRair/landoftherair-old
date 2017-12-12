
/**
 *  This is hosted by webtask.io to allow authentication via deepstream.
 */
var uuid = require('uuid').v4;

module.exports = function(context, cb) {
  if(!context.data) return;

  var serverToken = context.secrets.SERVER_TOKEN;
  var authData = context.body.authData;
  var generatedId = uuid();

  if(authData && authData.token && authData.token === serverToken) {

    var serverId = authData.map || generatedId;

    cb(null, {
      username: serverId,
      clientData: { id: serverId },
      serverData: { hasAuthority: true }
    });

    return;

  }

  cb(null, {
    username: generatedId,
    clientData: { id: generatedId },
    serverData: { }
  });

};
