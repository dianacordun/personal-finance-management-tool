jest.setTimeout(30000); 

require('dotenv').config({ path: '.env' });

// Suppress console.log, console.warn, and console.error
global.console = {
    ...console, // Preserve other console methods like console.info or console.debug
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};