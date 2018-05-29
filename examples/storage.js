const path = require('path');
const client = require('gcp-api-client')();

const key = {
  project: 'my-project',
  location: 'global',
  ring: 'my-ring',
  name: 'my-key'
};

function upload(file, bucket, key, callback) {
  let data = {
    query: { uploadType: 'multipart' },
    json: {
      name: path.basename(file),
      kmsKeyName: `projects/${key.project}/locations/${key.location}` +
                  `/keyRings/${key.ring}/cryptoKeys/${key.name}`
    },
    file: file
  };

  return client.post(`/upload/storage/v1/b/${bucket}/o`, data, callback);
}

upload('./picture.jpg', 'my-bucket', key)
  .then(response => console.log(response))
  .catch(error => console.log(error.message));
