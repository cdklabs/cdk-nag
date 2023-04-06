<!--
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
-->

# Contributing Guidelines

Thank you for your interest in contributing to our project. Whether it's a bug report, new feature, correction, or additional
documentation, we greatly value feedback and contributions from our community.

Please read through this document before submitting any issues or pull requests to ensure we have all the necessary
information to effectively respond to your bug report or contribution.

## Reporting Bugs/Feature Requests

We welcome you to use the GitHub issue tracker to report bugs or suggest features.

When filing an issue, please check existing open, or recently closed, issues to make sure somebody else hasn't already
reported the issue. Please try to include as much information as you can. Details like these are incredibly useful:

- A reproducible test case or series of steps
- The version of our code being used
- Any modifications you've made relevant to the bug
- Anything unusual about your environment or deployment

## Contributing via Pull Requests

### Pull Request Checklist

- [ ] Testing
  - Unit test added (prefer not to modify an existing test, otherwise, it's probably a breaking change)
- [ ] Docs
  - **README**: README updated if necessary
  - **RULES**: RULES updated if necessary
- [ ] Title and Description
  - **Change type**: title prefixed with **fix**, **feat** and module name in parens, which will appear in changelog
  - **Title**: use lower-case and doesn't end with a period
  - **Breaking?**: last paragraph: "BREAKING CHANGE: <describe what changed + link for details>"
  - **Issues**: Indicate issues fixed via: "**Fixes #xxx**" or "**Closes #xxx**"

Contributions via pull requests are much appreciated. Before sending us a pull request, please ensure that:

1. You are working against the latest source on the _main_ branch.

---

### Step 1: Open Issue

If there isn't one already, open an issue describing what you intend to contribute. It's useful to communicate in advance, because sometimes, someone is already working in this space, so maybe it's worth collaborating with them instead of duplicating the efforts.

### Step 2: Fork the repository

GitHub provides additional document on [forking a repository](https://help.github.com/articles/fork-a-repo/). Make sure you are working against the latest source on the _main_ branch.

### Step 3: Setup

`cdk-nag` provides both a local or DevContainer Option for development.

#### Option 1: Local

The following tools need to be installed on your system prior to building `cdk-nag` locally:

- [Node.js >= 14.15.0](https://nodejs.org/download/release/latest-v14.x/)
  - We recommend using a version in [Active LTS](https://nodejs.org/en/about/releases/)
- [Yarn >= 1.19.1, < 2](https://yarnpkg.com/lang/en/docs/install)
- [.NET SDK >= 6.0.x](https://www.microsoft.com/net/download)
- [Python >= 3.6.5, < 4.0](https://www.python.org/downloads/release/python-365/)
- [Java Development Kit >= 17.0.0](https://www.oracle.com/java/technologies/downloads/)
- [Golang >= 16.0.0](https://go.dev/doc/install)

Install dependencies

- `yarn install`
- `npx projen`

#### Option 2: Dev Container

`cdk-nag` provides a VS Code Dev Container with all dependencies pre-installed. The following tools need to be installed on your system prior to building `cdk-nag` in a Dev Container:

- [Docker >= 19.03](https://docs.docker.com/get-docker/)
  - the Docker daemon must also be running

Please follow the [setup instructions](https://code.visualstudio.com/docs/remote/containers-tutorial) to configure VS Code.

With VS Code setup, you will be prompted to open the `cdk-nag` repo in a Dev Container, or you can choos "Dev Containers: Reopen in Container" from the VS Code command palette.

### Step 4: Develop

1. Change code
2. If relevant, add [tests](./test/)
3. Run tests
   - `npx projen test`
4. Build
   - `npx projen build`
5. Update relevant documentation
6. Create the commit with relevant files
   - Note: you may need to update the commit if `pre-commit` changes/suggests changes to files

### Step 5: Make the pull request

Send us a [pull request](https://help.github.com/articles/creating-a-pull-request/), answering any default questions in the pull request interface. Pay attention to any automated CI failures reported in the pull request, and stay involved in the conversation.

## Finding contributions to work on

Looking at the existing issues is a great way to find something to contribute on. As our projects, by default, use the default GitHub issue labels (enhancement/bug/duplicate/help wanted/invalid/question/wontfix), looking at any 'help wanted' issues is a great place to start.

## Code of Conduct

This project has adopted the [Amazon Open Source Code of Conduct](https://aws.github.io/code-of-conduct).
For more information see the [Code of Conduct FAQ](https://aws.github.io/code-of-conduct-faq) or contact
opensource-codeofconduct@amazon.com with any additional questions or comments.

## Security issue notifications

If you discover a potential security issue in this project we ask that you notify AWS/Amazon Security via our [vulnerability reporting page](http://aws.amazon.com/security/vulnerability-reporting/). Please do **not** create a public github issue.

## Licensing

See the [LICENSE](LICENSE) file for our project's licensing. We will ask you to confirm the licensing of your contribution.
