#!/usr/bin/env bash
# Prints an sftp batch file that uploads a local build into a remote directory.
# Used by the release workflow, as the host only allows SFTP (no shell, so no rsync)
# and blocks passive FTP data ports.
#
# Usage: scripts/sftp-batch.sh <local build dir> <remote dir> > batch.txt
#        sftp -b batch.txt user@host
set -euo pipefail
cd "$1"
echo "lcd \"$PWD\""
# a leading - lets sftp carry on when a directory already exists
echo "-mkdir \"$2\""
echo "cd \"$2\""
find . -mindepth 1 -type d | sed 's|^\./||' | sort | sed 's/.*/-mkdir "&"/'
# upload index.html last so it never references files that aren't there yet
find . -type f ! -path ./index.html | sed 's|^\./||' | sort | sed 's/.*/put "&" "&"/'
echo 'put "index.html" "index.html"'
