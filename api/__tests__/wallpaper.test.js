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
    req = {};
    res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return PNG image when sharp is available', async () => {
    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=3600');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(expect.any(Buffer));
  });

  test('should fallback to SVG when sharp fails', async () => {
    // Mock sharp to throw an error
    const sharp = require('sharp');
    sharp.mockImplementationOnce(() => {
      throw new Error('Sharp not available');
    });

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/svg+xml');
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=3600');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(expect.stringContaining('<svg'));
  });

  test('should handle errors gracefully', async () => {
    // Mock generateSVG to throw an error by corrupting the date
    // Actually, let's test with a more realistic scenario
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Force an error by mocking Date constructor to throw
    const OriginalDate = global.Date;
    global.Date = jest.fn(() => {
      throw new Error('Date error');
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to generate wallpaper' });
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

    const svgContent = res.send.mock.calls[0][0];
    expect(svgContent).toContain('<svg');
    expect(svgContent).toContain('</svg>');
    expect(svgContent).toContain('<rect');
    expect(svgContent).toContain('<circle');
    // Percentage uses rect elements for 7-segment display (no font dependency)
    // Background rect + digit segment rects
    const rectCount = (svgContent.match(/<rect/g) || []).length;
    expect(rectCount).toBeGreaterThan(1);
  });

  test('should set correct cache headers', async () => {
    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=3600');
  });
});
