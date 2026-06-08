module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const raw =
    req.headers["x-vercel-ip-country"] ??
    req.headers["cf-ipcountry"] ??
    "IN";

  const country = String(raw).toUpperCase();

  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.status(200).json({ country });
};
