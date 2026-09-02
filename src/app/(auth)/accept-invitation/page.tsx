//************************************************************** */

import { redirect } from "next/navigation";

import { AuthShell } from "@/features/auth/components/AuthShell";

import { AcceptInvitation } from "@/features/membership-invitations/components/AcceptInvitation";

//************************************************************** */

type AcceptInvitationPageProps = {
  searchParams: Promise<{
    token?: string | string[];
  }>;
};

//************************************************************** */

export default async function AcceptInvitationPage({
  searchParams,
}: AcceptInvitationPageProps) {
  const params = await searchParams;

  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  if (!token || !token.trim()) {
    redirect("/login");
  }

  return (
    <AuthShell
      eyebrow="Team invitation"
      title="Join your MotoDesk workspace"
      description="Accept your team invitation and connect your employee account to the correct MotoDesk organization."
      footer={null}
    >
      <AcceptInvitation token={token} />
    </AuthShell>
  );
}

//************************************************************** */
