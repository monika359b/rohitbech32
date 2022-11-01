

function getRequestHeaders() {
  const apiKey = '9f66cdb9-742b-402c-8b72-f99c9b02cdc2';
  return {
    headers: {
      'api-key': apiKey,
    },
  };
}

module.exports = { getRequestHeaders };
