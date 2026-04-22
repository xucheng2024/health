"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QuotationDocument } from "@/components/quotation/quotation-document";
import { QuotationSignaturePad } from "@/components/quotation/quotation-signature-pad";

type Plan = {
  id: string;
  name: string;
  description: string;
  features: string[];
};

type SignApiQuote = {
  quoteNo: string;
  planId: string;
  status: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
  unitPrice: number;
  qty: number;
  discount: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  createdAt: string;
  signingTokenExpiresAt: string | null;
};

type SignedInfo = {
  signerName: string;
  signedAt: string;
  signatureImage: string;
  documentHash: string | null;
};

type SignPayload = {
  status: string;
  canSign: boolean;
  tokenExpired: boolean;
  quote: SignApiQuote;
  plan: Plan;
  snapshot?: {
    planTermsSummary: string[];
    legalTermsText: string;
    signerName: string;
    signedAt: string;
  };
  signed?: SignedInfo;
};

function statusLabel(payload: SignPayload): string {
  if (payload.tokenExpired && payload.status !== "signed") {
    return "Link expired / 链接已过期";
  }
  const map: Record<string, string> = {
    draft: "Draft / 草稿",
    sent: "Sent — awaiting signature / 已发送，待签署",
    signed: "Signed / 已签署",
    expired: "Expired / 已过期",
    cancelled: "Cancelled / 已取消",
  };
  return map[payload.status] ?? payload.status;
}

export function QuotationSignClient({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<SignPayload | null>(null);
  const [signerName, setSignerName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [signatureBlank, setSignatureBlank] = useState(true);
  const [justSigned, setJustSigned] = useState(false);

  const onSignatureChange = useCallback((dataUrl: string | null, blank: boolean) => {
    setSignature(dataUrl);
    setSignatureBlank(blank);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/quotes/sign/${encodeURIComponent(token)}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as SignPayload & { error?: string; message?: string };
      if (!res.ok) {
        setPayload(null);
        setError(data.message ?? data.error ?? "Unable to load quotation.");
        return;
      }
      setPayload(data as SignPayload);
    } catch {
      setError("Network error while loading the quotation.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const readonlyProps = useMemo(() => {
    if (!payload) return null;
    return {
      quote: { ...payload.quote, status: payload.status },
      plan: payload.plan,
      statusLabel: statusLabel(payload),
      planTermsSummary: payload.snapshot?.planTermsSummary,
      legalTermsText: payload.snapshot?.legalTermsText,
    };
  }, [payload]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload?.canSign || submitting) return;

    if (!signerName.trim()) {
      setError("Please enter the signer name. / 请填写签署人姓名。");
      return;
    }
    if (!agreed) {
      setError("Please confirm you have read and accept the terms. / 请勾选同意条款。");
      return;
    }
    if (!signature || signatureBlank) {
      setError("Please sign in the signature area. / 请在签名区签名。");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/quotes/sign/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: signerName.trim(),
          signatureData: signature,
          agreedToTerms: true,
        }),
      });
      const data = (await res.json()) as SignPayload & { error?: string; message?: string };
      if (!res.ok) {
        setError(data.message ?? data.error ?? "Signing failed.");
        return;
      }
      setPayload(data as SignPayload);
      setJustSigned(true);
    } catch {
      setError("Network error while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-[#003F73]">
        <p className="text-sm font-medium">Loading quotation… / 正在加载报价单…</p>
      </div>
    );
  }

  if (error && !payload) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </p>
      </div>
    );
  }

  if (!payload || !readonlyProps) return null;

  const signed = payload.signed;
  const showSigned = Boolean(signed) && !payload.canSign;
  const showForm = payload.canSign && !showSigned;
  const pdfHref = `/api/public/quotes/sign/${encodeURIComponent(token)}/pdf`;

  return (
    <div className="pb-16">
      <QuotationDocument mode="readonly" {...readonlyProps} />

      <div className="mx-auto mt-8 max-w-[52rem] px-3 sm:px-6">
        {error ? (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {error}
          </p>
        ) : null}

        {showSigned && signed ? (
          <section className="rounded-2xl border border-emerald-200/90 bg-emerald-50/50 px-4 py-6 shadow-sm sm:px-8">
            <h2 className="text-lg font-semibold text-[#003F73]">
              {justSigned ? "Signed successfully / 签署成功" : "Already signed / 已签署"}
            </h2>
            <dl className="mt-4 space-y-2 text-[15px] text-[#303030]">
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-[#003F73]">Quotation No.</dt>
                <dd>{payload.quote.quoteNo}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-[#003F73]">Signer / 签署人</dt>
                <dd>{signed.signerName}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-[#003F73]">Signed at / 签署时间</dt>
                <dd>{new Date(signed.signedAt).toLocaleString("en-SG")}</dd>
              </div>
              {signed.documentHash ? (
                <div className="flex flex-wrap gap-x-2 break-all">
                  <dt className="font-medium text-[#003F73]">Document hash</dt>
                  <dd className="font-mono text-xs">{signed.documentHash}</dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-medium text-[#003F73]">Signature on file</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={signed.signatureImage}
                alt="Signature"
                className="mt-2 max-h-40 w-auto object-contain"
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={pdfHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#003F73] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#003F73]/20 transition-opacity hover:opacity-[0.95]"
              >
                Download Signed PDF
              </a>
              <a
                href={pdfHref}
                download
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#003F73]/25 bg-white px-4 py-2 text-sm font-semibold text-[#003F73] transition-colors hover:bg-slate-50"
              >
                Save File
              </a>
            </div>
          </section>
        ) : null}

        {showForm ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200/90 bg-white px-4 py-6 shadow-sm sm:px-8"
          >
            <h2 className="text-lg font-semibold text-[#003F73]">Electronic signature / 电子签署</h2>
            <p className="mt-2 text-sm text-[#303030]/80">
              Enter your name as it should appear on the signed quotation, confirm the terms, then
              sign below.
            </p>

            <label className="mt-6 block text-sm font-medium text-[#003F73]">
              Signer name / 签署人姓名
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-[15px] text-[#303030] outline-none ring-[#003F73]/30 focus:border-[#003F73] focus:ring-2"
                autoComplete="name"
                required
              />
            </label>

            <label className="mt-5 flex cursor-pointer items-start gap-3 text-[15px] text-[#303030]">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 size-4 shrink-0 rounded border-slate-300 text-[#003F73] accent-[#003F73]"
              />
              <span>
                I have read and agree to the terms and conditions above. /
                本人已阅读并同意上述条款与条件。
              </span>
            </label>

            <div className="mt-6">
              <p className="text-sm font-medium text-[#003F73]">Signature / 签名</p>
              <QuotationSignaturePad className="mt-2" onChange={onSignatureChange} />
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={submitting}
                className="min-h-12 w-full rounded-lg bg-[#003F73] px-5 text-sm font-semibold tracking-wide text-white shadow-md shadow-[#003F73]/25 transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-h-0 sm:py-3 sm:px-8"
              >
                {submitting ? "Submitting… / 提交中…" : "Submit signature / 提交签署"}
              </button>
            </div>
          </form>
        ) : null}

        {!showForm && !showSigned && payload.tokenExpired ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#303030]">
            This signing link has expired. Please contact HealthOptix for a new link. /
            此签署链接已过期，请联系 HealthOptix 获取新链接。
          </p>
        ) : null}
      </div>
    </div>
  );
}
