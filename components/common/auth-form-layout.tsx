"use client";

interface AuthFormLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthFormLayout({
  title,
  description,
  children,
  className,
}: AuthFormLayoutProps) {
  return (
    <div className="w-full">
      <div className="rounded-sm bg-linear-to-br from-background to-background/80 border border-primary/20 shadow-lg backdrop-blur-sm overflow-hidden h-[600px]">
        <div className="flex flex-col lg:flex-row h-full">
          <div className="hidden lg:flex lg:w-1/2 min-h-full items-center justify-center p-8 relative" style={{backgroundImage: `url('https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="relative z-10 text-center space-y-4">
              <h2 className="text-4xl font-bold text-white">Manage Your Money</h2>
              <p className="text-white/90 max-w-xs text-lg">Track, analyze, and optimize your expenses</p>
            </div>
          </div>
          <div className={`w-full lg:w-1/2 p-8 flex flex-col justify-start overflow-y-auto ${className || ''}`}>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {title}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
              <div className="space-y-4">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
