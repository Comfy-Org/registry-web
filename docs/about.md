# About Registry

<!-- This doc is context for i18n. -->

## Introduction

The Registry is a public collection of custom nodes. Developers can publish, version, deprecate, and track metrics related to their custom nodes. ComfyUI users can discover, install, and rate custom nodes from the registry.

## Why use the Registry?

The Comfy Registry helps the community by standardizing the development of custom nodes:

- **Node Versioning**: Developers frequently publish new versions of their custom nodes which often break workflows that rely on them. With registry nodes being semantically versioned, users can now choose to safely upgrade, deprecate, or lock their node versions in place, knowing in advance how their actions will impact their workflows. The workflow JSON will store the version of the node used, so you can always reliably reproduce your workflows.

- **Node Security**: The registry will serve as a backend for the ComfyUI-manager. All nodes will be scanned for malicious behaviour such as custom pip wheels, arbitrary system calls, etc. Nodes that pass these checks will have a verification flag beside their name on the UI-manager. For a list of security standards, see the standards.

- **Search**: Search across all nodes on the Registry to find existing nodes for your workflow.

## Publishing Nodes

Get started publishing your first node by following the tutorial.

## Frequently Asked Questions

### Do registry nodes have unique identifiers?

<!-- Answer needed -->

### Are there any restrictions on what I can publish?

<!-- Answer needed -->

### How do you ensure node stability?

<!-- Answer needed -->

### How are nodes versioned?

<!-- Answer needed -->

### How do I deprecate a node version?

<!-- Answer needed -->
