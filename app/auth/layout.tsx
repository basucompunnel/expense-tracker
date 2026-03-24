export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex items-center justify-center bg-background py-8">
      <div className="w-full max-w-5xl px-4">
        {children}
      </div>
    </div>
  );
}
