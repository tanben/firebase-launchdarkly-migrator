const LaunchDarklyApi = require('launchdarkly-api');



function transformValue(valueType, value) {
    let ret = null;

    switch (valueType.toUpperCase()) {
        case "BOOLEAN":
            ret = (value.toUpperCase() === "TRUE");
            break;
        case "JSON":
            ret = JSON.parse(value);
            break;
        case "NUMBER":
            ret = Number(value);
            break;
        default:
            ret = value;
            break;
    }

    return ret;
}

function parseParameterGroups(rcParameterGroups, rcConditions) {

    let parentFlags = Object.keys(rcParameterGroups);

    let flagTargetRules = {};
    let flagConfig = {};

    parentFlags.forEach((groupName) => {
        // let groupKey = groupName.replace(/\s/g, '_');
        // todo: convert groupKey to pre-requisite flag

        for (const [_, parameters] of Object.entries(rcParameterGroups[groupName])) {
            let {
                flagConfig: config,
                flagTargetRules: rules
            } = createLDFlagConfig(parameters, rcConditions);
            flagTargetRules = {
                ...flagTargetRules,
                ...rules
            };
            flagConfig = {
                ...flagConfig,
                ...config
            };
        }
    })
    return {
        flagConfig,
        flagTargetRules
    };

}

function createLDFlagConfig(rcParameters, rcConditions) {
    if (!rcParameters || (rcParameters && rcParameters.length == 0)) {
        return null;
    }

    const flagTargetRules = {};
    const flagConfig = {};

    for (const [paramKey, paramValue] of Object.entries(rcParameters)) {
        let {
            defaultValue,
            valueType,
            description,
            conditionalValues
        } = paramValue;
        let config = {
            key: paramKey,
            name: paramKey,
            defaults: {
                onVariation: 0,
                offVariation: 0
            },
            clientSideAvailability: {
                usingEnvironmentId: false,
                usingMobileKey: true
            },
            description: "",
            variations: [],
            temporary: true,
            tags: []
        };

        config.variations.push({
            name: 'default',
            value: transformValue(valueType, defaultValue.value),
            description: ''

        })

        if (conditionalValues) {
            // update variations with values from FB conditions
            let rules = [];
            for (const [ruleKey, ruleValue] of Object.entries(conditionalValues)) {
                let variation = {
                    name: ruleKey,
                    description: ruleKey,
                    variationId: config.variations.length,
                    valueType,
                    value: transformValue(valueType, ruleValue.value),
                    expression: (_ => {
                        let data = rcConditions.filter(({
                            name
                        }) => name === ruleKey);
                        return (data) ? data[0].expression : null;
                    })()

                };
                rules.push(variation);
                config.variations.push(variation);
            }

            flagTargetRules[paramKey] = [...rules];
        }
        if (config.variations.length == 1) {
            // LD Requirement: minimum 2 variations
            let {
                value,
                description
            } = config.variations[0];

            if (valueType.toUpperCase() == 'BOOLEAN') {
                value = !value
            } else if (valueType.toUpperCase() == 'STRING') {
                value += "-2";
            }

            config.variations.push({
                name: 'variation-2',
                value,
                description
            });
        }
        flagConfig[paramKey] = config;
    } // end of for-loop

    return {
        flagConfig,
        flagTargetRules
    }
}


function rcTemplateToLDConfig(fbData) {
    if (!fbData) {
        console.log("Empty Remote Config template");
        return {};
    }
    let {
        parameters: rcParameters,
        conditions: rcConditions,
        parameterGroups: rcParameterGroups
    } = fbData;


    let {
        flagConfig,
        flagTargetRules
    } = createLDFlagConfig(rcParameters, rcConditions);
    let {
        flagConfig: pConfig,
        flagTargetRules: pRules
    } = parseParameterGroups(rcParameterGroups, rcConditions);

    flagConfig = {
        ...flagConfig,
        ...pConfig
    };
    flagTargetRules = {
        ...flagTargetRules,
        ...pRules
    };

    return {
        flagConfig,
        flagTargetRules
    };

}


