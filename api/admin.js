import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Read password
  const { password } = req.body || {};
  if (!password) {
    return res.status(400).json({ error: "Missing password" });
  }

  // Check admin password
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Ensure env vars exist
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return res.status(500).json({
      error: "Missing env vars",
      required: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "ADMIN_PASSWORD"]
    });
  }

  // Supabase client
  const supabase = createClient(url, serviceKey);

  // Fetch tables
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("*")
    .order("id", { ascending: false });

  const { data: withdrawals, error: withdrawalsError } = await supabase
    .from("withdrawals")
    .select("*")
    .order("id", { ascending: false });

  if (usersError || withdrawalsError) {
    return res.status(500).json({
      error: (usersError || withdrawalsError)?.message || "Supabase error",
      usersError,
      withdrawalsError
    });
  }

  // Return data
  return res.status(200).json({
    ok: true,
    users_count: users?.length || 0,
    withdrawals_count: withdrawals?.length || 0,
    users,
    withdrawals
  });
}
