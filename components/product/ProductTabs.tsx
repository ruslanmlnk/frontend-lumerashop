"use client";

import Link from "next/link";
import { Loader2, Star } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import type { ProductReview } from "@/types/site";

type TabKey = "description" | "additional" | "reviews";

type ProductTabsProps = {
  productId: string;
  contentHtml?: string;
  specifications?: Record<string, string>;
  reviews?: ProductReview[];
};

type ViewerUser = {
  email: string;
  firstName?: string;
  name?: string;
};

type ViewerState =
  | {
      status: "loading";
      user: null;
    }
  | {
      status: "authenticated";
      user: ViewerUser;
    }
  | {
      status: "anonymous";
      user: null;
    };

type AuthMeResponse = {
  user?: ViewerUser | null;
};

type ReviewSubmitResponse = {
  message?: string;
  error?: string;
};

type ReviewStarsProps = {
  value: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
};

const reviewDateFormatter = new Intl.DateTimeFormat("cs-CZ", {
  dateStyle: "long",
});

const formatReviewDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return null;
  }

  return reviewDateFormatter.format(new Date(timestamp));
};

const getViewerLabel = (user: ViewerUser | null) => {
  if (!user) {
    return "";
  }

  if (typeof user.firstName === "string" && user.firstName.trim().length > 0) {
    return user.firstName.trim();
  }

  if (typeof user.name === "string" && user.name.trim().length > 0) {
    return user.name.trim();
  }

  return user.email;
};

const ReviewStars = ({ value, interactive = false, onChange }: ReviewStarsProps) => {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const active = starValue <= value;
        const icon = (
          <Star
            className={`h-5 w-5 transition ${
              active ? "fill-[#c8a16a] text-[#c8a16a]" : "fill-transparent text-[#c9c2b8]"
            }`}
          />
        );

        if (!interactive) {
          return <span key={starValue}>{icon}</span>;
        }

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange?.(starValue)}
            className="rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-[#c8a16a]/40"
            aria-label={`Select ${starValue} star${starValue === 1 ? "" : "s"}`}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
};

