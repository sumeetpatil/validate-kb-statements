# Validate Project-Kb statements
Command line tool used to generate report for invalid kaybee statements - [kb-statements](https://github.com/SAP/project-kb/tree/vulnerability-data/statements)

## What does the CLI tool report in project-kb statements
1. Invalid git commits in statements
2. Invalid git branch in statements
3. Invalid git repository in statements
4. Invalid artifact PURLs

## Steps to generate a report
### Installation
1. Install node js
2. Run `npm install`
3. Clone the repository `git clone https://github.com/SAP/project-kb.git`
4. Checkout branch vulnerability-data `git checkout vulnerability-data --`

### Example commands
This example will limit the Git Repos to 50
```sh
node index.js STATEMENTS_FOLDER_PATH
```

This example will limit the Git Repos to 5000
```sh
node index.js STATEMENTS_FOLDER_PATH YOUR_GIT_USER_NAME YOUR_GIT_PASSWORD
```
