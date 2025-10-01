/**
 * Export Service - Pure Vue Implementation
 * Handles exporting media kits to various formats
 */

export class ExportService {
  
  /**
   * Main export method - routes to specific format handler
   */
  async export(format, state) {
    console.log(`📤 Exporting as ${format}...`);
    
    switch (format) {
      case 'html':
        return this.exportHTML(state);
      case 'pdf':
        return this.exportPDF(state);
      case 'json':
        return this.exportJSON(state);
      case 'shortcode':
        return this.exportShortcode(state);
      default:
        throw new Error(`Unknown export format: ${format}`);
    }
  }

  /**
   * Export as standalone HTML file
   */
  exportHTML(state) {
    const html = this.generateHTML(state);
    this.download(html, `${this.sanitizeFilename(state.postTitle)}.html`, 'text/html');
    console.log('✅ HTML export complete');
  }

  /**
   * Generate complete HTML document
   */
  generateHTML(state) {
    const { postTitle, components, sections, theme } = state;
    
    // Generate HTML structure
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(postTitle)}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .media-kit-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .section {
            margin-bottom: 40px;
        }
        .component {
            margin-bottom: 24px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
        }
        h1 { font-size: 2.5em; margin-bottom: 0.5em; }
        h2 { font-size: 2em; margin-bottom: 0.5em; }
        h3 { font-size: 1.5em; margin-bottom: 0.5em; }
        p { margin-bottom: 1em; }
        /* Theme: ${theme} */
    </style>
</head>
<body>
    <div class="media-kit-container">
        <h1>${this.escapeHtml(postTitle)}</h1>
`;

    // Add sections and components
    if (sections && sections.length > 0) {
      sections.forEach(section => {
        html += `        <div class="section">\n`;
        
        // Get components for this section
        const sectionComponents = section.components || [];
        sectionComponents.forEach(componentId => {
          const component = components[componentId];
          if (component) {
            html += `            <div class="component">\n`;
            html += `                ${this.renderComponent(component)}\n`;
            html += `            </div>\n`;
          }
        });
        
        html += `        </div>\n`;
      });
    }

    html += `    </div>
</body>
</html>`;

    return html;
  }

  /**
   * Render a single component as HTML
   */
  renderComponent(component) {
    const { type, data } = component;
    
    switch (type) {
      case 'hero':
        return `<div class="hero">
          <h2>${this.escapeHtml(data.title || 'Hero Title')}</h2>
          <p>${this.escapeHtml(data.subtitle || '')}</p>
        </div>`;
        
      case 'biography':
        return `<div class="biography">
          <h3>Biography</h3>
          <p>${this.escapeHtml(data.bio || data.biography || 'Biography content')}</p>
        </div>`;
        
      case 'topics':
        const topics = data.topics || [];
        const topicsHtml = topics.map(t => `<li>${this.escapeHtml(t.title || t)}</li>`).join('\n            ');
        return `<div class="topics">
          <h3>Topics</h3>
          <ul>
            ${topicsHtml}
          </ul>
        </div>`;
        
      default:
        return `<div class="${type}">
          <h3>${this.capitalize(type)}</h3>
          <p>Component content</p>
        </div>`;
    }
  }

  /**
   * Export as PDF (uses print dialog)
   */
  exportPDF(state) {
    // Generate HTML and open in new window for printing
    const html = this.generateHTML(state);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Trigger print dialog after content loads
      printWindow.onload = () => {
        printWindow.print();
      };
      
      console.log('✅ PDF export initiated (print dialog)');
    } else {
      throw new Error('Could not open print window. Please check popup blocker settings.');
    }
  }

  /**
   * Export as JSON
   */
  exportJSON(state) {
    const exportData = {
      version: '2.0',
      exported: new Date().toISOString(),
      postTitle: state.postTitle,
      components: state.components,
      sections: state.sections,
      theme: state.theme,
      themeCustomizations: state.themeCustomizations,
      globalSettings: state.globalSettings
    };
    
    const json = JSON.stringify(exportData, null, 2);
    this.download(json, `${this.sanitizeFilename(state.postTitle)}-backup.json`, 'application/json');
    console.log('✅ JSON export complete');
  }

  /**
   * Export as WordPress shortcode
   */
  exportShortcode(state) {
    const postId = window.gmkbData?.postId || '';
    const shortcode = `[guestify_media_kit id="${postId}"]`;
    
    // Copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shortcode).then(() => {
        alert(`Shortcode copied to clipboard!\n\n${shortcode}\n\nPaste this into any WordPress post or page.`);
        console.log('✅ Shortcode copied to clipboard');
      }).catch(err => {
        // Fallback: show in alert
        prompt('Copy this shortcode:', shortcode);
      });
    } else {
      // Fallback for older browsers
      prompt('Copy this shortcode:', shortcode);
    }
  }

  /**
   * Download file utility
   */
  download(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Capitalize string
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