const ProductTabs = ({ productId, contentHtml, specifications, reviews }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("description");
  const [viewer, setViewer] = useState<ViewerState>({ status: "loading", user: null });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const specEntries = useMemo(() => Object.entries(specifications ?? {}), [specifications]);
  const approvedReviews = reviews ?? [];
  const viewerLabel = getViewerLabel(viewer.user);

  useEffect(() => {
    if (activeTab !== "reviews" || viewer.status !== "loading") {
      return;
    }

    let cancelled = false;

    const loadViewer = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as AuthMeResponse | null;

        if (cancelled) {
          return;
        }

        if (payload?.user) {
          setViewer({ status: "authenticated", user: payload.user });
          return;
        }

        setViewer({ status: "anonymous", user: null });
      } catch {
        if (!cancelled) {
          setViewer({ status: "anonymous", user: null });
        }
      }
    };

    void loadViewer();

    return () => {
      cancelled = true;
    };
  }, [activeTab, viewer.status]);

  const handleReviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedComment = comment.trim();
    if (trimmedComment.length < 3) {
      setSuccessMessage("");
      setErrorMessage("Text recenze musí mít alespoň 3 znaky.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment: trimmedComment,
        }),
      });

      const payload = (await response.json().catch(() => null)) as ReviewSubmitResponse | null;

      if (!response.ok) {
        setErrorMessage(payload?.error || "Momentálně nelze odeslat recenzi.");
        return;
      }

      setComment("");
      setRating(5);
      setSuccessMessage(payload?.message || "Recenze byla úspěšně odeslána a čeká na schválení.");
    } catch {
      setErrorMessage("Momentálně nelze odeslat recenzi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full text-[#111111]">
      <div className="grid w-full grid-cols-3 border-b border-[#d4d4d4] pt-[10px] md:no-scrollbar md:flex md:overflow-x-auto">
        {[
          { key: "description", label: "Popis" },
          { key: "additional", label: "Další informace" },
          { key: "reviews", label: `Hodnocení (${approvedReviews.length})` },
        ].map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`relative min-w-0 border border-b-0 px-3 py-3 text-center text-[13px] leading-[1.2] transition sm:px-4 sm:text-[14px] md:whitespace-nowrap md:px-[20px] md:py-[10px] md:text-[15px] ${
                isActive
                  ? "translate-y-[1px] border-[#cccccc] bg-[#f2f2f2] text-[#111111]"
                  : "translate-y-[1px] border-transparent bg-transparent text-[#333333] hover:text-[#111111]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="py-[40px]">
        {activeTab === "description" && (
          <div
            className="animate-fadeIn text-[#111111] [&_blockquote]:border-l-[3px] [&_blockquote]:border-[#111111]/12 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:mb-5 [&_h1]:font-serif [&_h1]:text-[34px] [&_h1]:font-normal [&_h1]:leading-[1.1] [&_h1]:lg:text-[42px] [&_h2]:mb-4 [&_h2]:font-serif [&_h2]:text-[28px] [&_h2]:font-normal [&_h2]:leading-[1.15] [&_h3]:mb-3 [&_h3]:font-serif [&_h3]:text-[22px] [&_h3]:font-normal [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_p]:my-0 [&_p]:text-[16px] [&_p]:leading-[1.7] [&_p:not(:last-child)]:mb-4 [&_strong]:font-bold [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: contentHtml || "" }}
          />
        )}

        {activeTab === "additional" && (
          <div className="animate-fadeIn">
            <h2 className="mb-[20px] font-serif text-[34px] font-normal leading-[1.1] lg:text-[42px]">
              Další informace
            </h2>
            {specEntries.length > 0 ? (
              <div className="overflow-hidden border border-[#ececec]">
                {specEntries.map(([key, value], index) => (
                  <div
                    key={key}
                    className={`grid grid-cols-[220px_1fr] gap-4 px-5 py-3 text-[15px] ${
                      index % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                    }`}
                  >
                    <span className="font-semibold">{key}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[16px] leading-[1.6] text-[#111111]">
                Žádné další informace nejsou k dispozici.
              </p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="animate-fadeIn">
            <h2 className="mb-[20px] font-serif text-[34px] font-normal leading-[1.1] lg:text-[42px]">
              Hodnocení
            </h2>

            {approvedReviews.length > 0 ? (
              <div className="grid gap-4">
                {approvedReviews.map((review) => {
                  const formattedDate = formatReviewDate(review.submittedAt);

                  return (
                    <article
                      key={review.id}
                      className="rounded-[18px] border border-[#111111]/10 bg-[#faf7f2] p-5 md:p-6"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-[16px] font-semibold text-[#111111]">{review.author}</p>
                          {formattedDate && (
                            <time className="mt-1 block text-[13px] text-[#6b645d]" dateTime={review.submittedAt}>
                              {formattedDate}
                            </time>
                          )}
                        </div>
                        <ReviewStars value={review.rating} />
                      </div>

                      <p className="mt-4 text-[15px] leading-[1.7] text-[#302b27]">{review.comment}</p>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="text-[16px] leading-[1.6] text-[#111111]">
                Zatím tu nejsou žádné schválené recenze.
              </p>
            )}

            <div className="mt-10 border-t border-[#111111]/10 pt-8">
              <h3 className="font-serif text-[28px] font-normal leading-[1.15] text-[#111111]">
                Napiš vlastní recenzi
              </h3>

              {viewer.status === "loading" ? (
                <div className="mt-4 flex items-center gap-3 text-[15px] text-[#5f584e]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Kontroluji přihlášení...</span>
                </div>
              ) : viewer.status === "anonymous" ? (
                <div className="mt-4 rounded-[18px] border border-[#111111]/10 bg-[#fffaf3] p-5 text-[15px] leading-[1.7] text-[#3c352f]">
                  Pro odeslání recenze se prosím{" "}
                  <Link href="/my-account" className="font-semibold text-[#c8a16a] underline-offset-4 hover:underline">
                    přihlas
                  </Link>
                  .
                </div>
              ) : (
                <form className="mt-5 grid gap-5" onSubmit={handleReviewSubmit}>
                  <div className="rounded-[18px] border border-[#111111]/10 bg-white p-5 md:p-6">
                    <p className="text-[14px] font-medium uppercase tracking-[0.18em] text-[#7f776e]">
                      Přihlášen jako
                    </p>
                    <p className="mt-2 text-[16px] text-[#111111]">{viewerLabel}</p>
                  </div>

                  <div>
                    <label className="mb-3 block text-[15px] font-medium text-[#111111]">
                      Tvoje hodnocení
                    </label>
                    <ReviewStars value={rating} interactive onChange={setRating} />
                    <p className="mt-2 text-[13px] text-[#6b645d]">{rating} z 5 hvězd</p>
                  </div>

                  <div>
                    <label htmlFor="product-review-comment" className="mb-3 block text-[15px] font-medium text-[#111111]">
                      Tvoje recenze
                    </label>
                    <textarea
                      id="product-review-comment"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      placeholder="Co se ti na produktu líbí? Jak jsi spokojen(a)?"
                      rows={5}
                      maxLength={2000}
                      className="min-h-[148px] w-full rounded-[18px] border border-[#d8d1c8] bg-white px-4 py-3 text-[15px] leading-[1.7] text-[#111111] outline-none transition focus:border-[#c8a16a]"
                    />
                    <p className="mt-2 text-[13px] text-[#6b645d]">{comment.trim().length}/2000</p>
                  </div>

                  {errorMessage && (
                    <p className="rounded-[14px] border border-[#d97c7c]/30 bg-[#fff3f3] px-4 py-3 text-[14px] text-[#9a3f3f]">
                      {errorMessage}
                    </p>
                  )}

                  {successMessage && (
                    <p className="rounded-[14px] border border-[#9cc9a7]/40 bg-[#f4fbf5] px-4 py-3 text-[14px] text-[#2d6a3d]">
                      {successMessage}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-full bg-[#111111] px-6 py-3 text-[13px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#2d2d2d] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Odesílám...
                        </>
                      ) : (
                        "Odeslat recenzi"
                      )}
                    </button>

                    {/* <p className="text-[13px] leading-[1.6] text-[#6b645d]">
                      Recenze se na webu zobrazi az po schvaleni v administraci.
                    </p> */}
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
