type Props = {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  className?: string;
  eyebrowClassName?: string;
};

export default function SectionHeading({ id, eyebrow, title, className = "", eyebrowClassName = "text-clay" }: Props) {
  return (
    <header className={className} data-anim="up">
      <p className={`eyebrow mb-4 ${eyebrowClassName}`}>{eyebrow}</p>
      <h2 id={id} className="font-display text-[clamp(2.5rem,9vw,5rem)] font-black leading-[0.95] tracking-tight text-balance">
        {title}
      </h2>
    </header>
  );
}
