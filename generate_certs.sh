#!/bin/bash

# --- Configuration ---
# Directory where certificates will be saved (relative to script location or absolute)
CERT_DIR="./nginx/certs"
# Filenames for the generated certs (consistent names are easier for Nginx config)
CERT_FILE="localhost.pem"
KEY_FILE="localhost-key.pem"
# Domains/IPs the certificate should be valid for
# Add custom local domains here if you use them (e.g., "myapp.local")
DOMAINS="localhost 127.0.0.1 ::1"
# Subject line for openssl certs (customize if desired)
OPENSSL_SUBJ="/C=US/ST=Localhost/L=Dev/O=Local Dev/CN=localhost"

# --- Helper Functions for Colored Output ---
print_info() {
  printf "\e[34mINFO: %s\e[0m\n" "$1" # Blue
}
print_success() {
  printf "\e[32mSUCCESS: %s\e[0m\n" "$1" # Green
}
print_warning() {
  printf "\e[33mWARNING: %s\e[0m\n" "$1" # Yellow
}
print_error() {
  printf "\e[31mERROR: %s\e[0m\n" "$1" >&2 # Red, to stderr
}

# Exit script immediately if any command fails
set -e

# --- Main Logic ---
print_info "Starting certificate generation..."
print_info "Output directory: $CERT_DIR"
print_info "Certificate file: $CERT_FILE"
print_info "Key file: $KEY_FILE"
print_info "Domains: $DOMAINS"

# Create the certificate directory if it doesn't exist
mkdir -p "$CERT_DIR"
print_info "Ensured certificate directory exists: $CERT_DIR"

# Check if mkcert is installed
if command -v mkcert >/dev/null 2>&1; then
  print_info "mkcert found. Using mkcert (recommended)."

  # Check if local CA is installed, install if not (mkcert -install is idempotent)
  # Note: This might prompt for sudo password
  print_info "Checking/Installing mkcert local CA (may require password)..."
  if mkcert -install; then
    print_success "mkcert local CA is installed."
  else
    print_error "Failed to install mkcert local CA. Please run 'mkcert -install' manually with appropriate permissions."
    exit 1
  fi

  # Generate certificate using mkcert
  print_info "Generating certificate and key with mkcert..."
  # Use specific output filenames
  if mkcert -cert-file "$CERT_DIR/$CERT_FILE" -key-file "$CERT_DIR/$KEY_FILE" $DOMAINS; then
     print_success "Certificates generated successfully using mkcert in $CERT_DIR"
  else
     print_error "mkcert certificate generation failed."
     exit 1
  fi

else
  # mkcert not found, check for openssl
  print_warning "mkcert not found."
  if command -v openssl >/dev/null 2>&1; then
    print_info "openssl found. Using openssl as fallback."
    print_warning "Certificates generated with openssl will cause browser security warnings!"
    print_warning "Install mkcert (https://github.com/FiloSottile/mkcert) for a better experience."

    # Generate certificate using openssl
    print_info "Generating self-signed certificate and key with openssl..."
    if openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout "$CERT_DIR/$KEY_FILE" \
      -out "$CERT_DIR/$CERT_FILE" \
      -subj "$OPENSSL_SUBJ"; then # Add -addext "subjectAltName = DNS:localhost,IP:127.0.0.1,IP:::1" if needed for SANs
        print_success "Self-signed certificates generated successfully using openssl in $CERT_DIR"
    else
        print_error "openssl certificate generation failed."
        exit 1
    fi
  else
    # Neither mkcert nor openssl found
    print_error "Neither mkcert nor openssl found. Cannot generate certificates."
    print_error "Please install mkcert (recommended) or openssl."
    exit 1
  fi
fi

print_info "Certificate generation process complete."
ls -l "$CERT_DIR" # List generated files

exit 0