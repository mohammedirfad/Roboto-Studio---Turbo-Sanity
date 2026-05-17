const { createClient } = require('@sanity/client');
const client = createClient({ projectId: 'kf6tzh03', dataset: 'production', useCdn: false, apiVersion: '2023-05-03' });
client.fetch('*[_type=="category"]').then(console.log);
