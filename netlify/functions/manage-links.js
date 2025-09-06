const fs = require('fs').promises;
const path = require('path');

exports.handler = async function(event, context) {
  try {
    const { sourceFile, archiveFile, links } = JSON.parse(event.body);
    
    // Use /tmp for temporary storage
    const sourcePath = path.join('/tmp', sourceFile);
    const archivePath = path.join('/tmp', archiveFile);
    
    // Keep the 5 newest links (assuming newest at top)
    const newestLinks = links.slice(0, 5);
    const oldestLinks = links.length > 5 ? links.slice(5) : [];
    
    // Update source file in /tmp
    const sourceContent = newestLinks.map(link => `${link.title}|${link.url}`).join('\n') + '\n';
    await fs.writeFile(sourcePath, sourceContent);
    
    // Append oldest links to archive in /tmp
    if (oldestLinks.length > 0) {
      let archiveContent = '';
      try {
        archiveContent = await fs.readFile(archivePath, 'utf8');
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      const archiveLines = archiveContent.split('\n').filter(line => line.trim());
      oldestLinks.forEach(link => {
        archiveLines.unshift(`${link.title}|${link.url}`);
      });
      await fs.writeFile(archivePath, archiveLines.join('\n') + '\n');
    }
    
    // Return archived links for debugging
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: `Processed ${sourceFile} and archived to ${archiveFile} in /tmp`,
        archivedLinks: oldestLinks,
        newestLinks: newestLinks
      })
    };
  } catch (error) {
    console.error('Error in manage-links:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to manage links', details: error.message })
    };
  }
};
