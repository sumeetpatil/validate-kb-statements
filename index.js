const fs = require('fs')
const yaml = require('js-yaml');
const path = require('path');
const git = require('./gitapi');
const dir = process.argv[2];
const userName = process.argv[3];
const password = process.argv[4];

const getDirectories = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dir => dir.isDirectory())
    .map(dir => dir.name);

const dirs = getDirectories(dir);

for (const i in dirs) {
  const statementPath = path.join(dir, dirs[i], "statement.yaml");
  const file = fs.readFileSync(statementPath, 'utf8');
  const statement = yaml.safeLoad(file);
  console.log("Analysis for "+ statement.vulnerability_id);
  const fixes = statement.fixes;
  if (fixes) {
    for (const fixIndex in fixes) {
      const branch = fixes[fixIndex].id;
      const commits = fixes[fixIndex].commits;
      if (commits) {
        for (const commitIndex in commits) {
          const commitId = commits[commitIndex].id;
          const commitRepo = commits[commitIndex].repository;
          let repo = null;
          if (commitRepo.endsWith(".git")) {
            repo = commitRepo.replace("https://github.com", "").replace(".git", "");
          } else {
            repo = commitRepo.replace("https://github.com", "");
            if (repo.endsWith("/")) {
              repo = repo.slice(0, -1);
            }
          }
          if(git.isRepository(userName, password, repo)){
            git.isCommit(userName, password, repo, commitId);
            if(branch=="DEFAULT_BRANCH"){
              continue;
            }
            git.isBranch(userName, password, repo, branch);
          }
        }
      }
    }
  }
}

