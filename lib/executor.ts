import * as vm from 'vm';

export async function executeJavaScript(code: string): Promise<{ output: string; error?: string }> {
  try {
    // Create a safe console object to capture output
    const output: string[] = [];
    const consoleOverride = {
      log: (...args: any[]) => {
        output.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      },
      error: (...args: any[]) => {
        output.push('ERROR: ' + args.map(arg => String(arg)).join(' '));
      },
      warn: (...args: any[]) => {
        output.push('WARNING: ' + args.map(arg => String(arg)).join(' '));
      },
      info: (...args: any[]) => {
        output.push('INFO: ' + args.map(arg => String(arg)).join(' '));
      }
    };

    // Create a sandbox context
    const sandbox = {
      console: consoleOverride,
      setTimeout: setTimeout,
      setInterval: setInterval,
      clearTimeout: clearTimeout,
      clearInterval: clearInterval,
      Math: Math,
      Date: Date,
      JSON: JSON,
      Array: Array,
      Object: Object,
      String: String,
      Number: Number,
      Boolean: Boolean,
      RegExp: RegExp,
      Promise: Promise,
      parseInt: parseInt,
      parseFloat: parseFloat,
      isNaN: isNaN,
      isFinite: isFinite,
      encodeURIComponent: encodeURIComponent,
      decodeURIComponent: decodeURIComponent,
      // Add result variable to capture return values
      __result: undefined
    };

    // Create VM context
    const context = vm.createContext(sandbox);

    // Wrap code to capture return value
    const wrappedCode = `
      try {
        __result = (function() {
          ${code}
        })();
      } catch (e) {
        throw e;
      }
    `;

    // Execute with timeout
    const result = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Code execution timeout (5 seconds)'));
      }, 5000);

      try {
        vm.runInContext(wrappedCode, context, {
          timeout: 5000,
          displayErrors: true
        });
        
        clearTimeout(timer);
        resolve(sandbox.__result);
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });

    // If there's a return value, add it to output
    if (result !== undefined) {
      output.push('Return value: ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)));
    }

    return { output: output.join('\n') || 'Code executed successfully (no output)' };
  } catch (error) {
    return { 
      output: '', 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}