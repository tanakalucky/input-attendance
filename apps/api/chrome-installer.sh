#!/bin/bash
set -e

install_component() {
  local name="$1"
  local download_url="$2"
  local download_path="$3"
  local install_dir="$4"

  log "Start ${name} install"

  mkdir -p "$install_dir" || error_handler "Failed to create install directory of ${name}"

  log "Start download ${name}"
  curl -Lo "$download_path" "$download_url" || error_handler "Failed to download ${name}"

  log "Start unzip ${name}"
  unzip_output=$(unzip "$download_path" -d "$install_dir" 2>&1) || error_handler "Failed to unzip ${name}: $unzip_output"

  log "Remove downloaded zip file"
  rm -f "$download_path" || log "Alert: Failed to remove zip file"

  log "${name} has been successfully installed"
}

latest_stable_json="https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json"
# Retrieve the JSON data using curl
json_data=$(curl -s "$latest_stable_json")

latest_chrome_linux_download_url="$(echo "$json_data" | jq -r '.channels.Stable.downloads."chrome-headless-shell"[0].url')"
latest_chrome_driver_linux_download_url="$(echo "$json_data" | jq -r ".channels.Stable.downloads.chromedriver[0].url")"

download_path_chrome_linux="/opt/chrome-headless-shell-linux.zip"
download_path_chrome_driver_linux="/opt/chrome-driver-linux.zip"

install_component "Chrome headless shell" "$latest_chrome_linux_download_url" "$download_path_chrome_linux" "/opt/chrome"

install_component "ChromeDriver" "$latest_chrome_driver_linux_download_url" "$download_path_chrome_driver_linux" "/opt/chrome-driver"
