// netlify/functions/manage-links.js
const fs = require('fs').promises;
const path = require('path');

exports.handler = async function(event, context) {
  try {
    const { sourceFile, archiveFile, links } = JSON.parse(event.body);
    
    // Assuming .txt files are in the project root
    const sourcePath = path.join(__dirname, '../../', sourceFile);
    const archivePath = path.join(__dirname, '../../', archiveFile);
    
    // Keep the 5 newest links (assuming newest are at the top)
    const newestLinks = links.slice(0, 5);
    const oldestLink = links.length > 5 ? links[links.length - 1] : null;
    
    // Update source file with the 5 newest links
    const sourceContent = newestLinks.map(link => `${link.title}|${link.url}`).join('\n');
    await fs.writeFile(sourcePath, sourceContent + '\n');
    
    // If there's an oldest link, append it to the archive file
    if (oldestLink) {
      let archiveContent = '';
      try {
        archiveContent = await fs.readFile(archivePath, 'utf8');
      } catch (error) {
        if (error.code !== 'ENOENT') throw error; // Ignore if archive file doesn't exist yet
      }
      const archiveLines = archiveContent.split('\n').filter(line => line.trim());
      archiveLines.unshift(`${oldestLink.title}|${oldestLink.url}`); // Add oldest link to top
      await fs.writeFile(archivePath, archiveLines.join('\n') + '\n');
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Successfully updated ${sourceFile} and archived to ${archiveFile}` })
    };
  } catch (error) {
    console.error('Error in manage-links:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to manage links' })
    };
  }
};
