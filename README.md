# gcp-api-client

REST API client for [Google Cloud Platform](https://cloud.google.com/products/) services, not a replacement for the [client libraries](https://cloud.google.com/nodejs/docs/reference/libraries) available from Google.

This package merely exposes some of the functionalities of the    [@google-cloud/common](https://www.npmjs.com/package/@google-cloud/common) package to facilitate the use for simple API requests.

### Overview

```javascript
const apiClient = require('gcp-api-client');

const client =  apiClient({
  baseUrl: 'https://cloudfunctions.googleapis.com',
  scopes: 'https://www.googleapis.com/auth/cloudfunctions'
});

client.get('/v1/projects/{{projectId}}/locations/-/functions', (error, response) => {
  // Process response
});
```

All the request methods can either be invoked with callbacks (as in the example above) or return promises:

```javascript
client.get('/v1/projects/{{projectId}}/locations/-/functions').then(processResponse);
```

```javascript
async function makeRequest() {
  let response = await client.get('/v1/projects/{{projectId}}/locations/-/functions');
}
```

Once instantiated, the client can be used for multiple subsequent requests:

```javascript
const client = require('gcp-api-client')();

async function makeRequests() {
  let response1 = await client.get('/storage/v1/b/my-bucket/o');

  let data = {
    query: { uploadType: 'multipart' },
    json: { name: 'my-object' },
    file: './pic10.jpg',
    type: 'image/jpeg'
  };

  let response2 = await client.post('/upload/storage/v1/b/my-bucket/o', data);
}
```

### Installation

```
npm install gcp-api-client --save
```

### Usage

The API client is instantiated as follows:

```javascript
const apiClient = require('gcp-api-client');

const client = apiClient(options);
```

If present, `options` must be an object with following properties:

| Property     | Description |
|:-------------|:------------|
| `baseUrl`    | OPTIONAL - String; default value is `https://www.googleapis.com` |
| `scopes`     | OPTIONAL - String or array of strings; must be appropriate for the service endpoint that is intended to be called; default value is `https://www.googleapis.com/auth/cloud-platform` |
| `pathParams` | OPTIONAL - Object; each key/value pair represents a path parameter and its replacement string (see details [below](#Use-of-path-parameters)) |

Once the API client has been instantiated, requests are made through the following methods:

**client.post(path[, options][, callback])**

Initiates a POST request. `path` specifies the request path (relative to the `baseUrl` configured for the client). Must be a string starting with `/`. May contain parameters marked with double braces (see details [below](#Use-of-path-parameters)).

If present, `callback` must be a function that expects `(error, response)` as input parameters. Otherwise, if `callback` is not present, then `client.post()` returns a promise to resolve `response` or to catch `error`.

If present, `options` must be an object with the following properties:

| Property | Description |
|:---------|:------------|
| `query`  | OPTIONAL - Object; if present, a query string is generated with the specified keys and values |
| `json`   | OPTIONAL - Object; object to be serialized into JSON body |
| `form`   | OPTIONAL - Object; object to be serialized into URL-encoded body |
| `text`   | OPTIONAL - String; string to be used as request body |
| `file`   | OPTIONAL - String; path to the file to be uploaded
| `type`   | OPTIONAL - String; relevant only if `file` is present; MIME type of the file to be uploaded |

The following combinations of `json`, `form`, `text` and `file` are supported:

| `json` | `form` | `text` | `file` |
|:------:|:------:|:------:|:------:|:----------|
| x      |        |        |        | The `content-type` header is set to `application/json` and `json` is used as body after serialization |
|        | x      |        |        | The `content-type` header is set to `application/x-www-form-urlencoded` and `form` is used as body after serialization |
|        |        | x      |        | The `content-type` header is set to `text/plain` and `text` is used as body |
| x      |        | x      |        | The `content-type` header is set to `multipart/related`; the first part has `application/json` body; the second part has `text/plain` body
| x      |        |        | x      | The `content-type` header is set to `multipart/related`; the first part has `application/json` body; the second part has content type specified by the `type` value |

`response` is an object obtained by parsing the JSON response returned by the server.

**client.get(path[, options][, callback])**

Same as `client.post()` above, but for GET requests. Body is never sent with GET requests.

**client.put(path[, options][, callback])**

Same as `client.post()` above, but for PUT requests.

**client.patch(path[, options][, callback])**

Same as `client.post()` above, but for PATCH requests.

**client.delete(path[, options][, callback])**

Same as `client.post()` above, but for DELETE requests. Body is never sent with DELETE requests.

### Use of path parameters

One or more path parameters can be specified when the client is instantiated. Example:

```javascript
const apiClient = require('gcp-api-client');

const client =  apiClient({
  pathParams: { bucket: 'my-bucket', location: 'us' }
});
```

The specified parameters are automatically inserted in the `path` value when the client is used to initiate requests. Double braces are used to mark the parameters:

```javascript
client.get('/storage/v1/b/{{bucket}}/o').then(processResponse);
```

The above request is equivalent to:

```javascript
client.get('/storage/v1/b/my-bucket/o').then(processResponse);
```

The `{{projectId}}` parameter has a special treatment. It can be used in `path` even if not specified for the client. When this is the case, `{{projectId}}` is replaced with the name of the project for which the client has obtained its credentials.
