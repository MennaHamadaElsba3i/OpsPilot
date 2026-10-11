export interface RequestScenarioConfig {
  latencyMs: number;
  shouldFailNext: boolean;
  failureMessage: string;
}

class RequestScenarioManager {
  private config: RequestScenarioConfig = {
    latencyMs: 200,
    shouldFailNext: false,
    failureMessage: 'Simulated network failure. Please try again.',
  };

  getConfig(): RequestScenarioConfig {
    return { ...this.config };
  }

  setLatency(ms: number): void {
    this.config.latencyMs = Math.max(0, ms);
  }

  triggerFailureNext(message?: string): void {
    this.config.shouldFailNext = true;
    if (message) {
      this.config.failureMessage = message;
    }
  }

  reset(): void {
    this.config = {
      latencyMs: 200,
      shouldFailNext: false,
      failureMessage: 'Simulated network failure. Please try again.',
    };
  }

  async applySimulation(signal?: AbortSignal, customDelay?: number): Promise<void> {
    const delay = customDelay !== undefined ? customDelay : this.config.latencyMs;

    if (delay > 0) {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          resolve();
        }, delay);

        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new DOMException('Request aborted', 'AbortError'));
          });
        }
      });
    }

    if (signal?.aborted) {
      throw new DOMException('Request aborted', 'AbortError');
    }

    if (this.config.shouldFailNext) {
      this.config.shouldFailNext = false;
      throw new Error(this.config.failureMessage);
    }
  }


}
export const requestScenarios = new RequestScenarioManager();
// TEMPORARY TEST ONLY
// requestScenarios.triggerFailureNext(
//   'Failed to load operations, please try again later'
// );
