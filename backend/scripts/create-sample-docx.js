const fs = require('fs');
const JSZip = require('../../frotend/node_modules/jszip');

const zip = new JSZip();

zip.file(
  '[Content_Types].xml',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
);

zip.folder('_rels').file(
  '.rels',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
);

zip.folder('word').file(
  'document.xml',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:t>Modern Digital Reading: Principles &amp; Perspectives</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:i/><w:sz w:val="24"/></w:rPr><w:t>By ReadRise Research Collective</w:t></w:r></w:p>
    <w:p><w:r><w:t>Word documents represent one of the world's most widely shared text formats. When converted with precision into semantic HTML, readers enjoy the full fidelity of paragraphs, headings, and formatting without needing proprietary software.</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>Chapter 1: The Evolution of Document Readers</w:t></w:r></w:p>
    <w:p><w:r><w:t>Early document viewers were constrained by fixed page layouts and heavy desktop runtimes. Today's modern browser platform enables instantaneous client-side rendering with Mammoth.js, streaming typography, custom font sizing, and seamless dark and sepia modes.</w:t></w:r></w:p>
    <w:p><w:r><w:t>Every reader can now customize their environment, bookmark pivotal passages, and sync reading progress back to a PostgreSQL cloud database.</w:t></w:r></w:p>
  </w:body>
</w:document>`
);

zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
  .pipe(fs.createWriteStream('./uploads/sample-research.docx'))
  .on('finish', () => console.log('DOCX generated successfully at ./uploads/sample-research.docx'));
