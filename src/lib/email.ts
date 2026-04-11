import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "re_placeholder");
}
const FROM = process.env.RESEND_FROM_EMAIL || "noreply@locals.kr";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function sendMatchRequestEmail({
  toEmail,
  toName,
  fromName,
  shopName,
  message,
}: {
  toEmail: string;
  toName: string;
  fromName: string;
  shopName: string;
  message?: string;
}) {
  await getResend().emails.send({
    from: `LOCALS <${FROM}>`,
    to: toEmail,
    subject: `[LOCALS] ${fromName}님이 매칭을 요청했습니다`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 4px;">LOCALS</h1>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 32px;">소상공인 × 대학생 마케팅 매칭</p>

        <h2 style="font-size: 20px; color: #111827;">새 매칭 요청이 도착했어요</h2>
        <p style="color: #374151; line-height: 1.6;">
          안녕하세요, <strong>${toName}</strong>님!<br/>
          <strong>${fromName}</strong>님이 <strong>${shopName}</strong> 관련 매칭을 요청했습니다.
        </p>

        ${message ? `
        <div style="background: #f9fafb; border-left: 4px solid #2563eb; padding: 16px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #374151; margin: 0; font-style: italic;">"${message}"</p>
        </div>
        ` : ""}

        <a href="${SITE_URL}/matches"
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
          요청 확인하기 →
        </a>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
          이 이메일은 LOCALS 플랫폼에서 자동 발송되었습니다.
        </p>
      </div>
    `,
  });
}

export async function sendMatchAcceptedEmail({
  toEmail,
  toName,
  fromName,
  shopName,
  projectId,
  fromContactMethod,
}: {
  toEmail: string;
  toName: string;
  fromName: string;
  shopName: string;
  projectId: string;
  fromContactMethod?: string;
}) {
  await getResend().emails.send({
    from: `LOCALS <${FROM}>`,
    to: toEmail,
    subject: `[LOCALS] ${fromName}님이 매칭 요청을 수락했습니다`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 4px;">LOCALS</h1>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 32px;">소상공인 × 대학생 마케팅 매칭</p>

        <h2 style="font-size: 20px; color: #111827;">매칭이 성사됐어요!</h2>
        <p style="color: #374151; line-height: 1.6;">
          안녕하세요, <strong>${toName}</strong>님!<br/>
          <strong>${fromName}</strong>님이 매칭 요청을 <strong style="color: #16a34a;">수락</strong>했습니다.<br/>
          <strong>${shopName}</strong> 프로젝트가 시작되었습니다!
        </p>

        ${fromContactMethod ? `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="color: #15803d; font-weight: bold; margin: 0 0 4px 0; font-size: 13px;">상대방 연락처</p>
          <p style="color: #166534; font-size: 15px; font-weight: bold; margin: 0;">${fromContactMethod}</p>
        </div>
        ` : ""}

        <a href="${SITE_URL}/project/${projectId}"
           style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
          프로젝트 확인하기 →
        </a>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
          이 이메일은 LOCALS 플랫폼에서 자동 발송되었습니다.
        </p>
      </div>
    `,
  });
}

export async function sendMatchRejectedEmail({
  toEmail,
  toName,
  fromName,
  shopName,
}: {
  toEmail: string;
  toName: string;
  fromName: string;
  shopName: string;
}) {
  await getResend().emails.send({
    from: `LOCALS <${FROM}>`,
    to: toEmail,
    subject: `[LOCALS] ${shopName} 매칭 요청 결과 안내`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 4px;">LOCALS</h1>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 32px;">소상공인 × 대학생 마케팅 매칭</p>

        <h2 style="font-size: 20px; color: #111827;">매칭 요청 결과</h2>
        <p style="color: #374151; line-height: 1.6;">
          안녕하세요, <strong>${toName}</strong>님!<br/>
          아쉽게도 <strong>${fromName}</strong>님이 이번 매칭 요청을 거절했습니다.<br/>
          다른 파트너를 찾아보세요!
        </p>

        <a href="${SITE_URL}/explore/students"
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
          다른 파트너 찾기 →
        </a>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
          이 이메일은 LOCALS 플랫폼에서 자동 발송되었습니다.
        </p>
      </div>
    `,
  });
}
