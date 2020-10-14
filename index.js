const fs = require('fs')
const yaml = require('js-yaml');
const path = require('path');
const Excel = require('exceljs');
const git = require('./gitapi');
const purl = require('packageurl-js');

const dir = process.argv[2];
const userName = process.argv[3];
const password = process.argv[4];

const workbook = new Excel.Workbook();
const worksheet = workbook.addWorksheet("Validate Statements", {});
worksheet.columns = [
  { header: 'Vulnerability ID', key: 'vulnerabilityId' },
  { header: 'Error Repository', key: 'repositoryError' },
  { header: 'Error Commit', key: 'commitsError' },
  { header: 'Error Branch', key: 'branchError' },
  { header: 'Error PURL', key: 'purlError' },
  { header: 'Error Log', key: 'errorLog' }
];

const getDirectories = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dir => dir.isDirectory())
    .map(dir => dir.name);

const dirs = getDirectories(dir);
let repositoryError = {};
for (const i in dirs) {
  let analysis = {};
  const statementPath = path.join(dir, dirs[i], "statement.yaml");
  const file = fs.readFileSync(statementPath, 'utf8');
  const statement = yaml.safeLoad(file);
  analysis.vulnerabilityId = statement.vulnerability_id;
  const fixes = statement.fixes;
  let isError = false;
  analysis.repositoryError = "";
  analysis.commitsError = "";
  analysis.branchError = "";
  analysis.errorLog = "";
  analysis.purlError = "";
  let errorLog = {};
  let analysisRepositoryError = {};
  let analysisBranchError = {};


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

          const repoStatus = git.isRepository(userName, password, repo);
          if (!repositoryError[commitRepo] && repoStatus.type == "success") {
            const commitStatus = git.isCommit(userName, password, repo, commitId);
            if (commitStatus.type == "error") {
              errorLog[analysis.errorLog + "git api failed to get " + commitId + " with http status code " + commitStatus.httpcode] = 1;
              analysis.commitsError = analysis.commitsError + commitId + ",";
              isError = true;
            }

            if (branch == "DEFAULT_BRANCH") {
              continue;
            }
            const branchStatus = !analysisBranchError[branch] && git.isBranch(userName, password, repo, branch);

            if (branchStatus && branchStatus.type == "error") {
              errorLog[analysis.errorLog + "git api failed to get branch " + branch + " with http status code " + branchStatus.httpcode] = 1;
              isError = true;
              analysisBranchError[branch] = 1;
            }
          } else {
            repositoryError[commitRepo] = 1;
            analysisRepositoryError[commitRepo] = 1;
            isError = true;
            errorLog["git api failed to get " + commitRepo + " with http status code " + repoStatus.httpcode] = 1;
          }
        }
      }
    }
  }

  const artifacts = statement.artifacts;
  for(var artifactIndex in artifacts){
    try{
      purl.PackageURL.fromString(artifacts[artifactIndex].id);
    }catch(err){
      analysis.purlError = analysis.purlError+artifacts[artifactIndex].id;
    }
  }

  let errorLogs = Object.keys(errorLog);
  for(const keyIndex in errorLogs){
    analysis.errorLog+=errorLogs[keyIndex] + ",";
  }

  let analysisRepositoryErrors = Object.keys(analysisRepositoryError);
  for(const keyIndex in analysisRepositoryErrors){
    analysis.repositoryError+=analysisRepositoryErrors[keyIndex] + ",";
  }

  let analysisBranchErrors = Object.keys(analysisBranchError);
  for(const keyIndex in analysisBranchErrors){
    analysis.branchError+=analysisBranchErrors[keyIndex] + ",";
  }

  if (isError) {
    worksheet.addRow(analysis);
    console.error("Analysis for " + statement.vulnerability_id + " is completed with errors");
  } else {
    console.log("Analysis for " + statement.vulnerability_id + " is completed");
  }

  console.log("Total processed " + i);
}

workbook.xlsx
  .writeFile("output.xlsx")
  .then(
    () => {
      console.log("Workbook saved. Please check output.xlsx");
    }
  )
  .catch(
    (error) => {
      console.log("Something went wrong while creating workbook.");
      console.log(error.message);
    }
  );

