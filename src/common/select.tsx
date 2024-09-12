/* eslint-disable no-undefined */
import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown, LoaderCircle, CircleFadingPlus } from "lucide-react";

// components
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "./command";
import { Button } from "./button";
import { LabelErrorProvider, ILabelErrorProvider } from "./labelErrorProvider";

// helpers
import { TPrimitive } from "@/types/utils/TPrimitive";
import { cn } from "@/lib/utils";

export type TSelectOption = {
  value?: TPrimitive;
  label?: React.ReactNode;
  disabled?: boolean;
  divider?: boolean;
};

export interface ISelect {
  placeholder?: string;
  options: TSelectOption[];
  label?: string;
  error?: string;
  value?: TPrimitive;
  labelPlacement?: ILabelErrorProvider["labelPlacement"];
  isSearchable?: boolean;
  open?: boolean;
  emptyMessage?: React.ReactNode;
  fullWidth?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  readonly?: boolean;
  isCreatable?: boolean;

  // events
  renderValue?: (value: TPrimitive, option: TSelectOption) => React.ReactNode;
  onInputChange?: (query: string, info: React.FormEvent<HTMLInputElement>) => void;
  onOpenChange?: (open: boolean) => void;
  onChange?: (value: TPrimitive) => void;
}

function Select(props: ISelect) {
  const {
    placeholder,
    options,
    open,
    label,
    error,
    value,
    labelPlacement,
    isSearchable,
    isLoading,
    emptyMessage = "No options found",
    fullWidth,
    isDisabled,
    readonly,
    renderValue,
    onChange,
    onInputChange,
    isCreatable
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [optionsList, setOptionsList] = useState(options);

  const currentOption = optionsList.find((option) => option.value === value);

  // methods
  const handleOnSelect = (e: TPrimitive) => {
    setIsOpen(false);

    onChange && onChange(e);
  };

  const handleOnInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    setInputValue(e.currentTarget.value);
    onInputChange && onInputChange(e.currentTarget.value, e);
  };

  const handleOnCreate = () => {
    setOptionsList([...optionsList, { value: inputValue, label: inputValue }]);
    setInputValue("");

    handleOnSelect(inputValue);
  };

  // effects
  useEffect(() => {
    setOptionsList(options);
  }, [JSON.stringify(options)]);

  // renders
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <LabelErrorProvider label={label} error={error} labelPlacement={labelPlacement}>
        <PopoverTrigger asChild>
          <Button
            variant={readonly ? "ghost" : "outline"}
            role="combobox"
            aria-expanded={open}
            disabled={isDisabled || readonly}
            className={cn(
              "gap-4 justify-between min-w-24",
              fullWidth && "w-full",
              readonly && "px-0"
            )}
          >
            {typeof value !== "undefined" ? (
              renderValue ? (
                renderValue(value, currentOption as TSelectOption)
              ) : (
                currentOption?.label
              )
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
            {isLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin text-primary ml-auto" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-auto" />
            )}
          </Button>
        </PopoverTrigger>
      </LabelErrorProvider>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-max p-0">
        <Command>
          {isSearchable && (
            <CommandInput onInput={handleOnInputChange} value={inputValue} placeholder="Пошук..." />
          )}
          <CommandList>
            {!isLoading && <CommandEmpty>{emptyMessage}</CommandEmpty>}
            <CommandGroup>
              {optionsList.map((option) => (
                <CommandItem
                  key={option.value as string}
                  value={`${option.label}-${option.value}` as string}
                  onSelect={() => handleOnSelect(option.value === value ? "" : option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="whitespace-nowrap">{option.label}</span>
                </CommandItem>
              ))}
              {isCreatable && inputValue && (
                <CommandItem
                  key="custom-value"
                  value={inputValue}
                  onSelect={() => handleOnCreate()}
                  className="border-t border-slate-200"
                >
                  <CircleFadingPlus className="mr-2 h-4 w-4" />
                  <span className="whitespace-nowrap">{inputValue}</span>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { Select };
