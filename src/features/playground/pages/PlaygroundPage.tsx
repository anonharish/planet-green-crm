import React from 'react';

export const PlaygroundPage = () => {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">UI Component Playground</h1>
        <p className="text-zinc-500 mt-1">
          Develop and test individual UI components here before integrating them into feature pages.
        </p>
      </div>
      
      {/* 
        ========================================================================
        TEST YOUR COMPONENTS BELOW 
        ========================================================================
      */}
      
      <div className="bg-white dark:bg-zinc-950 border rounded-lg p-6 shadow-sm min-h-[400px]">
        {/* Replace this with your DataTable component */}
        <div className="flex h-full items-center justify-center text-zinc-400 border-2 border-dashed rounded-md p-12">
          Drop your new UI components (like the Data Table) right here to preview them!
        </div>
      </div>
    </div>
  );
};
