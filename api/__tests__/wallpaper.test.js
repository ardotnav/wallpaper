const handler = require('../wallpaper');

// Mock sharp module
jest.mock('sharp', () => {
  return jest.fn(() => ({
    png: jest.fn(() => ({
      toBuffer: jest.fn(() => Promise.resolve(Buffer.from('mock-png-data')))
    }))
  }));
});

describe('Wallpaper API Handler', () => {
  let req, res;

  beforeEach(() => {
    req = { url: '/api/wallpaper' };
    res = {
      statusCode: 0,
      setHeader: jest.fn(),
      end: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return PNG image when sharp is available', async () => {
    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(res.statusCode).toBe(200);
    expect(res.end).toHaveBeenCalledWith(expect.any(Buffer));
  });

  test('should fallback to SVG when sharp fails', async () => {
    // Mock sharp to throw an error
    const sharp = require('sharp');
    sharp.mockImplementationOnce(() => {
      throw new Error('Sharp not available');
    });

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/svg+xml');
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(res.statusCode).toBe(200);
    expect(res.end).toHaveBeenCalledWith(expect.stringContaining('<svg'));
  });

  test('should not use Express-style response helpers', async () => {
    // Newly created Vercel projects pass a plain Node.js response with no
    // res.status/res.send/res.json — the handler must not touch them
    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.end).toHaveBeenCalled();
  });

  test('should apply valid accent query param', async () => {
    const sharp = require('sharp');
    sharp.mockImplementationOnce(() => {
      throw new Error('Sharp not available');
    });

    req.url = '/api/wallpaper?accent=7DD3FC';
    await handler(req, res);

    const svgContent = res.end.mock.calls[0][0];
    expect(svgContent).toContain('#7DD3FC');
  });

  test('should ignore invalid accent query param', async () => {
    const sharp = require('sharp');
    sharp.mockImplementationOnce(() => {
      throw new Error('Sharp not available');
    });

    req.url = '/api/wallpaper?accent=not-a-color';
    await handler(req, res);

    const svgContent = res.end.mock.calls[0][0];
    expect(svgContent).toContain('<svg');
    expect(svgContent).not.toContain('not-a-color');
  });

  test('should handle errors gracefully', async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Force an error by mocking Date constructor to throw
    const OriginalDate = global.Date;
    global.Date = jest.fn(() => {
      throw new Error('Date error');
    });

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ error: 'Failed to generate wallpaper' }));
    expect(console.error).toHaveBeenCalled();

    // Restore
    global.Date = OriginalDate;
    console.error = originalConsoleError;
  });

  test('should generate valid SVG content in fallback', async () => {
    const sharp = require('sharp');
    sharp.mockImplementationOnce(() => {
      throw new Error('Sharp not available');
    });

    await handler(req, res);

    const svgContent = res.end.mock.calls[0][0];
    expect(svgContent).toContain('<svg');
    expect(svgContent).toContain('</svg>');
    expect(svgContent).toContain('<rect');
    expect(svgContent).toContain('<circle');
    const rectCount = (svgContent.match(/<rect/g) || []).length;
    expect(rectCount).toBeGreaterThan(1);
  });

  test('should set correct cache headers', async () => {
    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
  });
});
