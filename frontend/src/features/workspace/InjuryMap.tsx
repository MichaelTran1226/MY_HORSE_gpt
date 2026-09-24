import { useState } from "react";
const points = [
  ["HEAD", 420, 72],
  ["NECK", 375, 120],
  ["SHOULDER", 332, 163],
  ["BACK", 230, 130],
  ["ABDOMEN", 222, 192],
  ["FORELEG", 330, 265],
  ["HINDLEG", 142, 260],
  ["HOOF", 330, 325],
] as const;
export function InjuryMap() {
  const [selected, setSelected] = useState("");
  return (
    <fieldset className="injury-map">
      <legend>2D injury location (optional)</legend>
      <svg
        viewBox="0 0 500 365"
        aria-label="Horse side view showing injury location markers"
      >
        <path
          d="M115 156 Q175 113 278 139 L334 132 365 70 391 42 409 30 407 58 443 87 430 111 399 105 382 165 358 196 350 318 330 327 327 226 309 210 Q246 238 181 207 L157 240 159 320 138 327 133 237 114 205 Q78 197 85 139 L106 119 103 170Z"
          fill="#d8d3c2"
          stroke="#5b6559"
          strokeWidth="3"
        />
        {points.map(([name, x, y]) => (
          <g
            key={name}
            role="button"
            tabIndex={0}
            aria-label={"Select " + name.toLowerCase()}
            aria-pressed={selected === name}
            onClick={() => setSelected(name)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelected(name);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <circle
              cx={x}
              cy={y}
              r="12"
              fill={selected === name ? "#a63f37" : "#315d45"}
            />
            <text x={x + 16} y={y + 4} fontSize="10" fill="#232a25">
              {name}
            </text>
          </g>
        ))}
      </svg>
      <div className="map-options">
        {points.map(([name]) => (
          <label key={name}>
            <input
              type="radio"
              name="bodyLocation"
              value={name}
              checked={selected === name}
              onChange={() => setSelected(name)}
            />
            {name.toLowerCase()}
          </label>
        ))}
        <button type="button" onClick={() => setSelected("")}>
          Clear location
        </button>
      </div>
      <p>
        A schematic location aid. Select severity below when recording an
        injury.
      </p>
    </fieldset>
  );
}
