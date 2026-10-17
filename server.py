#!/bin/sh
# AIPreneur (aipreneurglobal.com) — Native macOS Launcher
# Automatically launches the native Ruby HTTP + SQLite3 + Multi-Channel Email Dispatcher (server.rb) on port 8090
# so it works out-of-the-box on macOS without requiring Xcode Command Line Tools for python3.

DIR="$(cd "$(dirname "$0")" && pwd)"
exec /usr/bin/ruby "$DIR/server.rb" "$@"
