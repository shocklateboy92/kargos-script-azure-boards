#!/bin/bash

node --unhandled-rejections=strict \
     /usr/local/lib/js/kargos-script-azure-boards.js \
          --self=$0 \
          "$@"
