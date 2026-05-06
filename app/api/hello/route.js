import { useEffect, useState } from "react";

export default function Home() {
  const [name, setName] = useState("");

  return (
    <div>
      <h1>Welcome {name ? name : "Guest"}</h1>
    </div>
  );
}