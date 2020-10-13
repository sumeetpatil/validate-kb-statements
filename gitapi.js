const request = require('sync-request');
const logger = require('./logger');
const getHttpHeader = function (userName, password) {
  var headers = {};
  if (userName != null && password != null) {
    var auth = 'Basic ' + Buffer.from(userName + ':' + password).toString('base64');
    headers = { 'user-agent': 'node.js', 'Authorization': auth };

  } else {
    headers = { 'user-agent': 'node.js' };
  }

  return headers;
}
exports.isBranch = function (userName, password, repo, branch) {
  const url = "https://api.github.com/repos" + repo + "/branches/" + branch;
  const res = request('GET', url, {
    headers: getHttpHeader(userName, password),
  });
  try{
      if (JSON.parse(res.getBody().toString('utf8')).commit) {
        return true;
      }
  }catch(err){
    console.error("http error calling "+url+" with status code "+err.statusCode+" for repo "+repo+" and branch "+branch);
    return false;
  }
  return false;
}

exports.isCommit = function (userName, password, repo, commit) {
  const url = "https://api.github.com/repos" + repo + "/commits/" + commit;
  const res = request('GET', url, {
    headers: getHttpHeader(userName, password),
  });

  try{
    if (JSON.parse(res.getBody().toString('utf8')).commit) {
      return true;
    }
  }catch(err){
    console.error("http error calling "+url+" with status code "+err.statusCode+" for repo "+repo+" and commit "+commit);
    return false;
  }
  return false;
}

exports.isRepository = function (userName, password, repo) {
  const url = "https://api.github.com/repos" + repo;
  const res = request('GET', url, {
    headers: getHttpHeader(userName, password),
  });

  try{
    if (JSON.parse(res.getBody().toString('utf8')).name) {
      return true;
    }
  }catch(err){
    console.error("http error calling "+url+" with status code "+err.statusCode+" for repo "+repo);
    return false;
  }
  return false;
}
