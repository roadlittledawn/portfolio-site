#!/bin/bash

# Check if the "latest" flag is provided as a command-line argument
if [ "$1" == "--latest" ]; then
  latest_flag="--latest"
else
  latest_flag=""
fi

# Read package.json and find dependencies with "gatsby" in their names
dependencies=$(node -e "const pkg = require('./package.json'); const deps = pkg.dependencies || {}; const gatsbyDeps = Object.keys(deps).filter(dep => dep.includes('gatsby')); console.log(gatsbyDeps.join(' '));")

# Run yarn upgrade command
if [ -n "$dependencies" ]; then
  echo "Running upgrade command: yarn upgrade $latest_flag $dependencies"
  yarn upgrade $latest_flag $dependencies
else
  echo "No Gatsby dependencies found in package.json."
fi
