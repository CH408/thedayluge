const fs = require('fs').promises;
const path = require('path');

exports.handler = async function(event, context) {
  try {
    const { file, links } = JSON.parse(event.body);
    if (!file || !links || !Array.isArray(links)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request: file and links required' })
      };
    }
    const filePath = path.join(__dirname, '../../', file);
    await fs.appendFile(filePath, links.join('\n') + '\n');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Successfully archived to ${file}` })
    };
  } catch (error) {
    console.error(`Error archiving to ${file}:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to archive: ${error.message}` })
    };
  }
};
