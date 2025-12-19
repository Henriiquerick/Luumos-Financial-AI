"use client"

import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "./input"

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
}

export function DatePicker({ value, onChange, className, placeholder = "DD/MM/AAAA" }: DatePickerProps) {
  const [inputValue, setInputValue] = React.useState<string>("");
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const currentYear = new Date().getFullYear();

  React.useEffect(() => {
    if (value && isValid(value)) {
      setInputValue(format(value, "dd/MM/yyyy"));
    } else {
      setInputValue("");
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/[^0-9]/g, "");
    
    if (rawValue.length > 2 && rawValue.length <= 4) {
      rawValue = `${rawValue.slice(0, 2)}/${rawValue.slice(2)}`;
    } else if (rawValue.length > 4) {
      rawValue = `${rawValue.slice(0, 2)}/${rawValue.slice(2, 4)}/${rawValue.slice(4, 8)}`;
    }

    setInputValue(rawValue);

    if (rawValue.length === 10) {
      const parsedDate = parse(rawValue, "dd/MM/yyyy", new Date());
      if (isValid(parsedDate)) {
        onChange(parsedDate);
      } else {
        onChange(undefined);
      }
    } else {
      // Se não estiver completo, consideramos como indefinido.
      onChange(undefined);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date);
      setInputValue(format(date, "dd/MM/yyyy"));
    } else {
      onChange(undefined);
      setInputValue("");
    }
    setIsPopoverOpen(false);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <div className={cn("relative flex items-center w-full", className)}>
            <Input
                type="text"
                placeholder={placeholder}
                value={inputValue}
                onChange={handleInputChange}
                className="pr-10 rounded-r-none h-12" 
            />
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-auto rounded-l-none border-l-0 h-12",
                        !value && "text-muted-foreground"
                    )}
                    aria-label="Abrir calendário"
                >
                    <CalendarIcon className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
        </div>
        <PopoverContent className="w-auto p-0">
            <Calendar
                mode="single"
                selected={value}
                onSelect={handleCalendarSelect}
                initialFocus
                captionLayout="dropdown-buttons"
                fromYear={currentYear - 100}
                toYear={currentYear}
            />
        </PopoverContent>
    </Popover>
  );
}
