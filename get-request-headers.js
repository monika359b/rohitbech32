

function getRequestHeaders() {
  const apiKey = 'ae5edad6-01b8-44ef-9586-8c65976212f5';
  return {
    headers: {
      'api-key': apiKey,
    },
  };
}

module.exports = { getRequestHeaders };
