#!/usr/bin/env bash
set -euo pipefail

KEYCHAIN_NAME="build.keychain"
KEYCHAIN_PASSWORD="${MACOS_KEYCHAIN_PWD}"

echo "Setting up macOS keychain for code signing..."

# Decode certificate
echo "${MACOS_CERTIFICATE}" | base64 --decode > certificate.p12

# Create and configure keychain
security create-keychain -p "${KEYCHAIN_PASSWORD}" "${KEYCHAIN_NAME}"
security set-keychain-settings -lut 21600 "${KEYCHAIN_NAME}"
security unlock-keychain -p "${KEYCHAIN_PASSWORD}" "${KEYCHAIN_NAME}"

# Add to search list (CRITICAL - codesign must be able to find the keychain)
security list-keychains -d user -s "${KEYCHAIN_NAME}" $(security list-keychains -d user | tr -d '"')

# Import certificate with ALL necessary tool permissions
security import certificate.p12 -k "${KEYCHAIN_NAME}" -P "${MACOS_CERTIFICATE_PWD}" \
  -T /usr/bin/codesign \
  -T /usr/bin/security \
  -T /usr/bin/productbuild

# Allow codesign to access without prompts (CRITICAL for non-interactive CI)
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "${KEYCHAIN_PASSWORD}" "${KEYCHAIN_NAME}"

# Verify and display available identities
echo "Available signing identities:"
security find-identity -v -p codesigning "${KEYCHAIN_NAME}"

# Cleanup
rm -f certificate.p12

echo "Keychain setup complete."
