const fbaseAdmin = require('firebase-admin');

function initFirebaseClient(credentials) {
    let remoteConfig = null;
    async function getTemplate() {
        let tempalte = null;
        try {
            remoteConfig = fbaseAdmin.remoteConfig();
            template = await remoteConfig.getTemplate();
        } catch (error) {
            console.error(err);
        }
        return template;
    }
    async function getTemplateStr() {
        let templateStr = "";

        try {

            const rcTemplate = await getTemplate();
            templateStr = JSON.stringify(rcTemplate, null, 2);
        } catch (error) {
            console.error(err);
        }
        return templateStr;
    }

    // main
    fbaseAdmin.initializeApp({
        credential: fbaseAdmin.credential.cert(credentials)
    });

    return {
        getTemplate,
        getTemplateStr
    }

};

module.exports = {
    initFirebaseClient
}