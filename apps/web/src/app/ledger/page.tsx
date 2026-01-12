"use client";
import { useEffect, useState } from "react";

export default function Ledger() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/ledger").then(r => r.json()).then(setData);
  }, []);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
