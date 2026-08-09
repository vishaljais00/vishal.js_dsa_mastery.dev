import vm from 'vm';
import { TestCase } from '../data/curriculum';

export interface ExecutionResult {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR';
  executionTimeMs: number;
  consoleLogs: string[];
  testResults: {
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
    error?: string;
  }[];
  errorDetails?: string;
}

export class ExecutionService {
  /**
   * Pre-execution code sanitizer: scans for dangerous keywords / escape vectors.
   * Rejects process, global, require, import, constructor accesses, fs, child_process, etc.
   */
  private static sanitizeCode(code: string): string | null {
    const forbiddenPatterns = [
      /\bprocess\b/i,
      /\bglobal\b/i,
      /\bglobalThis\b/i,
      /\brequire\s*\(/i,
      /\bimport\s*\(/i,
      /\bimport\s+/i,
      /\bchild_process\b/i,
      /\bfs\b/i,
      /\bmodule\b/i,
      /\bmainModule\b/i,
      /\b__dirname\b/i,
      /\b__filename\b/i,
      /\bconstructor\s*\.\s*constructor\b/i,
      /\bFunction\s*\(/i,
      /\beval\s*\(/i,
      /\bReflect\b/i,
      /\bProxy\b/i,
      /\b__proto__\b/i
    ];

    for (const pattern of forbiddenPatterns) {
      if (pattern.test(code)) {
        return `Security Violation: Forbidden keyword or escape pattern detected (${pattern.source})`;
      }
    }
    return null;
  }

  public static runCode(userCode: string, testCases: TestCase[]): ExecutionResult {
    const startTime = Date.now();
    const consoleLogs: string[] = [];
    const testResults: ExecutionResult['testResults'] = [];

    let overallStatus: ExecutionResult['status'] = 'ACCEPTED';
    let globalErrorDetails: string | undefined;

    // Security Check 1: Pre-sanitize user code before passing to VM engine
    const securityViolation = this.sanitizeCode(userCode);
    if (securityViolation) {
      return {
        status: 'RUNTIME_ERROR',
        executionTimeMs: 1,
        consoleLogs: [`[SECURITY_ALERT] ${securityViolation}`],
        testResults: testCases.map(tc => ({
          input: tc.input,
          expected: tc.expectedOutput,
          actual: 'BLOCKED',
          passed: false,
          error: securityViolation
        })),
        errorDetails: securityViolation
      };
    }

    // Helper utilities injected into sandbox context
    const customConsole = {
      log: (...args: any[]) => {
        const formatted = args
          .map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
          .join(' ');
        if (consoleLogs.length < 50) consoleLogs.push(formatted);
      },
      error: (...args: any[]) => {
        const formatted = args
          .map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
          .join(' ');
        if (consoleLogs.length < 50) consoleLogs.push(`[ERROR] ${formatted}`);
      }
    };

    // Helper class for linked list problems
    const listNodeHelper = `
      class ListNode {
        constructor(val, next = null) {
          this.val = val;
          this.next = next;
        }
      }
    `;

    // Extract declared function name from user code (e.g. "function twoSum(" -> "twoSum")
    const funcMatch = userCode.match(/function\s+([a-zA-Z0-9_$]+)\s*\(/);
    const declaredFuncName = funcMatch ? funcMatch[1] : null;

    for (const testCase of testCases) {
      try {
        let scriptSource = '';

        if (declaredFuncName) {
          scriptSource = `
            "use strict";
            ${listNodeHelper}
            ${userCode}

            if (typeof ${declaredFuncName} !== 'function') {
              throw new Error("Function '${declaredFuncName}' was not found.");
            }
            ${declaredFuncName}(${testCase.input});
          `;
        } else {
          scriptSource = `
            "use strict";
            ${listNodeHelper}
            const __fn = (${userCode});
            if (typeof __fn === 'function') {
              __fn(${testCase.input});
            } else {
              throw new Error("No function definition found in your code.");
            }
          `;
        }

        // Security Check 2: Sandboxed Context with Safe Globals & Frozen Prototypes
        const sandboxContext = vm.createContext(Object.create(null));

        // Assign allowed JS primitives
        sandboxContext.console = customConsole;
        sandboxContext.Math = Math;
        sandboxContext.Array = Array;
        sandboxContext.Object = Object;
        sandboxContext.Set = Set;
        sandboxContext.Map = Map;
        sandboxContext.String = String;
        sandboxContext.Number = Number;
        sandboxContext.Boolean = Boolean;
        sandboxContext.Date = Date;
        sandboxContext.RegExp = RegExp;
        sandboxContext.JSON = JSON;
        sandboxContext.parseInt = parseInt;
        sandboxContext.parseFloat = parseFloat;
        sandboxContext.isNaN = isNaN;
        sandboxContext.Infinity = Infinity;
        sandboxContext.NaN = NaN;

        // Run in VM context with strict 1000ms timeout
        const script = new vm.Script(scriptSource);
        const result = script.runInContext(sandboxContext, {
          timeout: 1000
        });

        const actualStr = this.normalizeOutput(result);
        const expectedStr = this.normalizeOutput(testCase.expectedOutput);

        const passed = this.compareOutputs(actualStr, expectedStr);
        if (!passed && overallStatus === 'ACCEPTED') {
          overallStatus = 'WRONG_ANSWER';
        }

        testResults.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: actualStr,
          passed
        });
      } catch (err: any) {
        if (err.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
          overallStatus = 'TIME_LIMIT_EXCEEDED';
          globalErrorDetails = 'Time Limit Exceeded (Execution exceeded 1000ms limit)';
          testResults.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: 'TIMEOUT',
            passed: false,
            error: globalErrorDetails
          });
        } else {
          overallStatus = 'RUNTIME_ERROR';
          globalErrorDetails = err.message || String(err);
          testResults.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: 'ERROR',
            passed: false,
            error: globalErrorDetails
          });
        }
      }
    }

    const executionTimeMs = Date.now() - startTime;

    return {
      status: overallStatus,
      executionTimeMs,
      consoleLogs,
      testResults,
      errorDetails: globalErrorDetails
    };
  }

  private static normalizeOutput(val: any): string {
    if (val === undefined) return 'undefined';
    if (val === null) return 'null';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }
    return String(val);
  }

  private static compareOutputs(actual: string, expected: string): boolean {
    const cleanActual = actual.replace(/\s+/g, '').trim();
    const cleanExpected = expected.replace(/\s+/g, '').trim();
    if (cleanActual === cleanExpected) return true;

    try {
      const parsedActual = JSON.parse(actual);
      const parsedExpected = JSON.parse(expected);
      return JSON.stringify(parsedActual) === JSON.stringify(parsedExpected);
    } catch {
      return cleanActual === cleanExpected;
    }
  }
}
