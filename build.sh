#!/usr/bin/env bash

# =============================================================================
# UNIVERSAL WordPress PLUGIN BUILD SCRIPT
# - Builds frontend assets (if build:plugin script exists)
# - Packages production files into a versioned zip package
# Usage:
#   ./build.sh <plugin-slug>
# =============================================================================

set -euo pipefail

# ✅ Change to the script's directory immediately to prevent path issues
cd "$(dirname "$0")" || exit

# --- Configuration & Paths (Relative) ---
SOURCE_DIR="./SVN/trunk"
PM_ASSETS_DIR="./wp-assets"
TEMP_DIR="./temp_build"
DEFAULT_PLUGIN_SLUG="plusmagi"

# ✅ Patterns to exclude during rsync (prevents packing dev/test files)
EXCLUDE_PATTERNS=(
	"--exclude=.DS_Store"
	"--exclude=__MACOSX"
	"--exclude=assets/ts"
	"--exclude=node_modules"
	"--exclude=.git"
	"--exclude=.gitignore"
	"--exclude=package.json"
	"--exclude=package-lock.json"
	"--exclude=tsconfig.json"
	"--exclude=vite.config.*"
	"--exclude=*.log"
)

# 1. Resolve Plugin Slug priority: Argument > Env Variable > package.json > Default
resolve_slug() {
	if [[ -n "${1:-}" ]]; then
		echo "$1"
		return
	fi

	if [[ -n "${PLUGIN_SLUG_TO_USE:-}" ]]; then
		echo "$PLUGIN_SLUG_TO_USE"
		return
	fi

	local package_json="./package.json"
	if [[ -f "$package_json" ]]; then
		local module_name
		module_name=$(grep '"name":' "$package_json" | head -n1 | cut -d'"' -f4 || true)
		if [[ -n "$module_name" ]]; then
			echo "$module_name"
			return
		fi
	fi

	echo "$DEFAULT_PLUGIN_SLUG"
}

# 2. Compile frontend assets if the build script exists in package.json
build_frontend_if_present() {
	local package_json="./package.json"

	if [[ -f "$package_json" ]] && grep -q '"build:plugin"' "$package_json"; then
		echo "-> Compiling Frontend Assets via workspace build..."
		npm run build:plugin
		echo "✅ Frontend Build Completed."
	else
		echo "-> No 'build:plugin' script found in package.json, skipping frontend build."
	fi
}

main() {
	local raw_slug plugin_slug display_name target_php_file version zip_filename abs_assets_dir

	raw_slug="$(resolve_slug "${1:-}")"
	plugin_slug="${raw_slug#wp-}"
	display_name="$plugin_slug"

	target_php_file="$SOURCE_DIR/$plugin_slug.php"
	if [[ ! -f "$target_php_file" ]]; then
		echo "❌ Error: Main plugin file not found at $target_php_file" >&2
		exit 1
	fi

	# Extract Version and handle CRLF (\r) issues from files edited in Windows
	version=$(grep -i "Version:" "$target_php_file" | head -n1 | sed -E 's/.*Version:[[:space:]]*//i' | tr -d '\r' | xargs || true)
	if [[ -z "$version" ]]; then
		echo "❌ Error: Could not find 'Version:' header in $target_php_file" >&2
		exit 1
	fi

	echo "-----------------------------------------"
	echo "🔎 Target Plugin Slug: $plugin_slug"
	echo "🚀 Building version: $version"
	echo "-----------------------------------------"

	build_frontend_if_present

	# Prepare directories
	mkdir -p "$PM_ASSETS_DIR"
	rm -rf "$TEMP_DIR"
	mkdir -p "$TEMP_DIR/$plugin_slug"

	echo "-> Copying core deployment files..."
	if command -v rsync >/dev/null 2>&1; then
		rsync -a "${EXCLUDE_PATTERNS[@]}" "$SOURCE_DIR/" "$TEMP_DIR/$plugin_slug/"
	else
		# Fallback for systems without rsync
		cp -R "$SOURCE_DIR"/* "$TEMP_DIR/$plugin_slug/"
		rm -rf "$TEMP_DIR/$plugin_slug/assets/ts" "$TEMP_DIR/$plugin_slug/node_modules" || true
	fi

	zip_filename="${display_name}-${version}.zip"

	echo "-> Creating zip archive..."
	(
		cd "$TEMP_DIR"
		zip -qr "$zip_filename" "$plugin_slug" -x "*.DS_Store" -x "__MACOSX"

		# ✅ Set permissions: owner read/write, others read-only (644)
		chmod 644 "$zip_filename"

		# Fetch owner/group and append || true to prevent failure if chown lacks privileges
		local user_group
		user_group=$(stat -f "%u:%g" "$SOURCE_DIR" 2>/dev/null || stat --format="%U:%G" "$SOURCE_DIR" 2>/dev/null || echo "")
		if [[ -n "$user_group" ]]; then
			chown "$user_group" "$zip_filename" 2>/dev/null || true
		fi
	)

	echo "-> Moving final assets..."
	mv "$TEMP_DIR/$zip_filename" "$PM_ASSETS_DIR/$zip_filename"

	# Cleanup
	rm -rf "$TEMP_DIR"

	# ✅ Get absolute path of PM_ASSETS_DIR
	abs_assets_dir=$(cd "$PM_ASSETS_DIR" && pwd)

	echo "✅ Build Complete!"
	echo "📦 Versioned zip: $abs_assets_dir/$zip_filename"
}

# Run the main function and pass all arguments
main "$@"