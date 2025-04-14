export type DebugLogOptions = {
  debugName: string;
  description: string;
  value?: any;
  split?: "UP" | "DOWN" | "BOTH";
  color?: "red" | "green" | "blue" | "yellow" | "purple" | "orange" | "pink";
  isEnabled?: boolean;
};
export const debugGraph = ({
  debugName,
  description,
  value,
  split = "BOTH",
  color,
  isEnabled = true,
}: DebugLogOptions) => {
  if (!isEnabled) return;
  if (value || split === "UP" || split === "BOTH")
    console.log("\n----------------------------------");
  const colorMap = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    blue: "\x1b[34m",
    yellow: "\x1b[33m",
    purple: "\x1b[35m",
    orange: "\x1b[38;5;208m",
    pink: "\x1b[38;5;219m",
  };
  const reset = "\x1b[0m";

  if (color && colorMap[color]) {
    console.log(`${colorMap[color]}[${debugName}]${reset}`, description);
  } else {
    console.log(`[${debugName}]`, description);
  }
  if (value) {
    console.log(`Value: ${JSON.stringify(value, null, 2)}`);
  }
  if (value || split === "DOWN" || split === "BOTH")
    console.log("----------------------------------\n");
};
