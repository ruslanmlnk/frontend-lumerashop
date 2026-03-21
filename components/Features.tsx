'use client';
import Image from 'next/image';
import { Feature } from '../types/site';
import { FEATURES_DATA } from '../data/site-data';

const FeatureItem = ({ feature }: { feature: Feature }) => {
    return (
        <div
            className="text-center p-2.5 flex flex-col items-center"
        >
            <div className="w-[52px] h-[52px] md:w-[64px] md:h-[64px] relative mx-auto mb-5 md:mb-[30px]">
                <Image
                    src={feature.icon}
                    alt={feature.title}
                    fill
                    className="object-contain"
                />
            </div>
            <h3
                className="text-[20px] md:text-[24px] font-serif font-bold mb-[10px] text-[#111111] leading-[1.2]"
                style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
                {feature.title}
            </h3>
            <p
                className="text-[#8d97a8] text-[14px] md:text-[16px] leading-[1.6] font-normal mt-0"
                style={{ fontFamily: '"Work Sans", sans-serif' }}
            >
                {feature.description}
            </p>
        </div>
    );
};

const Features = () => {
    return (
        <section className="bg-transparent relative overflow-hidden" id="block-7">
            <div className="lumera-container relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px] sm:gap-[20px]">
                    {FEATURES_DATA.map((feature) => (
                        <FeatureItem
                            key={feature.id}
                            feature={feature}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
