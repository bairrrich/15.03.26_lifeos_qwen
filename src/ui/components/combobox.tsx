"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/ui/components/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/ui/components/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/ui/components/popover"

export interface ComboboxProps {
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    children?: React.ReactNode
    className?: string
}

const Combobox = React.forwardRef<
    HTMLButtonElement,
    ComboboxProps
>(
    (
        {
            className,
            value,
            onValueChange,
            placeholder = "Select...",
            searchPlaceholder = "Search...",
            children,
            ...props
        },
        ref
    ) => {
        return (
            <Popover>
                <PopoverTrigger
                    className={cn(
                        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 w-[200px] justify-between",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {value
                        ? React.Children.toArray(children).find(
                            (child) =>
                                React.isValidElement(child) &&
                                child.props.value === value
                        )?.props.children || placeholder
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                {React.Children.map(children, (child) =>
                                    React.isValidElement(child) && child.type === ComboboxItem
                                        ? React.cloneElement(child, {
                                            onSelect: (currentValue: string) => {
                                                onValueChange?.(currentValue)
                                            },
                                            isSelected: child.props.value === value,
                                        })
                                        : child
                                )}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        )
    }
)
Combobox.displayName = "Combobox"

const ComboboxContent = CommandList

const ComboboxItem = React.forwardRef<
    React.ElementRef<typeof CommandItem>,
    React.ComponentPropsWithoutRef<typeof CommandItem> & {
        value: string
        isSelected?: boolean
    }
>(({ className, value, isSelected, children, ...props }, ref) => {
    const { onSelect } = props as any

    return (
        <CommandItem
            ref={ref}
            value={value}
            onSelect={onSelect}
            className={cn(
                "flex items-center justify-between",
                className
            )}
            {...props}
        >
            {children}
            {isSelected && <Check className="ml-auto h-4 w-4" />}
        </CommandItem>
    )
})
ComboboxItem.displayName = "ComboboxItem"

const ComboboxTrigger = PopoverTrigger
const ComboboxInput = CommandInput
const ComboboxEmpty = CommandEmpty
const ComboboxGroup = CommandGroup
const ComboboxList = CommandList
const ComboboxLabel = () => null // Not implemented

export {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
    ComboboxLabel,
}
