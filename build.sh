#!/bin/bash

rm -rf dist/**

npm i
NODE_ENV=production npm run build
