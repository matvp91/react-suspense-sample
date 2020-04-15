import createResource from "./createResource";

export const resourceProfile = createResource(() => {
  const delay = "1000ms";
  return fetch(
    `https://www.mocky.io/v2/5e9743f33000007800b6dd5c?mocky-delay=${delay}`
  ).then((response) => response.json());
});

export const resourceTimeline = createResource(async () => {
  const delay = "3000ms";
  return fetch(
    `https://www.mocky.io/v2/5e97440d3000006e00b6dd60?mocky-delay=${delay}`
  ).then((response) => response.json());
});
