export const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="space-y-6 p-6 w-full">{children}</div>;
};

export const PageHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center justify-between">{children}</div>;
};

export const PageTitle = ({ children }: { children: React.ReactNode }) => {
  return <h1 className="text-2xl font-bold">{children}</h1>;
};
export const PageHeaderContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="space-y-1">{children}</div>;
};

export const PageDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <p className="text-sm text-gray-600 dark:text-gray-400">{children}</p>;
};

export const PageActions = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center gap-2">{children}</div>;
};

export const PageContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="space-y-6">{children}</div>;
};
