export const triggerEngagement = async (action, lead) => {
  const url = process.env.REACT_APP_ENGAGE_EMAIL_WEBHOOK; // set this env var with the webhook URL
  const payload = {
    action,
    name: lead.name,
    email: lead.email
  };
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
};
