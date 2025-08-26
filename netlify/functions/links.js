const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    const dataDir = path.join(process.cwd(), '_data');
    
    // Check if _data directory exists
    if (!fs.existsSync(dataDir)) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links: [] })
      };
    }

    // Read all markdown files from _data directory
    const files = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const filePath = path.join(dataDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Parse YAML frontmatter
        const lines = content.split('\n');
        const link = {};
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith('title:')) {
            link.title = line.replace('title:', '').trim();
          } else if (line.startsWith('url:')) {
            link.url = line.replace('url:', '').trim();
          } else if (line.startsWith('color:')) {
            link.color = line.replace('color:', '').trim();
          } else if (line.startsWith('status:')) {
            link.status = line.replace('status:', '').trim();
          } else if (line.startsWith('date:')) {
            link.date = line.replace('date:', '').trim();
          }
        }
        
        return {
          ...link,
          timestamp: file.replace('.md', '') // Use filename as timestamp for sorting
        };
      })
      .filter(link => link.title && link.url) // Only include valid links
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // Newest first

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ links: files })
    };

  } catch (error) {
    console.error('Error parsing links:', error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: 'Failed to load links', links: [] })
    };
  }
};
