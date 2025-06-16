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
curl -fsSL https://bun.sh/install | bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Storybook

We use Storybook for component development and documentation. To run Storybook:

```bash
pnpm run storybook
```

Open [http://localhost:6006](http://localhost:6006) to view the component library. Storybook allows you to:

- View and interact with components in isolation
- Test different component states and variations
- See documentation for components
- Develop UI components in isolation without running the full app

#### Visual Testing with Chromatic

We use Chromatic for visual testing and UI reviews:

```bash
# Make sure to set your project token
export CHROMATIC_PROJECT_TOKEN=your_token
pnpm run chromatic
```

See [docs/chromatic-setup.md](docs/chromatic-setup.md) for more details on our Chromatic CI/CD integration.

### Generate Code Stub based on OpenAPI Spec

Start the dev server.

Currently, the Orval spec is in `orval.config.js`. It points to the OpenAPI spec in your localhost server. This can be changed to staging or prod.

```sh
npx orval
```

This generates react queries that you can use in your Components.

### Deployments

#### Production

Make a PR to the `main` branch. Once merged, Vercel will deploy to https://comfyregistry.org

### CORS

To enable CORS on the google cloud storage bucket, reference the `cors.json` file. More info [here](https://cloud.google.com/storage/docs/cross-origin#cors-components).

`gcloud storage buckets update gs://comfy-registry --cors-file=cors.json`
