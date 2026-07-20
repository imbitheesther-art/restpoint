/**
 * Script to batch-replace lucide-react imports with custom SVG icons
 * Run: node scripts/replace-lucide-icons.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const SRC_DIR = join(import.meta.dirname, '..', 'src');
const ICONS_PATH = '../../utils/icons/icons';
let totalFiles = 0;
let totalIcons = 0;

// Map lucide icon names that are different from our SVG icon names
const LUCIDE_TO_CUSTOM = {
  'TrendingUp as TrendUp': 'TrendingUp',
  'Square as Button': 'StopCircle',
  'BarChart3': 'BarChart3',
  'AlertTriangle': 'AlertTriangle',
  'CheckCircle2': 'CheckCircle',
  'ShieldCheck': 'ShieldCheck',
  'ShieldAlert': 'AlertTriangle',
  'AlertCircle': 'AlertCircle',
  'ArrowRight': 'ArrowRight',
  'ArrowLeft': 'ArrowLeft',
  'ArrowUp': 'ArrowUp',
  'ArrowDown': 'ArrowDown',
  'ChevronDown': 'ChevronDown',
  'ChevronRight': 'ChevronRight',
  'ChevronUp': 'ChevronUp',
  'ChevronLeft': 'ChevronLeft',
  'ChevronsLeft': 'ChevronFirst',
  'ChevronsRight': 'ChevronLast',
  'User': 'User',
  'Users': 'Users',
  'UserCheck': 'UserCheck',
  'UserPlus': 'UserPlus',
  'UserMinus': 'UserMinus',
  'UserX': 'UserMinus',
  'Mail': 'Mail',
  'MailOpen': 'Mail',
  'MessageSquare': 'MessageSquare',
  'MessageCircle': 'MessageCircle',
  'MessageCircleWarning': 'AlertCircle',
  'Send': 'Send',
  'Phone': 'Phone',
  'PhoneCall': 'Phone',
  'MapPin': 'MapPin',
  'Navigation': 'Navigation',
  'Navigation2': 'Navigation',
  'Map': 'MapPin',
  'Globe': 'Globe',
  'Building': 'Building2',
  'Building2': 'Building2',
  'Home': 'Home',
  'Plus': 'Plus',
  'PlusCircle': 'PlusCircle',
  'Minus': 'X',
  'X': 'X',
  'XCircle': 'XCircle',
  'Check': 'Check',
  'CheckCircle': 'CheckCircle',
  'Trash2': 'Trash2',
  'Trash': 'Trash2',
  'Edit': 'Edit',
  'Edit2': 'Edit3',
  'Edit3': 'Edit3',
  'Pencil': 'Edit3',
  'Save': 'Save',
  'Download': 'Download',
  'Upload': 'Upload',
  'Printer': 'Printer',
  'Search': 'Search',
  'Filter': 'Filter',
  'Sliders': 'SlidersHorizontal',
  'Settings': 'Settings',
  'Cog': 'Settings',
  'RefreshCw': 'RefreshCw',
  'RefreshCcw': 'RotateCcw',
  'RotateCw': 'RotateCw',
  'RotateCcw': 'RotateCcw',
  'Copy': 'Copy',
  'Clipboard': 'ClipboardList',
  'ClipboardList': 'ClipboardList',
  'Calendar': 'Calendar',
  'CalendarDays': 'CalendarDays',
  'Clock': 'Clock',
  'Timer': 'Timer',
  'History': 'History',
  'Eye': 'Eye',
  'EyeOff': 'EyeOff',
  'Lock': 'Lock',
  'KeyRound': 'KeyRound',
  'Key': 'KeyRound',
  'Shield': 'Shield',
  'ShieldOff': 'Shield',
  'Bell': 'Bell',
  'BellRing': 'Bell',
  'BellOff': 'Bell',
  'FileText': 'FileText',
  'File': 'FileText',
  'FileImage': 'FileImage',
  'FileSpreadsheet': 'FileSpreadsheet',
  'Folder': 'Box',
  'FolderOpen': 'Box',
  'DollarSign': 'DollarSign',
  'CreditCard': 'CreditCard',
  'Wallet': 'Wallet',
  'Receipt': 'Receipt',
  'TrendingUp': 'TrendingUp',
  'TrendingDown': 'TrendingDown',
  'BarChart': 'BarChart2',
  'BarChart2': 'BarChart2',
  'BarChart3': 'BarChart3',
  'Activity': 'Activity',
  'Zap': 'Zap',
  'ZapOff': 'Zap',
  'Package': 'Package',
  'Box': 'Box',
  'ShoppingCart': 'ShoppingCart',
  'Truck': 'Truck',
  'Car': 'Car',
  'Fuel': 'Fuel',
  'Gauge': 'Gauge',
  'Server': 'Server',
  'HardDrive': 'HardDrive',
  'Database': 'HardDrive',
  'Cloud': 'Box',
  'Sun': 'Sun',
  'Moon': 'Moon',
  'Smartphone': 'Smartphone',
  'Tablet': 'Smartphone',
  'Monitor': 'Server',
  'Laptop': 'Server',
  'Wifi': 'Wifi',
  'WifiOff': 'WifiOff',
  'LogOut': 'LogOut',
  'LogIn': 'LogOut',
  'Menu': 'Menu',
  'MoreVertical': 'MoreVertical',
  'MoreHorizontal': 'MoreVertical',
  'Hash': 'Hash',
  'Tag': 'Tag',
  'Star': 'Star',
  'Heart': 'Heart',
  'Info': 'Info',
  'AlertCircle': 'AlertCircle',
  'AlertTriangle': 'AlertTriangle',
  'Loader': 'Loader2',
  'Loader2': 'Loader2',
  'Spinner': 'Loader2',
  'Circle': 'Circle',
  'CircleDot': 'CircleDot',
  'Target': 'Target',
  'Trophy': 'Trophy',
  'Award': 'Trophy',
  'QrCode': 'QrCode',
  'Scan': 'ScanBarcode',
  'ScanBarcode': 'ScanBarcode',
  'Barcode': 'ScanBarcode',
  'LayoutDashboard': 'LayoutDashboard',
  'LayoutGrid': 'Grid',
  'Grid': 'Grid',
  'List': 'List',
  'Columns': 'Columns',
  'Maximize2': 'Maximize2',
  'Minimize2': 'Minimize2',
  'ExternalLink': 'ExternalLink',
  'Link': 'ExternalLink',
  'Unlink': 'ExternalLink',
  'Share2': 'Share2',
  'Share': 'Share2',
  'Play': 'Play',
  'Pause': 'Pause',
  'StopCircle': 'Pause',
  'ZoomIn': 'ZoomIn',
  'ZoomOut': 'ZoomOut',
  'Sunrise': 'Sun',
  'Sunset': 'Moon',
  'CloudSun': 'CloudSun',
  'MoonStar': 'Moon',
  'Loader2': 'Loader2',
  'Spade': 'Hash',
  'Diamond': 'Star',
  'Clover': 'Heart',
  'Flower2': 'Flower2',
  'Github': 'Globe',
  'Twitter': 'Globe',
  'Linkedin': 'Globe',
  'Youtube': 'Globe',
  'Instagram': 'Globe',
  'Facebook': 'Globe',
  'GraduationCap': 'Trophy',
  'Brain': 'Server',
  'Wrench': 'Settings',
  'Cpu': 'Server',
  'MonitorSmartphone': 'Smartphone',
  'Landmark': 'Building2',
  'Linkedin': 'Globe',
};

function getAllFiles(dir) {
  const files = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        if (!entry.startsWith('.') && entry !== 'node_modules') {
          files.push(...getAllFiles(fullPath));
        }
      } else if (entry.endsWith('.jsx') || entry.endsWith('.tsx') || entry.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  } catch {}
  return files;
}

function processFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  const original = content;

  // Match import statements from lucide-react
  const lucideImportRegex = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g;
  let match;
  let hasChanges = false;

  while ((match = lucideImportRegex.exec(content)) !== null) {
    const iconsList = match[1].split(',').map(s => s.trim()).filter(Boolean);
    const customIcons = [];
    const missingIcons = [];

    for (const icon of iconsList) {
      const cleanName = icon.replace(/\s+as\s+\w+/, '').trim();
      const customName = LUCIDE_TO_CUSTOM[icon] || LUCIDE_TO_CUSTOM[cleanName] || cleanName;
      
      if (LUCIDE_TO_CUSTOM[icon] || LUCIDE_TO_CUSTOM[cleanName]) {
        customIcons.push(customName);
      } else {
        customIcons.push(customName);
        // If icon isn't explicitly mapped, it still might work with our naming
      }
    }

    const uniqueIcons = [...new Set(customIcons)];
    
    // Calculate relative path to icons
    const fileDir = filePath.substring(0, filePath.lastIndexOf('/'));
    const srcIndex = fileDir.indexOf('/src/');
    const relPath = srcIndex >= 0 
      ? '../'.repeat((fileDir.substring(srcIndex + 5).split('/').length)) + 'utils/icons/icons'
      : '../../utils/icons/icons';

    // Replace the import
    const newImport = `import { ${uniqueIcons.join(', ')} } from '${relPath}'`;
    content = content.replace(match[0], newImport);
    totalIcons += iconsList.length;
    hasChanges = true;
  }

  if (hasChanges) {
    writeFileSync(filePath, content, 'utf-8');
    totalFiles++;
    console.log(`✓ Updated: ${filePath.replace(SRC_DIR, '').substring(1)} (${totalIcons} icons)`);
  }
}

console.log('🔍 Scanning for lucide-react imports...\n');
const files = getAllFiles(SRC_DIR);
let foundFiles = 0;

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  if (content.includes('lucide-react')) {
    processFile(file);
    foundFiles++;
  }
}

console.log(`\n✅ Done! Updated ${totalFiles} files with ${totalIcons} icons replaced.`);
console.log(`   Total lucide-react files found: ${foundFiles}`);
console.log(`\n⚠️  IMPORTANT: Some icon names may need manual review.`);
console.log(`   Run 'npm run dev' to check for any missing icon imports.`);