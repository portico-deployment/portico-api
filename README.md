# Portico API

## Description
Portico is a one-click deployment solution for builders on the Polkadot Network. This repository contains the backend functionalities for Portico.

> ⚠️ **Warning: This version is an MVP. Use a hard hat during deployment for testing purposes.**

## What You'll Find Here
- **Backend App**: This repository hosts the backend for Portico, facilitating communication and functionality beyond the user interface.

## Getting Started
To run the backend, follow these steps:
1. Install dependencies using `yarn install`.
2. Start the backend using `yarn start`.


### Adding Chain Binaries
This repository is shipped without the parachain and relay chain binaries. Please add these binaries manually:
- **Relay Chain Binaries**: Place relay chain binaries in the `/bin` folder.
- **Runtime Templates**: Insert runtime templates in the `/templates/bin` folder.

> ⚠️ **Note**: This repository is dedicated to the backend functionalities. For a complete Portico experience, the backend must be paired with the UI or the Docker image.

## Issues and Contributions
If you encounter any issues or have suggestions for improvements, please raise an issue in this repository. Your feedback is valuable to us!