const LDApiClient = function (
    pAccessToken
) {

    var apiInstance = null;
    const accessToken = pAccessToken;
    const timeout = 100;

    function getInstance() {
        if (apiInstance) {
            return apiInstance;
        }

        let defaultClient = LaunchDarklyApi.ApiClient.instance;
        let ApiKey = defaultClient.authentications['ApiKey'];
        ApiKey.apiKey = accessToken;
        return new LaunchDarklyApi.FeatureFlagsApi();
    }

    function createFlag({
        projectKey,
        featureFlagBody,
        opts
    }) {
        return new Promise(function (resolve, reject) {
            setTimeout((projKey, flagBody, opts) => {
                console.log(`Creating Flag:  ${projKey} - ${flagBody.key}`)

                apiInstance.postFeatureFlag(projKey, flagBody, opts, (error, data, response) => {
                    if (error) {
                        let ret = {
                            statusCode: response.statusCode,
                            flagBody,
                            projectKey: projKey
                        };

                        if (error.status == 401) {
                            // console.log(`status=${error.status} response=${JSON.stringify(error.response)}`)
                            console.log("LDAPICLient Error= UnAuthorized")
                            ret.message = {
                                message: "UnAuthorized",
                                code: 401
                            };
                        } else {
                            ret.message = (response.text) ? JSON.parse(response.text) : "";
                        }

                        reject(ret)

                    } else {
                        resolve(data);
                    }
                });
            }, timeout, projectKey, featureFlagBody, opts);

        });
    }
    async function createFlags(projectKey, flags) {
        let promises = [];

        for (const [
                flagKey,
                flagConfig
            ] of Object.entries(flags)) {
            promises.push(createFlag({
                projectKey,
                featureFlagBody: {
                    ...flagConfig
                },
                opts: null
            }))
        }

        let results = await Promise.allSettled(promises);
        logResults(results);

    }

    function deleteFlag({
        projectKey,
        flagKey
    }) {
        if (!flagKey || !projectKey) {
            console.log(`DeleteFlag: missing flagKey or projectKey project=[${projectKey}] flagKey=${flagKey}`);
            return Promise.reject({
                statusCode: -1,
                flagKey,
                projectKey
            });
        }

        return new Promise(function (resolve, reject) {
            setTimeout((projKey, flagKey) => {
                console.log(`Deleting flag: ${projKey} - ${flagKey}`)
                apiInstance.deleteFeatureFlag(projKey, flagKey, (error, data, response) => {
                    if (error) {
                        let ret = {
                            statusCode: response.statusCode,
                            flagKey,
                            projectKey: projKey
                        };
                        if (error.status == 401) {
                            console.log("LDAPICLient Error= UnAuthorized")
                            ret.message = {
                                message: "UnAuthorized",
                                code: 401
                            };
                        } else {
                            ret.message = (response.text) ? JSON.parse(response.text) : "";
                        }
                        reject(ret)
                    } else {
                        resolve({
                            name: flagKey
                        });
                    }
                });
            }, timeout, projectKey, flagKey);

        });
    }
    async function deleteFlags(projectKey, flagKeys) {
        let promises = [];

        flagKeys.forEach(flagKey => {
            promises.push(deleteFlag({
                projectKey,
                flagKey
            }))
        })

        let results = await Promise.allSettled(promises);
        logResults(results, "delete flag");
    }

    function logResults(results, action = "create flag") {
        results.forEach(result => {
            let {
                status,
                reason,
                value

            } = result;
            if (status == 'rejected') {
                let {
                    flagBody,
                    statusCode,
                    message
                } = reason;
                let {
                    message: errmsg,
                    code
                } = message;
                console.log(`Failed creating flag=${flagBody.key} statusCode=${statusCode} error=[${code} ${errmsg}]`);


            } else {
                console.log(`Success: Action=[${action}] flag=[${value.name}]`);
            }
        })
    }
    /**
     * MAIN
     */
    (function () {
        apiInstance = getInstance();
    })();

    return {
        createFlags,
        deleteFlags
    }
}


module.exports = {
    rcTemplateToLDConfig,
    LDApiClient
}