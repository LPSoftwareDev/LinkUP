import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        'flex items-center justify-center rounded-lg bg-[#332F4B] shrink-0 outline outline-[#443F64]',
        className,
      )}
    >
      {children}
    </button>
  );
}
