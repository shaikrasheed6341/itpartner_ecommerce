import React from 'react'
import { LucideIcon } from 'lucide-react'

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon: LucideIcon | React.ComponentType<{ className?: string }>
    label: string
}

export const InputField = ({
    icon: Icon,
    label,
    className,
    ...props
}: InputFieldProps) => {
    return (
        <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">{label}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                    {...props}
                    className={`block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 sm:text-sm ${className || ''}`}
                />
            </div>
        </div>
    )
}
