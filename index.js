require('dotenv').config();
const path = require('path');
const fs = require('fs');
const fbcommon = require("./fbcommon.js");
const ldCommon = require('./ldCommon.js');

const outputDirName = "output";
const rcTemplateFile = path.join(outputDirName, "rctemplate.json");
const ldFlagConfigFile = path.join(outputDirName, "ldflagconfig.json");
const ldTargetRulesFile = path.join(outputDirName, "ldTargetRules.json");

const {
  GOOGLE_APPLICATION_CREDENTIALS: fbaseCredentials,
  LD_ACCESS_TOKEN: ldAccessToken,
  LD_PROJECT_KEY: ldProjectKey
} = process.env;

function checkRequiredParameters() {
  if (!fbaseCredentials) {
    console.log(`Error: missing Firebase credentials, see README for details`);
    return false;
  }
  if (!ldAccessToken) {
    console.log(`Error: missing LaunchDarkly access token, see README for details`);
    return false;
  }

  if (!ldProjectKey) {
    console.log(`Error: missing LaunchDarkly Project Key, see README for details`);
    return false;
  }

  return true;
}
const ldApiClient = ldCommon.LDApiClient(ldAccessToken);

function writeFile(fileName, data) {
  fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
}
async function createConfigs() {
  const remoteConfig = fbcommon.initFirebaseClient(fbaseCredentials);
  const rcTemplate = await remoteConfig.getTemplate();
  const {
    flagConfig,
    flagTargetRules
  } = ldCommon.rcTemplateToLDConfig(rcTemplate);

  writeFile(rcTemplateFile, rcTemplate);
  writeFile(ldFlagConfigFile, flagConfig);
  writeFile(ldTargetRulesFile, flagTargetRules);
}
async function createLDConfigs(rcTemplateFile) {
  const rcTemplate = readConfig(rcTemplateFile);
  const {
    flagConfig,
    flagTargetRules
  } = ldCommon.rcTemplateToLDConfig(rcTemplate);

  writeFile(ldFlagConfigFile, flagConfig);
  writeFile(ldTargetRulesFile, flagTargetRules);
}

function readConfig(fname) {
  let data = fs.readFileSync(fname, {
    encoding: 'utf8',
    flag: 'r'
  });
  return JSON.parse(data);
}


function createFlags(projectKey, flagConfigFile) {
  const flags = readConfig(flagConfigFile);
  ldApiClient.createFlags(projectKey, flags);
}

function deleteFlags(projectKey, flagConfigFile) {
  const flags = readConfig(flagConfigFile);
  const flagKeys = Object.keys(flags);
  ldApiClient.deleteFlags(projectKey, flagKeys);
}


(function () {
  const action = process.argv[2];

  if (!checkRequiredParameters()) {
    return -1;
  }

  if (action && action === 'create-configs') {
    createConfigs();

  } else if (action && action === 'create-ldconfigs') {

    const fbaseTemplate = process.argv[3];

    createLDConfigs(fbaseTemplate || rcTemplateFile);
  } else if (action && action === 'create-flags') {
    const ldConfigFile = process.argv[3];
    createFlags(ldProjectKey, ldConfigFile || ldFlagConfigFile);
  } else if (action && action === 'delete-flags') {

    if (!ldProjectKey) {
      console.log("missing project key skipping");
      return;
    }
    const ldConfigFile = process.argv[3];
    deleteFlags(ldProjectKey, ldConfigFile || ldFlagConfigFile);
  }
})();