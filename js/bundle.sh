#!/bin/bash

# Minify JavaScripts

# If the output file already exists, we don't want to double its size. Remove it.
if [ -e "./main-min.js" ]; then
    echo -e "Removing existing copy of $BUNDLEFILE."
    rm main-min.js
fi

yui-compressor -o main-min.js main.js

echo -e "\nDone."
exit 0
