const fs = require('fs');
const mime = require('mime-types');
const Service = require('@google-cloud/common').Service;

const DEFAULT_BASE_URL = 'https://www.googleapis.com';
const DEFAULT_SCOPES = 'https://www.googleapis.com/auth/cloud-platform';

module.exports = function(options = {}) {
  return new GenericClient(options);
};

class GenericClient extends Service {
  constructor(options) {
    let config = {
      baseUrl: options.baseUrl || DEFAULT_BASE_URL,
      scopes: options.scopes || DEFAULT_SCOPES,
      packageJson: require('./package.json'),
      projectIdRequired: false
    };
    super(config);

    this.params = options.pathParams || {};
  }

  post(path, ...rest) {
    return makeRequest.call(this, 'POST', path, ...rest);
  }

  get(path, ...rest) {
    return makeRequest.call(this, 'GET', path, ...rest);
  }

  put(path, ...rest) {
    return makeRequest.call(this, 'PUT', path, ...rest);
  }

  patch(path, ...rest) {
    return makeRequest.call(this, 'PATCH', path, ...rest);
  }

  delete(path, ...rest) {
    return makeRequest.call(this, 'DELETE', path, ...rest);
  }
}

function makeRequest(method, path, ...rest) {
  let options = {};
  let callback = null;

  if (rest.length > 0 && rest[rest.length - 1] === undefined) {
    rest.pop();
  }
  if (rest.length > 0 && rest[0].constructor === Object) {
    options = rest.shift();
  }
  if (rest.length > 0 && typeof rest[0] === 'function') {
    callback = rest.shift();
  }
  if (rest.length > 0) {
    throw new TypeError('Invalid arguments');
  }

  for (param in this.params) {
    path = path.replace(new RegExp(`{{${param}}}`, 'g'), this.params[param]);
  }

  let requestOptions = { method: method, uri: path, headers: {} };

  if (options.query) {
    requestOptions.qs = options.query;
  }

  if (options.file) {
    try {
      fs.accessSync(options.file);
    } catch (error) {
      if (callback) return callback(error);
      return new Promise((resolve, reject) => reject(error));
    }
    options.type = options.type || mime.lookup(options.file);
    if (!options.type) {
      let error = new Error('Cannot determine file type');
      if (callback) return callback(error);
      return new Promise((resolve, reject) => reject(error));
    }
  }

  if (options.json && options.text) {
    requestOptions.multipart = [
      {
        'content-type': 'application/json',
        body: JSON.stringify(options.json)
      },
      {
        'content-type': 'text/plain',
        body: options.text
      }
    ];

  } else if (options.json && options.file) {
    requestOptions.multipart = [
      {
        'content-type': 'application/json',
        body: JSON.stringify(options.json)
      },
      {
        'content-type': options.type,
        body: fs.createReadStream(options.file)
      }
    ];

  } else if (options.json) {
    requestOptions.json = options.json;

  } else if (options.text) {
    requestOptions.body = options.text;
    requestOptions.headers = { 'content-type': 'text/plain' };

  } else if (options.file) {
    requestOptions.body = fs.createReadStream(options.file);
    requestOptions.headers = { 'content-type': options.type };

  } else if (options.form) {
    requestOptions.form = options.form;
  }

  Object.assign(requestOptions.headers, options.headers);

  if (callback) {
    this.request(requestOptions, callback);
  } else {
    return new Promise((resolve, reject) => {
      this.request(requestOptions, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}
