# Firebase Remote Config 
This is a Firebase Remote Config to Launchdarkly migration tool.

## Capabilities
* export Remote Config template
* generate Remote Config template to LaunchDarkly feature flag configurations
  
## Limitations
*  currently doesn't support generating LaunchDarkly targeting rule from Remote Config Conditions.

##  Output
* rctemplate.json - Remote Config template
* ldflagconfig.json - LaunchDarkly flag configurations
* ldTargetRules.json - Remote config Conditions mapping to LaunchDarkly flag variation
  


## Requirements
* Private key file - Google service account, [Generate Private key file](https://firebase.google.com/docs/remote-config/automate-rc#get_an_access_token_to_authenticate_and_authorize_api_requests)
* LaunchDarkly Project, [LaunchDarkly Project](https://docs.launchdarkly.com/home/organize/projects).
* LaunchDarkly Access Token, [LD API Access Token](https://docs.launchdarkly.com/home/account-security/api-access-tokens)
>**_NOTE_**: Create a restrictive [custom policy](https://docs.launchdarkly.com/home/members/custom-roles) for flag creation and deletion ONLY to your project. 


## Installation
1. Install NPM packages. Switch into the firebase-migration folder and install NPM packages.
      `$> npm install`

2. Create an `.env` file and set the following environment variables with the path to your Firebase credentials and your LaunchDarkly [API access token](https://docs.launchdarkly.com/home/account-security/api-access-tokens) and [project key](https://docs.launchdarkly.com/home/organize/projects).
   ```
    GOOGLE_APPLICATION_CREDENTIALS=firebase-adminsdk-yyyy.json
    LD_ACCESS_TOKEN=api-1234-1234-1234
    LD_PROJECT_KEY=firebase-demo
   ```

## Running the app
> **NOTE**: To list available commands run: *$> npm run*

### Available commands
```
  $> npm run
  createConfigs
    node index.js create-configs
  createLDConfigs
    node index.js create-ldconfigs
  createFlags
    node index.js create-flags
  deleteFlags
    node index.js delete-flags
```

**Generate LaunchDarkly flag configs from Firebase Remote Config template**

`$> npm run createConfigs`

**Generate LaunchDarkly flag configs from existing Firebase Remote config template**

`$> npm run createLDConfigs output/rctemplate.json`

**Create LaunchDarkly feature flags from generated LD feature flag configuration**
`$> npm run createFlags`

OR

`$> npm run createFlags output/ldflagconfig.json`

**Delete LaunchDarkly feature flags from generated LD feature flag configuration**

`$> npm run deleteFlags`

OR

`$> npm run deleteFlags output/ldflagconfig.json`
