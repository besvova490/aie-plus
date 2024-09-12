import { useCallback, useState } from "react";
import {
  useForm as useReactHookForm,
  FieldValues,
  Path,
  PathValue,
  DefaultValues
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import debounce from "lodash.debounce";
import * as yup from "yup";

// helpers
import { errorParser } from "@/lib/errorParser";

export interface IUseFormProps<T> {
  defaultValues: DefaultValues<T>;
  validationSchema: yup.AnyObjectSchema;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (data: FieldValues) => Promise<void>;
}

export function useForm<T extends FieldValues = FieldValues>(props: IUseFormProps<T>) {
  const { defaultValues, validationSchema, onSubmit: onSubmitProp, ...formConfig } = props;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setValue, handleSubmit, trigger, ...rest } = useReactHookForm<T>({
    resolver: yupResolver(validationSchema),
    defaultValues,
    ...formConfig
  });

  const debouncedTrigger = useCallback(debounce(trigger, 300), []);

  const handleChange = (key: string, value: unknown) => {
    setValue(key as Path<T>, value as PathValue<T, Path<T>>);
    debouncedTrigger(key as Path<T>);
  };

  const onSubmit = async (data: T) => {
    setIsSubmitting(true);

    return onSubmitProp(data)
      .catch((error) => {
        if (error.response && error.response.data) {
          const errors = errorParser(error.response.data);

          Object.keys(errors).forEach((key) => {
            rest.setError(key as Path<T>, { type: "manual", message: errors[key] as string });
          });
        }
      })
      .finally(() => setIsSubmitting(false));
  };

  return {
    isSubmitting,
    trigger,
    setValue: handleChange,
    onSubmit: handleSubmit(onSubmit),
    ...rest
  };
}
