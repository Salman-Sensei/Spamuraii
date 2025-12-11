import React from "react";

export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "btn-pill";
  const variants = {
    primary: "btn-pill-primary",
    ghost: "btn-pill-ghost",
    danger: "btn-pill-danger"
  };

  const classes = [base, variants[variant] || "", className].join(" ").trim();

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
