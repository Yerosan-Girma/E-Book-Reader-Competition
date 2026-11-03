const path = require('path');
const fs = require('fs/promises');
const mammoth = require('mammoth');
const WordExtractor = require('word-extractor');

const wordExtractor = new WordExtractor();

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function convertDocumentToHtml(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.docx') {
    const result = await mammoth.convertToHtml({ path: filePath });
    return {
      format: 'docx',
      html: result.value,
      messages: result.messages,
    };
  }

  if (ext === '.doc') {
    const extracted = await wordExtractor.extract(filePath);
    const body = extracted.getBody();
    const paragraphs = body
      .split(/\r?\n\s*\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${escapeHtml(p).replace(/\r?\n/g, '<br/>')}</p>`)
      .join('\n');

    return {
      format: 'doc',
      html: paragraphs || '<p>No content could be extracted from this Word document.</p>',
    };
  }

  if (ext === '.txt') {
    const text = await fs.readFile(filePath, 'utf8');
    const paragraphs = text
      .split(/\r?\n\s*\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${escapeHtml(p).replace(/\r?\n/g, '<br/>')}</p>`)
      .join('\n');

    return {
      format: 'txt',
      html: paragraphs || '<p>Empty text file.</p>',
    };
  }

  throw new Error(`Automatic conversion is not supported for ${ext} files`);
}

module.exports = {
  convertDocumentToHtml,
};
