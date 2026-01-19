export default function TreatmentCenterLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {children}
    </main>
  );
}
