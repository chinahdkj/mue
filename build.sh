#!/bin/bash

rm -rf dist/**

cnpm i
NODE_ENV=production npm run build
