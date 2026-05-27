import type { ReactNode, CSSProperties } from "react";

interface CardProps {
  icon: string;
  title: string;
  titleSuffix?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}

export default function Card({
  icon,
  title,
  titleSuffix,
  extra,
  children,
  style,
}: CardProps) {
  return (
    <div className="card" style={style}>
      <div className="card-head">
        <span className="card-title">
          <i className={icon} /> {title}
          {titleSuffix}
        </span>
        {extra}
      </div>
      {children}
    </div>
  );
}
