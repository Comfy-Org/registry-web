import { useRouter } from "next/router";
import { omit } from "rambda";
import { useCallback } from "react";

export function useSearchParameter<T>(
  key: string,
  toValue: (...parameter: string[]) => T,
  toParameter: (value: T) => string | string[],
  { history = "push" }: { history?: "push" | "replace" } = {},
): [T, (value: T | ((prevValue: T) => T)) => void] {
  const router = useRouter();

  // Get the current value of the search parameter
  const value =
    undefined === router.query[key]
      ? toValue()
      : typeof router.query[key] === "string"
        ? toValue(router.query[key])
        : toValue(...router.query[key]);

  // Function to update the search parameter
  const setValue = useCallback(
    (newValue: T | ((prevValue: T) => T)) => {
      const resolvedValue =
        typeof newValue === "function" ? (newValue as (prevValue: T) => T)(value) : newValue;
      const query = {
        ...omit([key], router.query),
        [key]: toParameter(resolvedValue),
      };
      (history === "push" ? router.push : router.replace)(
        {
          pathname: router.pathname,
          query: query,
          hash: router.asPath.includes("#") ? `#${router.asPath.split("#")[1]}` : "",
        },
        undefined,
        { shallow: false },
      );
      // Update the router query directly
      // This is necessary to ensure the query is updated immediately
      // without waiting for the next render cycle
      Object.assign(router.query, query);
    },
    [key, router, toParameter, value],
  );

  return [value, setValue];
}
