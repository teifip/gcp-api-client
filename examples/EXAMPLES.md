### gcp-api-client examples

The following examples are included within this folder:

`token.js`

This examples shows how to securely store an access token in [Google Cloud Storage](https://cloud.google.com/storage/) using application layer encryption with encryption key from [Google Key Management Service](https://cloud.google.com/kms/).

`functions.js`

This examples shows how to deploy a function to [Google Cloud Functions](https://cloud.google.com/functions/) from a local `.zip` archive. The JSON document used to describe a cloud function is specified [here](https://cloud.google.com/functions/docs/reference/rest/v1/projects.locations.functions#CloudFunction).

> Please remind that the `.zip` archive must be created without including any top level directory, i.e. with the `index.js` and `package.json` files at the top level.


`storage.js`

This examples shows how to store a file in [Google Cloud Storage](https://cloud.google.com/storage/) using [customer-managed encryption keys](https://cloud.google.com/storage/docs/encryption/customer-managed-keys).

> This example assumes that your project's Google Cloud Storage service account is authorized as `Cloud KMS CryptoKey Encrypter/Decrypter` for the [Google Key Management Service](https://cloud.google.com/kms/) key you intend to use. If this condition is not met, you will get a `Permission denied on Cloud KMS key` error.
