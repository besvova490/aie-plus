import React, { useState, useEffect } from "react";
import { Search as SearchIcon } from "lucide-react";

// components
import { Input, InputProps } from "@/common/input";

// helpers
import { useDebounce } from "@/hooks/useDebounce";

interface SearchProps extends InputProps {
  timeout?: number;
}

export function Search({ timeout = 500, value, onChange, ...props }: SearchProps) {
  const [search, setSearch] = useState(value);

  const debounced = useDebounce({ timeout });

  //methods
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debounced(() => onChange?.(e));
    setSearch(e.target.value);
  }

  // effects
  useEffect(() => {
    setSearch(value);
  }, [value]);

  // render
  return (
    <Input
      value={search}
      onChange={handleChange}
      addonBefore={<SearchIcon size={18}/>}
      {...props}
    />
  )
}
