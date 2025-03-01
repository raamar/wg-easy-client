# wg-easy-client

A Node.js client for managing WireGuard Easy instances via API. This package allows you to create, delete, and manage WireGuard clients programmatically. It also includes an interactive CLI tool for testing API calls.

## 🚀 Features

- Manage WireGuard clients (create, delete, disable, list clients)
- Fully typed with TypeScript
- Auto-authentication (handles session expiration)
- CLI tool for testing API
- Supports ESM & CommonJS

## 📦 Installation

```sh
npm install wg-easy-client
```

## 🚀 Usage

### 0️⃣ Setup .env

```
PASSWORD=YOUR_PASSWORD
WG_EASY_URL=YOUR_WG_EASY_URL
```

### 1️⃣ Import and Use in Code

```ts
import { WgEasyClient } from 'wg-easy-client'

const client = new WgEasyClient('http://localhost:51821')

;(async () => {
  await client.createClient('test-client')
  console.log(await client.getClients())
})()
```

### 2️⃣ Run the CLI Tool

After installation, you can run the CLI tool to test the API:

```sh
npx wg-easy-cli
```

or, if installed globally:

```sh
wg-easy-cli
```

## 🔧 API Methods

### Create a Client

```ts
await client.createClient('my-client')
```

### Delete a Client

```ts
await client.deleteClient('client-id')
```

### Enable a Client

```ts
await client.enableClient('client-id')
```

### Disable a Client

```ts
await client.disableClient('client-id')
```

### Get All Clients

```ts
const clients = await client.getClients()
```

### Get Client ID by Name

```ts
const clientId = await client.getClientIdByName('my-client')
```

## 🛠 Development

### Run Locally in Dev Mode

```sh
npm run dev
```

### Build the Package

```sh
npm run build
```

### Test the CLI Locally

```sh
node dist/cli.js
```

## 📢 Contributing

Feel free to contribute! Fork, create a new branch, and submit a PR.

## 📝 License

This project is licensed under the MIT License.
