import React from 'react';
import { Camera, Sparkles } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="relative mb-8 sm:mb-10 lg:mb-12">
      {/* Main Header Container */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-blue-950/30 border border-gray-200/60 dark:border-gray-700/40 shadow-xl shadow-gray-900/5 dark:shadow-black/20">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/20 via-purple-400/10 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-400/15 via-pink-400/10 to-transparent rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        
        {/* Content */}
        <div className="relative px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
            
            {/* Left Side - Title & Subtitle */}
            <div className="flex-1 space-y-4">
              {/* Title Section */}
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="relative group">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 shadow-lg shadow-blue-500/25 transition-all duration-300 group-hover:shadow-blue-500/40 group-hover:scale-105">
                    <Camera className="w-8 h-8 text-white transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                
                {/* Title */}
                <div className="space-y-1">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                    {title}
                  </h1>
                  <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
                </div>
              </div>
              
              {/* Subtitle */}
              {subtitle && (
                <div className="flex items-center gap-3 ml-20">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                    {subtitle}
                  </p>
                </div>
              )}
            </div>
            
            {/* Right Side - Actions */}
            {children && (
              <div className="flex items-center gap-3 lg:flex-shrink-0">
                <div className="hidden lg:block w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600" />
                <div className="flex items-center gap-3">
                  {children}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg shadow-blue-400/50 animate-pulse" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow-md shadow-purple-400/40" />
    </div>
  );
} 