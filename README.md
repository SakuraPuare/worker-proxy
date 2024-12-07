# Cloudflare Worker Proxy

This project is a Cloudflare Worker that acts as a proxy for specific domains. It allows GET requests to be proxied to allowed domains specified in a whitelist.

## Features

- **Domain Whitelisting**: Only allows requests to domains specified in the `ALLOWED_DOMAINS` list.
- **HTTPS Support**: By default, requests are made using HTTPS unless specified otherwise.
- **Base64 URL Decoding**: Supports decoding of base64 encoded URLs from the request path.
- **Method Restriction**: Only allows GET requests.
- **Proxy Request Handling**: Forwards requests to the target URL and returns the response.

## Setup

1. **Install Wrangler**: Ensure you have [Wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update) installed, which is the CLI tool for managing Cloudflare Workers.

2. **Clone the Repository**: Clone this repository to your local machine.

3. **Configure Environment**: Update the `wrangler.toml` file with your Cloudflare account details and any necessary environment variables.

## Usage

### Development

To start a development server, run the following command in your terminal:

```bash
wrangler dev src/index.ts
```

### Deployment

To deploy the worker, run the following command:

```bash
wrangler deploy src/index.ts --name my-worker
```

Replace `my-worker` with your desired worker name.

## How to Use

- **Proxy a URL**: To proxy a request, append the target URL as a query parameter or as a base64 encoded path. For example:
  - Query Parameter: `http://localhost:8787/?url=example.com`
  - Base64 Path: `http://localhost:8787/proxy/ZXhhbXBsZS5jb20=`

- **HTTPS Parameter**: You can specify whether to use HTTPS by adding a `https` query parameter. Set it to `false` to use HTTP:
  - `http://localhost:8787/?url=example.com&https=false`

## Limitations

- **IP Restriction**: The code includes a placeholder for restricting access to Chinese IPs, but this functionality is not implemented. You can implement this by integrating an IP geolocation service.

- **Error Handling**: The worker returns specific error messages for invalid methods, URLs, and domains not in the whitelist.