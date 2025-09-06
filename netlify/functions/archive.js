const fs = require('fs').promises;
const path = require('path');

exports.handler = async function(event, context) {
  try {
    console.log('Archive function triggered with event:', event.body); // Debug: Log incoming request
    const { file, links } = JSON.parse(event.body);
    console.log('Parsed file:', file, 'Links:', links); // Debug: Log parsed data
    
    if (!file || !links || !Array.isArray(links)) {
      console.log('Invalid request: file and links required'); // Debug: Log validation failure
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request: file and links required' })
      };
    }
    
    const filePath = path.join(__dirname, '../../', file);
    console.log('Attempting to write to file:', filePath); // Debug: Log file path
    await fs.appendFile(filePath, links.join('\n') + '\n');
    console.log(`Successfully archived to ${file}`); // Debug: Log success
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Successfully archived to ${file}` })
    };
  } catch (error) {
    console.error(`Error archiving to ${file}:`, error); // Debug: Log error
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to archive: ${error.message}` })
    };
  }
};
