
# Firebase Remote Config to LaunchDarkly Migration Tool

This tool assists in migrating from Firebase Remote Config to LaunchDarkly by generating LaunchDarkly feature flag configurations from your existing Remote Config template.

## Features

- Export Remote Config template
- Generate LaunchDarkly feature flag configurations from the Remote Config template

## Limitations

- Currently doesn't support generating LaunchDarkly targeting rules from Remote Config conditions

## Output

- `rctemplate.json`: Remote Config template
- `ldflagconfig.json`: LaunchDarkly flag configurations
- `ldTargetRules.json`: Remote Config conditions mapping to LaunchDarkly flag variations

## Requirements

- Private key file: Google service account ([Generate Private key file](https://firebase.google.com/docs/remote-config/automate-rc#get_an_access_token_to_authenticate_and_authorize_api_requests))
- LaunchDarkly Project ([LaunchDarkly Project](https://docs.launchdarkly.com/home/organize/projects))
- LaunchDarkly Access Token ([LD API Access Token](https://docs.launchdarkly.com/home/account-security/api-access-tokens))
  > **NOTE**: Create a restrictive [custom policy](https://docs.launchdarkly.com/home/members/custom-roles) for flag creation and deletion ONLY to your project.

## Installation

1. Switch to the `firebase-migration` folder and install NPM packages:
   ```
   cd firebase-migration
   npm install
   ```

2. Create an `.env` file and set the following environment variables:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=firebase-adminsdk-yyyy.json
   LD_ACCESS_TOKEN=api-1234-1234-1234
   LD_PROJECT_KEY=firebase-demo
   ```
   Replace the values with the path to your Firebase credentials, LaunchDarkly API access token, and project key.

## Usage

To list available commands, run:
```
npm run
```

### Available Commands

- `npm run createConfigs`: Generate LaunchDarkly flag configs from Firebase Remote Config template
- `npm run createLDConfigs <path-to-rctemplate.json>`: Generate LaunchDarkly flag configs from an existing Firebase Remote Config template
- `npm run createFlags [<path-to-ldflagconfig.json>]`: Create LaunchDarkly feature flags from the generated LD feature flag configuration (default: `output/ldflagconfig.json`)
- `npm run deleteFlags [<path-to-ldflagconfig.json>]`: Delete LaunchDarkly feature flags from the generated LD feature flag configuration (default: `output/ldflagconfig.json`)

Examples:
```
npm run createConfigs
npm run createLDConfigs output/rctemplate.json
npm run createFlags
npm run createFlags output/ldflagconfig.json
npm run deleteFlags
npm run deleteFlags output/ldflagconfig.json
```