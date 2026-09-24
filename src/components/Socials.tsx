import { socials } from "@/content/site";
import { FacebookIcon, InstagramIcon } from "./Graphics";

const icons = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
} as const;

/**
 * The social profiles, in the two shapes the page needs:
 *  - "pills": name + handle, for the contact block
 *  - "icons": round icon buttons, for the footer
 * Renders nothing when no profile is on file.
 */
export default function Socials({ variant = "pills" }: { variant?: "pills" | "icons" }) {
  if (socials.length === 0) return null;

  return (
    <ul role="list" className={`flex flex-wrap ${variant === "pills" ? "justify-center gap-3" : "gap-3"}`}>
      {socials.map((s) => {
        const Icon = icons[s.key];
        return (
          <li key={s.key}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer me"
              className={
                variant === "pills"
                  ? "group flex min-h-14 items-center gap-3 rounded-full bg-cream px-5 text-navy shadow-[inset_0_0_0_1.5px_rgb(5_39_84/0.2)] transition-[box-shadow,transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[inset_0_0_0_1.5px_var(--color-navy),0_14px_30px_-18px_rgb(5_39_84/0.6)]"
                  : "flex h-11 w-11 items-center justify-center rounded-full text-cream shadow-[inset_0_0_0_1.5px_rgb(251_246_236/0.35)] transition-colors duration-300 hover:bg-cream/10 hover:text-turq"
              }
            >
              <span
                className={
                  variant === "pills"
                    ? "flex h-9 w-9 items-center justify-center rounded-full bg-turq text-navy transition-transform duration-300 group-hover:scale-105"
                    : ""
                }
              >
                <Icon className="h-5 w-5" />
              </span>
              {variant === "pills" && (
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[0.95rem] font-semibold">{s.label}</span>
                  <span lang="en" dir="ltr" className="text-xs text-muted">
                    {s.handle}
                  </span>
                </span>
              )}
              <span className="sr-only">
                {s.label} של ארטוס (נפתח בחלון חדש)
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
