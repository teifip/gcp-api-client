const apiClient = require('gcp-api-client');

const gsClient = apiClient({ pathParams: { bucket: 'my-bucket' } });

const kmsClient = apiClient({
  baseUrl: 'https://cloudkms.googleapis.com',
  pathParams: {
    project: 'my-project', location: 'global', ring: 'my-ring', key: 'my-key'
  }
});

const GS_OBJECT_NAME = 'token';

async function ecryptAndStoreToken(token, name, callback) {
  let kmsData = { json: { plaintext: Buffer.from(token).toString('base64') } };

  let kmsPath = '/v1/projects/{{project}}/locations/{{location}}' +
                '/keyRings/{{ring}}/cryptoKeys/{{key}}:encrypt';

  try {
    let kmsResponse = await kmsClient.post(kmsPath, kmsData);

    let gsData = {
      query: { uploadType: 'media', name: name },
      json: { encrypted_token: kmsResponse.ciphertext }
    };

    await gsClient.post('/upload/storage/v1/b/{{bucket}}/o', gsData);

    callback(null);

  } catch (error) {
    callback(error);
  }
}

async function retrieveAndDecryptToken(name, callback) {
  let gsData = { query: { alt: 'media' } };

  let gsPath = `/storage/v1/b/{{bucket}}/o/${name}`;

  try {
    let gsResponse = await gsClient.get(gsPath, gsData);

    let kmsPath = '/v1/projects/{{project}}/locations/{{location}}' +
                  '/keyRings/{{ring}}/cryptoKeys/{{key}}:decrypt';

    let kmsData = { json: { ciphertext: gsResponse.encrypted_token } };

    let { plaintext } = await kmsClient.post(kmsPath, kmsData);

    callback(null, Buffer.from(plaintext, 'base64').toString());

  } catch (error) {
    callback(error);
  }
}

ecryptAndStoreToken('My Dummy Token', GS_OBJECT_NAME, (error) => {
  if (error) {
    console.log('Error while encrypting/storing:', error.message);
  } else {
    console.log('Token encrypted and stored');

    retrieveAndDecryptToken(GS_OBJECT_NAME, (error, token) => {
      if (error) {
        console.log('Error while retrieving/decrypting:', error.message);
      } else {
        console.log('Token:', token);
      }
    });
  }
});
