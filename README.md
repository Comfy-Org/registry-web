# Comfy Registry Frontend

The frontend React App for [Comfy Registry](https://comfyregistry.org).

Registry React Frontend [Github](https://github.com/Comfy-Org/registry-web)

Registry CLI [Github](https://github.com/yoland68/comfy-cli)

## Getting Started

### Set up IDE

#### VSCode

Install [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extensions.

`.vscode/settings.json` is set up in the workspace to lint + format code on save.

### Local Development

Run the development server

```bash
git checkout dev
brew install pnpm
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Generate Code Stub based on OpenAPI Spec

Start the dev server.

Currently, the Orval spec is in `orval.config.js`. It points to the OpenAPI spec in your localhost server. This can be changed to staging or prod.

`npx orval`

This generates react queries that you can use in your Components.

### Deployments

#### Production

Make a PR to the `main` branch. Once merged, Vercel will deploy to https://comfyregistry.org

### CORS

To enable CORS on the google cloud storage bucket, reference the `cors.json` file. More info [here](https://cloud.google.com/storage/docs/cross-origin#cors-components).

`gcloud storage buckets update gs://comfy-registry --cors-file=cors.json`
