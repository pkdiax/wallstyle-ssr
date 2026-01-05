import Link from "next/link";

interface BreadcrumbItem {
  href?: string;
  label: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="breadcrumb" className="text-sm mb-4">
      <ol className="flex flex-wrap gap-2 text-gray-400">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-blue-500 transition"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-200 font-semibold">
                {item.label}
              </span>
            )}

            {index < items.length - 1 && (
              <span className="mx-2 text-gray-500">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
