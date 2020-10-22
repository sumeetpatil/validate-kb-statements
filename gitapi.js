const request = require('sync-request');
const logger = require('./logger');
const getHttpHeader = function (token) {
  var headers = {};
  if (token != null) {
    var auth = 'token ' + token;
    headers = { 'user-agent': 'node.js', 'Authorization': auth };

  } else {
    headers = { 'user-agent': 'node.js' };
  }

  return headers;
}
exports.isBranch = function (token, repo, branch) {
  const url = "https://api.github.com/repos" + repo + "/branches/" + branch;
  const res = request('GET', url, {
    headers: getHttpHeader(token),
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

exports.isCommit = function (token, repo, commit) {
  const url = "https://api.github.com/repos" + repo + "/commits/" + commit;
  const res = request('GET', url, {
    headers: getHttpHeader(token),
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
exports.isCommitHasABranch = function (token, repo, commit) {
  const url = "https://github.com" + repo + "/branch_commits/" + commit;

  let status = {};
  let body = {};
  try {
    const res = request('GET', url, {
      headers: getHttpHeader(token),
    });

    body = res.getBody().toString('utf8');
    if (body.search("This commit does not belong to any branch on this repository") == -1) {
      status.type = "success";
      return status;
    }
  }catch(err){
    status.type = "error";
    status.httpcode = err.statusCode;
    status.body = err.body;
    return status;
  }

  status.body = commit+ " does not have branch, ";
  if(body.search("branches-tag-list") >=0){
    status.body += commit+"but commit has tags";
  }

  status.httpcode = 404;
  status.type = "error";
  return status;
}
exports.isRepository = function (token, repo) {
  const url = "https://api.github.com/repos" + repo;
  const res = request('GET', url, {
    headers: getHttpHeader(token),
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
