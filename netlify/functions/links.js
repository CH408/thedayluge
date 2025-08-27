const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  try {
    const dataDir = path.join(__dirname, '../../_data');
    
    // Check if _data directory exists
    try {
      await fs.access(dataDir);
    } catch {
      console.log('_data directory not found at', dataDir);
      return {
        statusCode: 200,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ links: [] })
      };
    }

    // Read all markdown files from _data directory
    const files = await fs.readdir(dataDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    const links = [];
    
    for (const file of markdownFiles) {
      try {
        const filePath = path.join(dataDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Parse YAML frontmatter more robustly
        const lines = content.split('\n');
        const link = {
          timestamp: file.replace('.md', '') // Use filename for sorting
        };
        
        let inFrontMatter = false;
        for (const line of lines) {
          const trimmed = line.trim();
          
          if (trimmed === '---') {
            inFrontMatter = !inFrontMatter;
            continue;
          }
          
          if (!inFrontMatter) continue;
          
          if (trimmed.includes(':')) {
            const [key, ...valueParts] = trimmed.split(':');
            const value = valueParts.join(':').trim();
            
            switch(key.trim()) {
              case 'title':
                link.title = value;
                break;
              case 'url':
                link.url = value;
                break;
              case 'color':
                link.color = value;
                break;
              case 'status':
                link.status = value;
                break;
              case 'date':
                link.date = value;
                break;
            }
          }
        }
        
        // Only include valid links
        if (link.title && link.url) {
          links.push(link);
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }

    // Sort by timestamp (newest first)
    links.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ links })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        error: error.message, 
        links: [] 
      })
    };
  }
};
