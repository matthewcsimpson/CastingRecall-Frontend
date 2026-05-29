import { useEffect, useRef, useState } from "react";
import axios from "axios";

/**
 * Shared GET primitive: aborts in-flight requests on unmount/URL change,
 * swallows cancellation errors, and exposes a uniform loading/data contract.
 * The effect re-runs only when `url` changes; `headers` and `select` are read
 * from the latest render via a ref so passing inline objects does not retrigger.
 * @template T
 * @param {string|null|undefined} url Fully-formed request URL, or falsy to skip fetching.
 * @param {{headers?: object, select?: (response: import("axios").AxiosResponse) => T}} [options] Optional request headers and a response selector (defaults to `response.data`).
 * @returns {{data: T|null, isLoading: boolean}} Current payload and loading flag.
 */
const useFetch = (url, options = {}) => {
  const [state, setState] = useState({ data: null, isLoading: true });
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!url) {
      setState({ data: null, isLoading: false });
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const { headers, select } = optionsRef.current;
        const response = await axios.get(url, {
          signal: controller.signal,
          headers,
        });
        const data =
          typeof select === "function" ? select(response) : response.data;
        setState({ data, isLoading: false });
      } catch (err) {
        if (axios.isCancel(err) || err.name === "CanceledError") {
          return;
        }
        console.error(err);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [url]);

  return state;
};

export default useFetch;
