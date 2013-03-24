#!/bin/bash

usage() {
    echo -e "\nbundle.sh FILE..."
    echo "Bundle (and minify) all JavaScripts in the current directory into a single file."
}

BUNDLEFILE=$1

if [ ! -n "$BUNDLEFILE" ]; then # Tests to see whether a bundlefile has been specified
    usage
    exit 0
fi

# Minify JavaScripts

# If the output file already exists, we don't want to double its size. Remove it.
if [ -e "./$BUNDLEFILE" ]; then
    echo -e "Removing existing copy of $BUNDLEFILE."
    rm $BUNDLEFILE
fi

yui-compressor ${YUICOMPRESSOR} libs.js -o $BUNDLEFILE
yui-compressor ${YUICOMPRESSOR} main.js -o $BUNDLEFILE

#java -jar ${YUICOMPRESSOR} libs.js >> $BUNDLEFILE
#java -jar ${YUICOMPRESSOR} main.js >> $BUNDLEFILE

echo -e "\nDone."
exit 0
