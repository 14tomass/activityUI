#!/usr/bin/env bash

set -euo pipefail

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo "Usa este script con: source scripts/use-local-node-wsl.sh" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

NODE_VERSION="v24.15.0"
NODE_ARCHIVE="node-${NODE_VERSION}-linux-x64.tar.xz"
NODE_DIR="${ROOT_DIR}/.local-tools/node-${NODE_VERSION}-linux-x64"
NODE_TAR="${ROOT_DIR}/.local-tools/${NODE_ARCHIVE}"

mkdir -p "${ROOT_DIR}/.local-tools"

if [[ ! -x "${NODE_DIR}/bin/node" ]]; then
  if ! command -v curl >/dev/null 2>&1; then
    echo "curl no esta disponible en WSL; no se puede descargar Node Linux local." >&2
    return 1
  fi

  if ! command -v tar >/dev/null 2>&1; then
    echo "tar no esta disponible en WSL; no se puede extraer Node Linux local." >&2
    return 1
  fi

  echo "Descargando Node ${NODE_VERSION} para Linux x64 en .local-tools..."
  curl -fsSL "https://nodejs.org/dist/${NODE_VERSION}/${NODE_ARCHIVE}" -o "${NODE_TAR}"
  rm -rf "${NODE_DIR}"
  tar -xJf "${NODE_TAR}" -C "${ROOT_DIR}/.local-tools"
fi

export PATH="${NODE_DIR}/bin:${PATH}"

echo "Usando Node $(node -v) y npm $(npm -v) desde ${NODE_DIR}"
