#!/bin/bash
# ============================================
# Restpoint — Setup Script v1.0
# Modern Kenyan Mortuary Management Platform
# ============================================
# Automatically checks and upgrades Node.js to
# the required version for this project.
#
# Usage:
#   ./scripts/setup.sh            # Full setup (checks node, installs deps, builds)
#   ./scripts/setup.sh --node     # Only check/upgrade Node.js
#   ./scripts/setup.sh --deps     # Only install dependencies
#   ./scripts/setup.sh --build    # Only build all services
#   ./scripts/setup.sh --help     # Show this help
# ============================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Required Node.js version range (from package.json)
NODE_REQUIRED_MAJOR=22
NODE_REQUIRED_MIN=22.0.0
NODE_REQUIRED_MAX=23.0.0

# Project root (script location relative)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ============================================
# UTILITY FUNCTIONS
# ============================================

print_header() {
    echo -e "\n${BLUE}================================================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}================================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

check_command() {
    if ! command -v "$1" &>/dev/null; then
        print_error "$1 is not installed."
        return 1
    fi
    return 0
}

# ============================================
# VERSION COMPARISON
# ============================================

version_compare() {
    # Returns 0 if $1 >= $2, 1 otherwise
    if [[ "$(printf '%s\n' "$1" "$2" | sort -V | head -n1)" == "$2" ]]; then
        return 0
    fi
    return 1
}

# ============================================
# NODE.JS CHECK & UPGRADE
# ============================================

check_node_version() {
    print_header "Checking Node.js Version"

    if ! check_command node; then
        print_error "Node.js is not installed."
        echo -e "  Install it from: ${CYAN}https://nodejs.org/dist/v${NODE_REQUIRED_MAJOR}.x/${NC}"
        echo -e "  Or use nvm:       ${CYAN}nvm install ${NODE_REQUIRED_MAJOR}${NC}"
        return 1
    fi

    local current_version
    current_version="$(node --version | sed 's/^v//')"
    local current_major
    current_major="$(echo "$current_version" | cut -d. -f1)"
    local current_minor
    current_minor="$(echo "$current_version" | cut -d. -f1-2)"

    echo -e "  Current Node.js version:  ${CYAN}v${current_version}${NC}"
    echo -e "  Required major version:   ${CYAN}${NODE_REQUIRED_MAJOR}${NC}"
    echo -e "  Required range:           ${CYAN}${NODE_REQUIRED_MIN} - ${NODE_REQUIRED_MAX}${NC}"

    if version_compare "$current_version" "$NODE_REQUIRED_MIN" && \
       version_compare "$NODE_REQUIRED_MAX" "$current_version"; then
        print_success "Node.js v${current_version} meets the requirement."
        return 0
    fi

    print_error "Node.js v${current_version} is NOT compatible."
    echo ""
    echo -e "  This project requires Node.js ${CYAN}${NODE_REQUIRED_MIN}${NC} to ${CYAN}${NODE_REQUIRED_MAX}${NC}."
    echo -e "  Current version v${current_version} will cause:"
    echo -e "    - '${RED}yarn install${NC}' to fail with 'engine incompatible'"
    echo -e "    - TypeScript compilation errors"
    echo -e "    - Runtime compatibility issues"
    echo ""

    return 1
}

upgrade_node() {
    print_header "Attempting Automatic Node.js Upgrade"
    echo -e "  Target: Node.js ${CYAN}${NODE_REQUIRED_MAJOR}.x${NC}"

    # --- Method 1: nvm ---
    if command -v nvm &>/dev/null || [ -f "$HOME/.nvm/nvm.sh" ] || [ -f "$HOME/.nvm/nvm.sh" ]; then
        print_info "nvm detected. Using nvm to install Node.js ${NODE_REQUIRED_MAJOR}..."

        # Source nvm if it's a shell function
        export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
        if [ -f "$NVM_DIR/nvm.sh" ]; then
            # shellcheck source=/dev/null
            . "$NVM_DIR/nvm.sh"
        fi

        if nvm install "$NODE_REQUIRED_MAJOR" && nvm use "$NODE_REQUIRED_MAJOR"; then
            nvm alias default "$NODE_REQUIRED_MAJOR" 2>/dev/null || true
            print_success "Node.js upgraded via nvm."
            return 0
        else
            print_error "nvm install failed."
        fi

    # --- Method 2: asdf ---
    elif command -v asdf &>/dev/null; then
        print_info "asdf detected. Using asdf to install Node.js..."

        local target_version
        target_version="$(grep '^nodejs' "$PROJECT_DIR/.tool-versions" 2>/dev/null | awk '{print $2}')"

        if [ -z "$target_version" ]; then
            target_version="${NODE_REQUIRED_MAJOR}.$(curl -s https://nodejs.org/dist/v${NODE_REQUIRED_MAJOR}.x/ 2>/dev/null | grep -oP 'node-v\K[0-9]+\.[0-9]+\.[0-9]+' | sort -V | tail -1)"
        fi

        if [ -n "$target_version" ] && asdf plugin add nodejs 2>/dev/null; then
            if asdf install nodejs "$target_version" && asdf global nodejs "$target_version"; then
                print_success "Node.js upgraded via asdf."
                return 0
            else
                print_error "asdf install failed."
            fi
        fi

    # --- Method 3: fnm ---
    elif command -v fnm &>/dev/null; then
        print_info "fnm detected. Using fnm to install Node.js ${NODE_REQUIRED_MAJOR}..."

        if fnm install "$NODE_REQUIRED_MAJOR" && fnm use "$NODE_REQUIRED_MAJOR"; then
            print_success "Node.js upgraded via fnm."
            return 0
        else
            print_error "fnm install failed."
        fi

    # --- Method 4: n ---
    elif command -v n &>/dev/null; then
        print_info "n detected. Using n to install Node.js ${NODE_REQUIRED_MAJOR}..."

        if n "$NODE_REQUIRED_MAJOR"; then
            print_success "Node.js upgraded via n."
            return 0
        else
            print_error "n install failed."
        fi
    fi

    # --- Fallback: manual instructions ---
    echo ""
    print_error "Could not auto-upgrade Node.js."
    echo ""
    echo -e "  ${YELLOW}Manual upgrade options:${NC}"
    echo ""
    echo -e "  ${CYAN}Option 1: Using nvm (recommended)${NC}"
    echo "    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash"
    echo "    source ~/.bashrc"
    echo "    nvm install ${NODE_REQUIRED_MAJOR}"
    echo "    nvm use ${NODE_REQUIRED_MAJOR}"
    echo "    nvm alias default ${NODE_REQUIRED_MAJOR}"
    echo ""
    echo -e "  ${CYAN}Option 2: Using asdf${NC}"
    echo "    asdf plugin add nodejs"
    echo "    asdf install nodejs ${NODE_REQUIRED_MAJOR}.22.3"
    echo "    asdf global nodejs ${NODE_REQUIRED_MAJOR}.22.3"
    echo ""
    echo -e "  ${CYAN}Option 3: Using NodeSource for Debian/Ubuntu${NC}"
    echo "    curl -fsSL https://deb.nodesource.com/setup_${NODE_REQUIRED_MAJOR}.x | sudo -E bash -"
    echo "    sudo apt-get install -y nodejs"
    echo ""
    echo -e "  ${CYAN}Option 4: Binary download for Linux${NC}"
    echo "    wget https://nodejs.org/dist/v${NODE_REQUIRED_MAJOR}.22.3/node-v${NODE_REQUIRED_MAJOR}.22.3-linux-x64.tar.xz"
    echo "    sudo tar -xJf node-v${NODE_REQUIRED_MAJOR}.22.3-linux-x64.tar.xz -C /usr/local --strip-components=1"
    echo ""
    echo -e "  ${YELLOW}After upgrading, re-run: ./scripts/setup.sh${NC}"
    echo ""
    return 1
}

# ============================================
# YARN CHECK
# ============================================

check_yarn() {
    print_header "Checking Yarn"

    if ! check_command yarn; then
        print_error "Yarn is not installed."
        echo ""
        echo -e "  Install Yarn via:"
        echo -e "    ${CYAN}npm install -g yarn${NC}"
        echo -e "    ${CYAN}corepack enable && corepack prepare yarn@1.22.22 --activate${NC}"
        echo ""
        return 1
    fi

    local yarn_version
    yarn_version="$(yarn --version)"
    print_success "Yarn v${yarn_version} is installed."
    return 0
}

# ============================================
# DEPENDENCIES INSTALLATION
# ============================================

install_dependencies() {
    print_header "Installing Dependencies"

    cd "$PROJECT_DIR"

    print_info "Running: yarn install"
    echo ""

    # Try frozen lockfile first, fall back to normal install
    if yarn install --frozen-lockfile 2>/dev/null; then
        print_success "Dependencies installed (frozen lockfile)."
    else
        print_warning "No lockfile found or frozen check failed. Running yarn install..."
        yarn install
        print_success "Dependencies installed."
    fi

    echo ""
    print_success "All dependencies installed successfully!"
}

# ============================================
# BUILD ALL SERVICES
# ============================================

build_services() {
    print_header "Building All Services"

    cd "$PROJECT_DIR"

    print_info "Building shared packages first..."
    yarn workspaces run build 2>/dev/null || {
        print_warning "Some packages may not have build scripts (this is normal)."
    }

    echo ""
    print_success "Build complete!"
}

# ============================================
# POST-SETUP SUMMARY
# ============================================

show_summary() {
    print_header "Setup Summary"

    local node_version
    node_version="$(node --version 2>/dev/null || echo 'not found')"
    local yarn_version
    yarn_version="$(yarn --version 2>/dev/null || echo 'not found')"

    echo -e "  ${CYAN}Node.js:${NC}    ${node_version}"
    echo -e "  ${CYAN}Yarn:${NC}       ${yarn_version}"
    echo -e "  ${CYAN}Project:${NC}    ${PROJECT_DIR}"
    echo ""

    echo -e "  ${YELLOW}Next Steps:${NC}"
    echo ""
    echo -e "  ${GREEN}Development:${NC}"
    echo "    make dev                          Start development mode"
    echo "    make frontend                     Start frontend only"
    echo "    make gateway                      Start API gateway"
    echo ""
    echo -e "  ${GREEN}Docker Deployment:${NC}"
    echo "    make docker-up                    Start all containers"
    echo "    make docker-logs                  View logs"
    echo "    make docker-down                  Stop all containers"
    echo ""
    echo -e "  ${GREEN}Quality:${NC}"
    echo "    make lint                         Run linters"
    echo "    make typecheck                    Run TypeScript checks"
    echo "    make test                         Run tests"
    echo ""
    echo -e "  ${GREEN}Production:${NC}"
    echo "    make deploy                       Full production deployment"
    echo "    make health                       Check service health"
    echo ""

    print_success "Setup completed successfully!"
}

# ============================================
# MAIN
# ============================================

show_help() {
    echo ""
    echo -e "${BLUE}Restpoint — Setup Script${NC}"
    echo ""
    echo "Usage: ./scripts/setup.sh [OPTION]"
    echo ""
    echo "Options:"
    echo "  --node       Check Node.js version and attempt auto-upgrade"
    echo "  --deps       Install dependencies (yarn install)"
    echo "  --build      Build all services"
    echo "  --full       Full setup: node check → deps → build (default)"
    echo "  --help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/setup.sh              # Full setup"
    echo "  ./scripts/setup.sh --node       # Just fix Node.js"
    echo "  ./scripts/setup.sh --deps       # Just install deps"
    echo ""
}

main() {
    local mode="${1:-full}"

    cd "$PROJECT_DIR"

    case "$mode" in
        --help|-h)
            show_help
            exit 0
            ;;
        --node|-n)
            if ! check_node_version; then
                upgrade_node || exit 1
                exec bash "$0" --node  # Re-check with new Node
            fi
            ;;
        --deps|-d)
            install_dependencies
            ;;
        --build|-b)
            build_services
            ;;
        --full|"")
            local needs_exit=0

            # Step 1: Check & upgrade Node.js
            if ! check_node_version; then
                upgrade_node || needs_exit=1
                if [ "$needs_exit" -eq 1 ]; then
                    exit 1
                fi
                # Re-exec to pick up new node in PATH
                exec bash "$0" --full
            fi

            # Step 2: Check yarn
            check_yarn || exit 1

            # Step 3: Install dependencies
            install_dependencies

            # Step 4: Build
            build_services

            # Summary
            show_summary
            ;;
        *)
            print_error "Unknown option: $mode"
            echo "Usage: ./scripts/setup.sh [--node | --deps | --build | --full | --help]"
            exit 1
            ;;
    esac
}

main "$@"