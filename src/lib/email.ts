import { Resend } from "resend";
import { BRAND } from "@/lib/brand";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "re_placeholder");
}

const FROM = `${BRAND.EMAIL_SENDER_NAME} <${BRAND.EMAIL}>`;
const REPLY_TO = BRAND.EMAIL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const emailHeader = `
  <h1 style="color: #2C3E50; font-size: 24px; margin-bottom: 4px;">${BRAND.NAME_KO}</h1>
  <p style="color: #6b7280; font-size: 14px; margin-bottom: 32px;">${BRAND.TAGLINE}</p>
`;

const emailFooter = `
  <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
    본 메일은 ${BRAND.NAME_KO}(${BRAND.DOMAIN})에서 발송되었습니다. 문의: ${BRAND.EMAIL}
  </p>
`;

export async function sendMatchRequestEmail({
  toEmail,
  toName,
  fromName,
  shopName,
  message,
  proposedPay,
}: {
  toEmail: string;
  toName: string;
  fromName: string;
  shopName: string;
  message?: string;
  proposedPay?: number | null;
}) {
  const safeToName = escapeHtml(toName);
  const safeFromName = escapeHtml(fromName);
  const safeShopName = escapeHtml(shopName);
  const safeMessage = message ? escapeHtml(message) : undefined;

  await getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to: toEmail,
    subject: `[${BRAND.NAME_KO}] ${fromName}님이 매칭을 요청했습니다`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        ${emailHeader}

        <h2 style="font-size: 20px; color: #111827;">새 매칭 요청이 도착했어요</h2>
        <p style="color: #374151; line-height: 1.6;">
          안녕하세요, <strong>${safeToName}</strong>님!<br/>
          <strong>${safeFromName}</strong>님이 <strong>${safeShopName}</strong> 관련 매칭을 요청했습니다.
        </p>

        ${proposedPay != null ? `
        <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="color: #c2410c; font-weight: bold; margin: 0 0 4px 0; font-size: 13px;">제안 급여</p>
          <p style="color: #9a3412; font-size: 18px; font-weight: bold; margin: 0;">${proposedPay}만원/월</p>
        </div>
        ` : ""}

        ${safeMessage ? `
        <div style="background: #f9fafb; border-left: 4px solid #2C3E50; padding: 16px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #374151; margin: 0; font-style: italic;">"${safeMessage}"</p>
        </div>
        ` : ""}

        <a href="${SITE_URL}/matches"
           style="display: inline-block; background: #2C3E50; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
          요청 확인하기 →
        </a>

        ${emailFooter}
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
  agreedPay,
}: {
  toEmail: string;
  toName: string;
  fromName: string;
  shopName: string;
  projectId: string;
  fromContactMethod?: string;
  agreedPay?: number | null;
}) {
  const safeToName = escapeHtml(toName);
  const safeFromName = escapeHtml(fromName);
  const safeShopName = escapeHtml(shopName);
  const safeContactMethod = fromContactMethod ? escapeHtml(fromContactMethod) : undefined;

  await getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to: toEmail,
    subject: `[${BRAND.NAME_KO}] ${fromName}님이 매칭 요청을 수락했습니다`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        ${emailHeader}

        <h2 style="font-size: 20px; color: #111827;">매칭이 성사됐어요!</h2>
        <p style="color: #374151; line-height: 1.6;">
          안녕하세요, <strong>${safeToName}</strong>님!<br/>
          <strong>${safeFromName}</strong>님이 매칭 요청을 <strong style="color: #16a34a;">수락</strong>했습니다.<br/>
          <strong>${safeShopName}</strong> 프로젝트가 시작되었습니다!
        </p>

        ${agreedPay != null ? `
        <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="color: #c2410c; font-weight: bold; margin: 0 0 4px 0; font-size: 13px;">합의 급여</p>
          <p style="color: #9a3412; font-size: 20px; font-weight: bold; margin: 0;">${agreedPay}만원/월</p>
          <p style="color: #ea580c; font-size: 12px; margin: 6px 0 0 0;">첫 달 급여의 20% (${Math.round(agreedPay * 0.2)}만원)가 플랫폼 수수료로 1회 부과됩니다</p>
        </div>
        ` : ""}

        ${safeContactMethod ? `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="color: #15803d; font-weight: bold; margin: 0 0 4px 0; font-size: 13px;">상대방 연락처</p>
          <p style="color: #166534; font-size: 15px; font-weight: bold; margin: 0;">${safeContactMethod}</p>
        </div>
        ` : ""}

        <a href="${SITE_URL}/project/${projectId}"
           style="display: inline-block; background: #4A7C59; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
          프로젝트 확인하기 →
        </a>

        ${emailFooter}
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
  const safeToName = escapeHtml(toName);
  const safeFromName = escapeHtml(fromName);

  await getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to: toEmail,
    subject: `[${BRAND.NAME_KO}] ${shopName} 매칭 요청 결과 안내`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        ${emailHeader}

        <h2 style="font-size: 20px; color: #111827;">매칭 요청 결과</h2>
        <p style="color: #374151; line-height: 1.6;">
          안녕하세요, <strong>${safeToName}</strong>님!<br/>
          아쉽게도 <strong>${safeFromName}</strong>님이 이번 매칭 요청을 거절했습니다.<br/>
          다른 파트너를 찾아보세요!
        </p>

        <a href="${SITE_URL}/explore/students"
           style="display: inline-block; background: #2C3E50; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
          다른 파트너 찾기 →
        </a>

        ${emailFooter}
      </div>
    `,
  });
}

export async function sendProjectCompletedEmail({
  toEmail,
  toName,
  partnerName,
  shopName,
  projectId,
}: {
  toEmail: string;
  toName: string;
  partnerName: string;
  shopName: string;
  projectId: string;
}) {
  const safeToName = escapeHtml(toName);
  const safePartnerName = escapeHtml(partnerName);
  const safeShopName = escapeHtml(shopName);

  await getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to: toEmail,
    subject: `[${BRAND.NAME_KO}] ${shopName} 프로젝트가 완료됐습니다`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        ${emailHeader}

        <h2 style="font-size: 20px; color: #111827;">프로젝트 완료!</h2>
        <p style="color: #374151; line-height: 1.6;">
          안녕하세요, <strong>${safeToName}</strong>님!<br/>
          <strong>${safePartnerName}</strong>님과 진행한 <strong>${safeShopName}</strong> 프로젝트가 완료됐습니다.<br/>
          서로의 활동에 대한 리뷰를 남겨주세요.
        </p>

        <a href="${SITE_URL}/project/${projectId}"
           style="display: inline-block; background: #4A7C59; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
          리뷰 남기기 →
        </a>

        ${emailFooter}
      </div>
    `,
  });
}
