// Copy this file to index.js only after wiring a persistent repository and
// retrieving the verified Mini Program identity from the CloudBase runtime.
// Never accept a subject identifier from event.payload.

const { createGateway } = require("./handler");

exports.createProductionEntry = function createProductionEntry({ service, connector, getVerifiedContext }) {
  return createGateway({
    service,
    connector,
    identify: async (context) => {
      const verified = await getVerifiedContext(context);
      return { subjectId: verified.subjectId };
    },
  });
};
