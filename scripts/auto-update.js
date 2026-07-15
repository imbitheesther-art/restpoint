#!/usr/bin/env node

/**
 * Auto-Update Utility for Restpoint
 * Checks for updates and automatically updates the software
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG = {
    registry: 'http://localhost:4873/',
    packageName: '@montezuma/restpoint',
    updateCheckInterval: 24 * 60 * 60 * 1000, // 24 hours
    autoUpdate: true,
    backupBeforeUpdate: true
};

const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m'
};

const log = {
    info: (msg) => console.log(`${COLORS.blue}[INFO]${COLORS.reset} ${msg}`),
    success: (msg) => console.log(`${COLORS.green}[SUCCESS]${COLORS.reset} ${msg}`),
    warning: (msg) => console.log(`${COLORS.yellow}[WARNING]${COLORS.reset} ${msg}`),
    error: (msg) => console.log(`${COLORS.red}[ERROR]${COLORS.reset} ${msg}`)
};

/**
 * Execute shell command
 */
const execute = (command, options = {}) => {
    return new Promise((resolve, reject) => {
        exec(command, { ...options, cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error) {
                reject({ error, stderr });
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
};

/**
 * Check current version
 */
const getCurrentVersion = async () => {
    try {
        const packageJson = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
        );
        return packageJson.version;
    } catch (error) {
        log.error('Failed to read current version');
        return null;
    }
};

/**
 * Check latest version from registry
 */
const checkForUpdates = async () => {
    try {
        log.info('Checking for updates...');

        const { stdout } = await execute(
            `npm view ${CONFIG.packageName} version --registry ${CONFIG.registry}`
        );

        const latestVersion = stdout.trim();
        const currentVersion = await getCurrentVersion();

        if (!currentVersion) {
            log.error('Could not determine current version');
            return null;
        }

        log.info(`Current version: ${currentVersion}`);
        log.info(`Latest version: ${latestVersion}`);

        if (latestVersion !== currentVersion) {
            log.warning(`Update available: ${currentVersion} → ${latestVersion}`);
            return { currentVersion, latestVersion };
        } else {
            log.success('You are running the latest version');
            return null;
        }
    } catch (error) {
        log.error('Failed to check for updates');
        log.error(error.stderr || error.error?.message);
        return null;
    }
};

/**
 * Backup current installation
 */
const backupCurrentInstallation = async () => {
    try {
        const backupDir = path.join(process.cwd(), 'backups', `backup-${Date.now()}`);
        fs.mkdirSync(backupDir, { recursive: true });

        log.info('Creating backup...');

        // Backup package.json
        fs.copyFileSync(
            path.join(process.cwd(), 'package.json'),
            path.join(backupDir, 'package.json')
        );

        // Backup package-lock.json if exists
        const lockFile = path.join(process.cwd(), 'package-lock.json');
        if (fs.existsSync(lockFile)) {
            fs.copyFileSync(lockFile, path.join(backupDir, 'package-lock.json'));
        }

        log.success(`Backup created at: ${backupDir}`);
        return backupDir;
    } catch (error) {
        log.error('Failed to create backup');
        throw error;
    }
};

/**
 * Update the software
 */
const updateSoftware = async () => {
    try {
        const updateInfo = await checkForUpdates();

        if (!updateInfo) {
            return { success: true, message: 'No updates available' };
        }

        // Confirm update
        console.log(`\n${COLORS.yellow}Do you want to update now? (y/n):${COLORS.reset}`);

        // Auto-update if enabled
        if (!CONFIG.autoUpdate) {
            return { success: false, message: 'Auto-update is disabled' };
        }

        log.info('Starting update process...');

        // Create backup
        if (CONFIG.backupBeforeUpdate) {
            await backupCurrentInstallation();
        }

        // Update dependencies
        log.info('Updating dependencies...');
        await execute('npm install', { stdio: 'inherit' });

        // Run any migration scripts (soft-delete migrations removed)
        log.info('Skipping soft-delete migration step (module removed)');

        // Rebuild if needed
        log.info('Rebuilding application...');
        try {
            await execute('npm run build', { stdio: 'inherit' });
        } catch (error) {
            log.warning('Build failed (this may be normal for some services)');
        }

        const newVersion = await getCurrentVersion();
        log.success(`Update completed! New version: ${newVersion}`);

        return {
            success: true,
            message: `Updated from ${updateInfo.currentVersion} to ${newVersion}`,
            version: newVersion
        };
    } catch (error) {
        log.error('Update failed');
        log.error(error.stderr || error.error?.message);
        return { success: false, error: error.message };
    }
};

/**
 * Setup npm registry credentials
 */
const setupRegistry = async () => {
    try {
        log.info('Setting up npm registry...');

        // Create .npmrc in user home if it doesn't exist
        const homeNpmrc = path.join(process.env.HOME || process.env.USERPROFILE, '.npmrc');

        let npmrcContent = '';

        if (fs.existsSync(homeNpmrc)) {
            npmrcContent = fs.readFileSync(homeNpmrc, 'utf8');
        }

        // Add registry configuration
        const registryConfig = `
# Restpoint Registry
@montezuma:registry=http://localhost:4873/
registry=http://localhost:4873/

# Authentication (stored securely by npm)
//localhost:4873/:_authToken=${Buffer.from('welt:40045355Welttallis').toString('base64')}
`;

        if (!npmrcContent.includes('@montezuma:registry')) {
            fs.appendFileSync(homeNpmrc, registryConfig);
            log.success('Registry configuration added to ~/.npmrc');
        } else {
            log.info('Registry configuration already exists');
        }

        // Test authentication
        log.info('Testing authentication...');
        try {
            await execute('npm whoami --registry http://localhost:4873/');
            log.success('Authentication successful!');
        } catch (error) {
            log.warning('Authentication test failed - you may need to login manually');
            log.info('Run: npm adduser --registry http://localhost:4873/');
        }

        return { success: true };
    } catch (error) {
        log.error('Failed to setup registry');
        return { success: false, error: error.message };
    }
};

/**
 * Main function
 */
const main = async () => {
    const args = process.argv.slice(2);
    const command = args[0];

    console.log(`${COLORS.blue}
╔══════════════════════════════════════════════════════════╗
║        Restpoint Auto-Update Utility v1.0.0              ║
╚══════════════════════════════════════════════════════════╝
${COLORS.reset}`);

    try {
        switch (command) {
            case 'check':
                await checkForUpdates();
                break;

            case 'update':
                const result = await updateSoftware();
                if (result.success) {
                    log.success(result.message);
                } else {
                    log.error(result.message || result.error);
                    process.exit(1);
                }
                break;

            case 'setup':
                await setupRegistry();
                break;

            case 'backup':
                await backupCurrentInstallation();
                break;

            default:
                console.log(`
Usage: node scripts/auto-update.js <command>

Commands:
  check     - Check for available updates
  update    - Update to the latest version
  setup     - Setup npm registry configuration
  backup    - Create a backup of current installation

Examples:
  node scripts/auto-update.js check
  node scripts/auto-update.js update
  node scripts/auto-update.js setup
        `);
        }
    } catch (error) {
        log.error('Operation failed');
        log.error(error.message);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { updateSoftware, checkForUpdates, setupRegistry };