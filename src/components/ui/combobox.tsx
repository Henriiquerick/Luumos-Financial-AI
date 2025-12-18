
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxOption {
    value: string;
    label: string;
    icon?: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    notfoundText?: string;
}

export function Combobox({ 
    options, 
    value, 
    onChange, 
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    notfoundText = "No option found."
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            {selectedOption?.icon && (
                <div className="flex items-center justify-center w-6 h-4 bg-white/10 rounded-sm p-0.5">
                    <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: selectedOption.icon }} />
                </div>
            )}
            {selectedOption ? selectedOption.label : placeholder}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{width: "var(--radix-popover-trigger-width)"}}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{notfoundText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                   <div className="flex items-center gap-2">
                    {option.icon && (
                        <div className="flex items-center justify-center w-6 h-4 bg-white/10 rounded-sm p-0.5">
                            <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: option.icon }} />
                        </div>
                    )}
                    {option.label}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
