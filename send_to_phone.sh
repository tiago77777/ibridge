#!/bin/bash

cd /opt
zip -r0 "$2.zip" sublime_text
scp -P 8022 ./sublime_text.zip "u0_a169@$1:"