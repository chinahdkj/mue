#!/bin/bash

rm -rf node_modules/**
rm -rf dist/**

npm i
NODE_ENV=production npm run build
