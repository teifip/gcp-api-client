const path = require('path');
const apiClient = require('gcp-api-client');

const TEMPORARY_BUCKET = 'my-bucket';

const sampleFunction = {
  name: 'projects/my-project/locations/us-central1/functions/my-function',
  entryPoint: 'requestHandler',
  httpsTrigger: {}
}

async function createCloudFunction(zipFile, cloudFunction, callback) {
  let gsClient = apiClient({ pathParams: { bucket: TEMPORARY_BUCKET } });

  try {
    let upload = await gsClient.post('/upload/storage/v1/b/{{bucket}}/o', {
      query: { uploadType: 'media', name: path.basename(zipFile) },
      file: zipFile
    });

    cloudFunction.sourceArchiveUrl = `gs://${upload.bucket}/${upload.name}`;
    console.log(`Uploaded to ${cloudFunction.sourceArchiveUrl}`);

    let funClient =  apiClient({
      baseUrl: 'https://cloudfunctions.googleapis.com',
      scopes: 'https://www.googleapis.com/auth/cloudfunctions'
    });

    let idx = cloudFunction.name.indexOf('/functions');
    let funPath = `/v1/${cloudFunction.name.slice(0, idx)}/functions`;

    let { name } = await funClient.post(funPath, { json: cloudFunction });
    console.log(`Deployment operation ${name} started`);

    pollOperationForCompletion(funClient, name, callback);

  } catch (error) {
    callback(error);
  }
}

function pollOperationForCompletion(funClient, name, callback) {
  setTimeout(() => {
    funClient.get(`/v1/${name}`, (error, response) => {
      if (error) {
        callback(error);
      } else if (response.done) {
        callback(null, response.response);
      } else {
        pollOperationForCompletion(funClient, name, callback);
      }
    });
  }, 2000);
}

createCloudFunction('./my-function.zip', sampleFunction, (error, response) => {
  if (error) {
    console.log(error.message);
  } else {
    console.log(response);
  }
});
