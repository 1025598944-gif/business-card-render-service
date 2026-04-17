const express = require('express');
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const app = express();

const PORT = Number(process.env.PORT || 3200);
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_BASE_URL =
  (process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${PORT}`).replace(/\/$/, '');
const OUTPUT_DIR = path.join(__dirname, 'public', 'cards');
const VIEWPORT_WIDTH = Number(process.env.CARD_WIDTH || 1125);
const VIEWPORT_HEIGHT = Number(process.env.CARD_HEIGHT || 637);
const EDGE_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

app.use(express.json({ limit: '5mb' }));
app.use('/cards', express.static(OUTPUT_DIR, { maxAge: '7d' }));

function createFileName(ext = 'png') {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const random = Math.random().toString(36).slice(2, 10);
  return `card-${stamp}-${random}.${ext}`;
}

function normalizeHtml(htmlContent) {
  if (!htmlContent || typeof htmlContent !== 'string') {
    throw new Error('html_content is required and must be a string.');
  }

  const trimmed = htmlContent.trim();
  if (!trimmed.toLowerCase().includes('<html')) {
    throw new Error('html_content must be a complete HTML document.');
  }

  return trimmed;
}

async function renderHtmlToPng(htmlContent, outputPath) {
  const edgeExecutablePath = EDGE_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  const browser = await chromium.launch({
    headless: true,
    executablePath: edgeExecutablePath
  });

  try {
    const page = await browser.newPage({
      viewport: {
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT
      },
      deviceScaleFactor: 2
    });

    await page.setContent(htmlContent, {
      waitUntil: 'load'
    });

    await page.screenshot({
      path: outputPath,
      type: 'png'
    });
  } finally {
    await browser.close();
  }
}

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'business-card-render-service',
    public_base_url: PUBLIC_BASE_URL
  });
});

app.post('/render-card', async (req, res) => {
  try {
    const htmlContent = normalizeHtml(req.body.html_content);
    const outputFileName =
      typeof req.body.output_filename === 'string' && req.body.output_filename.trim()
        ? req.body.output_filename.trim().replace(/[^a-zA-Z0-9._-]/g, '_')
        : createFileName('png');

    const safeFileName = outputFileName.toLowerCase().endsWith('.png')
      ? outputFileName
      : `${outputFileName}.png`;

    const outputPath = path.join(OUTPUT_DIR, safeFileName);
    await renderHtmlToPng(htmlContent, outputPath);

    res.json({
      success: true,
      image_url: `${PUBLIC_BASE_URL}/cards/${safeFileName}`,
      filename: safeFileName
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || 'Render failed.'
    });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Business card render service listening on http://${HOST}:${PORT}`);
  console.log(`Static cards served from ${PUBLIC_BASE_URL}/cards/...`);
});
