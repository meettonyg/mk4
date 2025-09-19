/**
 * Log Formatter Utilities
 * Provides formatting helpers for structured logging output
 */

class LogFormatter {
    constructor() {
        this.colors = {
            success: '#4CAF50',
            error: '#F44336',
            warning: '#FF9800',
            info: '#2196F3',
            debug: '#757575',
            primary: '#9C27B0',
            secondary: '#00BCD4'
        };
        
        this.icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            debug: '🔍',
            time: '⏱️',
            performance: '⚡',
            network: '🌐',
            state: '💾',
            ui: '🎨',
            init: '🚀',
            race: '🏁'
        };
    }
    
    /**
     * Format duration with appropriate units
     */
    formatDuration(ms) {
        if (ms < 1) {
            return `${(ms * 1000).toFixed(0)}μs`;
        } else if (ms < 1000) {
            return `${ms.toFixed(1)}ms`;
        } else if (ms < 60000) {
            return `${(ms / 1000).toFixed(1)}s`;
        } else {
            return `${(ms / 60000).toFixed(1)}m`;
        }
    }
    
    /**
     * Format bytes with appropriate units
     */
    formatBytes(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)}${units[unitIndex]}`;
    }
    
    /**
     * Format timestamp
     */
    formatTimestamp(timestamp, options = {}) {
        const {
            includeDate = false,
            includeMilliseconds = true,
            relative = false
        } = options;
        
        if (relative) {
            const diff = Date.now() - timestamp;
            if (diff < 1000) return 'just now';
            if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
            if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
            return `${Math.floor(diff / 3600000)}h ago`;
        }
        
        const date = new Date(timestamp);
        const time = date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            ...(includeMilliseconds && { fractionalSecondDigits: 3 })
        });
        
        if (includeDate) {
            const dateStr = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            return `${dateStr} ${time}`;
        }
        
        return time;
    }
    
    /**
     * Create a progress bar
     */
    createProgressBar(value, max, width = 20) {
        const percentage = Math.min(100, Math.max(0, (value / max) * 100));
        const filled = Math.round((percentage / 100) * width);
        const empty = width - filled;
        
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        return `[${bar}] ${percentage.toFixed(0)}%`;
    }
    
    /**
     * Create a sparkline chart
     */
    createSparkline(values, options = {}) {
        const {
            height = 5,
            width = values.length,
            char = '█'
        } = options;
        
        if (values.length === 0) return '';
        
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;
        
        // Normalize values to height
        const normalized = values.map(v => 
            Math.round(((v - min) / range) * (height - 1))
        );
        
        // Create lines
        const lines = [];
        for (let h = height - 1; h >= 0; h--) {
            const line = normalized.map(v => v >= h ? char : ' ').join('');
            lines.push(line);
        }
        
        return lines.join('\n');
    }
    
    /**
     * Format object for console display
     */
    formatObject(obj, options = {}) {
        const {
            maxDepth = 3,
            indent = 2,
            colorize = true
        } = options;
        
        return JSON.stringify(obj, null, indent);
    }
    
    /**
     * Create a table for console
     */
    createTable(data, options = {}) {
        const {
            headers = Object.keys(data[0] || {}),
            maxColumnWidth = 30,
            padding = 2
        } = options;
        
        if (data.length === 0) return 'No data';
        
        // Calculate column widths
        const widths = headers.map(header => {
            const values = data.map(row => String(row[header] || ''));
            const maxLength = Math.max(
                header.length,
                ...values.map(v => v.length)
            );
            return Math.min(maxLength, maxColumnWidth);
        });
        
        // Create separator
        const separator = widths.map(w => '-'.repeat(w + padding * 2)).join('+');
        
        // Format rows
        const formatRow = (values) => {
            return values.map((value, i) => {
                const str = String(value).substring(0, widths[i]);
                return str.padEnd(widths[i] + padding).padStart(widths[i] + padding * 2);
            }).join('|');
        };
        
        // Build table
        const lines = [];
        lines.push(separator);
        lines.push(formatRow(headers));
        lines.push(separator);
        
        data.forEach(row => {
            const values = headers.map(h => row[h] || '');
            lines.push(formatRow(values));
        });
        
        lines.push(separator);
        
        return lines.join('\n');
    }
    
    /**
     * Create a tree structure
     */
    createTree(node, options = {}) {
        const {
            indent = '  ',
            branch = '├─ ',
            lastBranch = '└─ ',
            vertical = '│  ',
            empty = '   '
        } = options;
        
        const lines = [];
        
        const traverse = (node, prefix = '', isLast = true) => {
            const connector = isLast ? lastBranch : branch;
            const extension = isLast ? empty : vertical;
            
            lines.push(prefix + connector + node.name);
            
            if (node.children && node.children.length > 0) {
                node.children.forEach((child, index) => {
                    const isLastChild = index === node.children.length - 1;
                    traverse(child, prefix + extension, isLastChild);
                });
            }
        };
        
        lines.push(node.name);
        if (node.children) {
            node.children.forEach((child, index) => {
                const isLastChild = index === node.children.length - 1;
                traverse(child, '', isLastChild);
            });
        }
        
        return lines.join('\n');
    }
    
    /**
     * Format error with stack trace
     */
    formatError(error, options = {}) {
        const {
            includeStack = true,
            maxStackLines = 5,
            highlightUserCode = true
        } = options;
        
        const lines = [`${this.icons.error} ${error.name}: ${error.message}`];
        
        if (includeStack && error.stack) {
            const stackLines = error.stack.split('\n').slice(1); // Skip first line (error message)
            const relevantLines = stackLines.slice(0, maxStackLines);
            
            lines.push('\nStack Trace:');
            relevantLines.forEach(line => {
                const isUserCode = !line.includes('node_modules') && 
                                  !line.includes('native') &&
                                  line.includes('.js');
                
                if (highlightUserCode && isUserCode) {
                    lines.push(`  ${this.icons.warning} ${line.trim()}`);
                } else {
                    lines.push(`    ${line.trim()}`);
                }
            });
            
            if (stackLines.length > maxStackLines) {
                lines.push(`    ... ${stackLines.length - maxStackLines} more lines`);
            }
        }
        
        return lines.join('\n');
    }
    
    /**
     * Create a diff view
     */
    createDiff(oldValue, newValue, options = {}) {
        const {
            context = 2,
            colorize = true
        } = options;
        
        const oldStr = typeof oldValue === 'string' ? oldValue : JSON.stringify(oldValue, null, 2);
        const newStr = typeof newValue === 'string' ? newValue : JSON.stringify(newValue, null, 2);
        
        const oldLines = oldStr.split('\n');
        const newLines = newStr.split('\n');
        
        const diff = [];
        
        // Simple line-by-line diff (for demonstration)
        const maxLines = Math.max(oldLines.length, newLines.length);
        
        for (let i = 0; i < maxLines; i++) {
            const oldLine = oldLines[i] || '';
            const newLine = newLines[i] || '';
            
            if (oldLine === newLine) {
                diff.push(`  ${oldLine}`);
            } else if (oldLine && !newLine) {
                diff.push(`- ${oldLine}`);
            } else if (!oldLine && newLine) {
                diff.push(`+ ${newLine}`);
            } else {
                diff.push(`- ${oldLine}`);
                diff.push(`+ ${newLine}`);
            }
        }
        
        return diff.join('\n');
    }
    
    /**
     * Format performance metrics
     */
    formatPerformanceMetrics(metrics) {
        const lines = [];
        
        Object.entries(metrics).forEach(([operation, data]) => {
            const status = data.avg < data.target ? this.icons.success : 
                          data.avg < data.target * 1.2 ? this.icons.warning : 
                          this.icons.error;
            
            lines.push(`${status} ${operation}:`);
            lines.push(`   Average: ${this.formatDuration(data.avg)}`);
            lines.push(`   P95: ${this.formatDuration(data.p95)}`);
            lines.push(`   Count: ${data.count}`);
            
            if (data.trend) {
                lines.push(`   Trend: ${data.trend}`);
            }
        });
        
        return lines.join('\n');
    }
    
    /**
     * Create a summary box
     */
    createSummaryBox(title, content, options = {}) {
        const {
            width = 60,
            padding = 2,
            borderChar = '═'
        } = options;
        
        const lines = content.split('\n');
        const maxContentWidth = Math.max(title.length, ...lines.map(l => l.length));
        const boxWidth = Math.max(width, maxContentWidth + padding * 2);
        
        const top = '╔' + borderChar.repeat(boxWidth - 2) + '╗';
        const bottom = '╚' + borderChar.repeat(boxWidth - 2) + '╝';
        const side = '║';
        
        const output = [top];
        
        // Title
        const titlePadding = Math.floor((boxWidth - title.length - 2) / 2);
        output.push(side + ' '.repeat(titlePadding) + title + ' '.repeat(boxWidth - titlePadding - title.length - 2) + side);
        output.push(side + ' '.repeat(boxWidth - 2) + side);
        
        // Content
        lines.forEach(line => {
            const paddedLine = line.padEnd(boxWidth - padding * 2);
            output.push(side + ' '.repeat(padding) + paddedLine + ' '.repeat(padding) + side);
        });
        
        output.push(bottom);
        
        return output.join('\n');
    }
}

// Create singleton instance
const logFormatter = new LogFormatter();

// Export
export { logFormatter, LogFormatter };