import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const { password } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: users } = await supabase.from("users").select("*");
  const { data: withdrawals } = await supabase.from("withdrawals").select("*");

  return res.status(200).json({
    users,
    withdrawals
  });
}
