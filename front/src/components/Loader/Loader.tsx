type LoaderProps = {
  label?: string;
};

const Loader = ({ label = 'Loading...' }: LoaderProps) => {
  return (
    <div className="flex items-center justify-center gap-3" role="status" aria-live="polite">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      <span>{label}</span>
    </div>
  );
};

export default Loader;
