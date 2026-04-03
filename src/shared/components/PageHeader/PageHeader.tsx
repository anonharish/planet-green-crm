import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader = ({ title, description, actions }: PageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 ">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary leading-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
