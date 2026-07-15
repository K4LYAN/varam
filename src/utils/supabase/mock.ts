/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Creates a resilient mock Supabase client using JavaScript Proxies.
 * This prevents runtime and build-time errors when the Supabase environment
 * variables are missing (e.g. during static page prerendering in CI/CD).
 */
export function createMockClient(): any {
  const emptyPromise = Promise.resolve({ data: null, error: null });

  // A recursive proxy helper to handle chained database / storage methods (e.g. .from().select().eq())
  const createChainedMock = (): any => {
    const targetFn = () => createChainedMock();
    return new Proxy(targetFn, {
      get(target, prop) {
        if (prop === 'then') {
          return (resolve: any) => resolve({ data: null, error: null });
        }
        return createChainedMock();
      }
    });
  };

  const handler: ProxyHandler<any> = {
    get(target, prop) {
      if (prop === 'then') {
        return (resolve: any) => resolve({ data: null, error: null });
      }

      if (prop === 'onAuthStateChange') {
        return () => ({
          data: {
            subscription: {
              unsubscribe: () => {}
            }
          }
        });
      }

      if (prop === 'auth') {
        return new Proxy({}, {
          get(t, p) {
            if (p === 'then') {
              return (resolve: any) => resolve({ data: null, error: null });
            }
            if (p === 'onAuthStateChange') {
              return () => ({
                data: {
                  subscription: {
                    unsubscribe: () => {}
                  }
                }
              });
            }
            if (p === 'getUser') {
              return () => Promise.resolve({ data: { user: null }, error: null });
            }
            if (p === 'getSession') {
              return () => Promise.resolve({ data: { session: null }, error: null });
            }
            if (p === 'signOut') {
              return () => Promise.resolve({ error: null });
            }
            if (p === 'signUp' || p === 'signInWithPassword' || p === 'updateUser') {
              return () => Promise.resolve({ data: { user: null, session: null }, error: null });
            }
            return () => emptyPromise;
          }
        });
      }

      return createChainedMock();
    }
  };

  return new Proxy({}, handler);
}
