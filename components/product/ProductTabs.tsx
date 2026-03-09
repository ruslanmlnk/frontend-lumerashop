"use client";

import { useMemo, useState } from "react";

type TabKey = "description" | "additional" | "reviews";

interface ProductTabsProps {
  contentHtml?: string;
  specifications?: Record<string, string>;
}

const ProductTabs = ({ contentHtml, specifications }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("description");
  const specEntries = useMemo(() => Object.entries(specifications ?? {}), [specifications]);

  return (
    <div className="w-full text-[#111111]">
      <div className="no-scrollbar flex w-full overflow-x-auto border-b border-[#d4d4d4] pt-[10px]">
        {[
          { key: "description", label: "Popis" },
          { key: "additional", label: "Další informace" },
          { key: "reviews", label: "Hodnocení (0)" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`relative whitespace-nowrap border border-b-0 px-[20px] py-[10px] text-[15px] transition ${
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
            className="animate-fadeIn text-[#111111] [&_blockquote]:border-l-[3px] [&_blockquote]:border-[#111111]/12 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:mb-5 [&_h1]:font-serif [&_h1]:text-[34px] [&_h1]:font-normal [&_h1]:leading-[1.1] [&_h1]:lg:text-[42px] [&_h2]:mb-4 [&_h2]:font-serif [&_h2]:text-[28px] [&_h2]:font-normal [&_h2]:leading-[1.15] [&_h3]:mb-3 [&_h3]:font-serif [&_h3]:text-[22px] [&_h3]:font-normal [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_p]:my-0 [&_p]:text-[16px] [&_p]:leading-[1.7] [&_p:not(:last-child)]:mb-4 [&_strong]:font-semibold [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: contentHtml || "" }}
          />
        )}

        {activeTab === "additional" && (
          <div className="animate-fadeIn">
            <h2 className="mb-[20px] font-serif text-[34px] font-normal leading-[1.1] lg:text-[42px]">
              {"Další informace"}
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
                {"Žádné další informace nejsou k dispozici."}
              </p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="animate-fadeIn">
            <h2 className="mb-[20px] font-serif text-[34px] font-normal leading-[1.1] lg:text-[42px]">
              {"Hodnocení"}
            </h2>
            <p className="text-[16px] leading-[1.6] text-[#111111]">
              {"Zatím zde nejsou žádné recenze."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
