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

  let status = {};
  try {
    if (JSON.parse(res.getBody().toString('utf8')).name) {
      status.type = "success";
      return status;
    }
  } catch (err) {
    status.type = "error";
    status.httpcode = err.statusCode;
    status.body = err.body;
    return status;
  }
  status.type = "error";
  return status;
}

exports.isCommit = function (userName, password, repo, commit) {
  const url = "https://api.github.com/repos" + repo + "/commits/" + commit;
  const res = request('GET', url, {
    headers: getHttpHeader(userName, password),
  });

  let status = {};
  try {
    if (JSON.parse(res.getBody().toString('utf8')).commit) {
      status.type = "success";
      return status;
    }
  } catch (err) {
    status.type = "error";
    status.httpcode = err.statusCode;
    status.body = err.body;
    return status;
  }
  status.type = "error";
  return status;
}

exports.isRepository = function (userName, password, repo) {
  const url = "https://api.github.com/repos" + repo;
  const res = request('GET', url, {
    headers: getHttpHeader(userName, password),
  });

  let status = {};
  try {
    if (JSON.parse(res.getBody().toString('utf8')).name) {
      status.type = "success";
      return status;
    }
  } catch (err) {
    status.type = "error";
    status.httpcode = err.statusCode;
    status.body = err.body;
    return status;
  }
  status.type = "error";
  return status;
}
