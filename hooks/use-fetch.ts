import { useState, useRef, useEffect } from "react";

const useFetch = <T, Args extends unknown[]>(
  cb: (...args: Args) => Promise<T>
) => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fn = async (...args: Args): Promise<T> => {
    if (!mountedRef.current) return Promise.reject(new Error("Unmounted"));

    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      if (mountedRef.current) {
        setData(response);
      }
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Something went wrong");
      if (mountedRef.current) {
        setError(error);
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;