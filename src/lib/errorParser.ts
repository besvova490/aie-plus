export function errorParser(
  errorObject: { [key: string]: string[] | { [nestedKey: string]: string[] | string }[] },
) {
  const errors = {} as { [key: string]: string | Record<string, string> };

  Object.keys(errorObject).forEach((key) => {
    if (errorObject.hasOwnProperty(key)) {
      // If errorObject[key] is an array, get first element of the array as the error
      const error = Array.isArray(errorObject[key]) && errorObject[key].length > 0
        ? errorObject[key][0]
        : null;
      if (error) {
        errors[key] = error as string;
      } else if (Object.keys(errorObject[key]).length > 0) {
        const nestedKey = Object.keys(errorObject[key])[0];
        const nestedErrorObject = errorObject[key] as { [nestedKey: string]: string[] | string }[];

        const nestedError = nestedErrorObject[nestedKey as keyof typeof nestedErrorObject];
        errors[`${key}.${nestedKey}`] = nestedError as unknown as string;
      }
    }
  });

  return errors;
}
