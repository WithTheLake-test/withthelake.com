import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/Button";
import Container from "@/components/Container";
import { IconExternal } from "@/components/Icons";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { getContent } from "@/lib/cms/store";

export async function generateMetadata(): Promise<Metadata> {
  const { productGuide } = await getContent();
  return productGuide.meta;
}

export default async function ProductGuidePage() {
  const { site, productGuide: guide } = await getContent();
  const { title, lead, eyebrow } = guide.header;

  return (
    <>
      <PageHeader title={title} lead={lead} eyebrow={eyebrow} crumbs={[{ label: "STORE", href: "/store" }, { label: title }]}>
        <nav aria-label="제품 바로가기" className="flex flex-wrap gap-2">
          {guide.products.map((product, index) => (
            <a
              key={product.name}
              href={`#product-${index + 1}`}
              className="rounded-full border border-white/40 px-4 py-2 text-[14px] font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              {product.name}
            </a>
          ))}
        </nav>
      </PageHeader>

      <section className="section bg-surface">
        <Container>
          <div className="space-y-16 md:space-y-24">
            {guide.products.map((product, index) => (
              <Reveal key={product.name}>
                <article id={`product-${index + 1}`} className="grid scroll-mt-28 items-center gap-8 md:grid-cols-2 md:gap-14">
                  <div className={`relative aspect-[33/20] overflow-hidden rounded-[16px] bg-cream ${index % 2 === 1 ? "md:order-2" : ""}`}>
                    {product.image && <Image src={product.image} alt={product.imageAlt} fill sizes="(min-width:768px) 560px, 100vw" className="object-cover" />}
                  </div>
                  <div>
                    <p className="font-display text-[15px] font-bold text-primary">{String(index + 1).padStart(2, "0")}</p>
                    <h2 className="t-h3 mt-2 text-ink">{product.name}</h2>
                    {product.ingredients && <p className="t-meta mt-3 text-[15px] font-semibold text-accent-deep">{product.ingredients}</p>}
                    <p className="t-body mt-3 text-ink-2">{product.description}</p>
                    <div className="mt-6 rounded-[12px] bg-primary-light p-6">
                      <p className="text-[15px] font-bold text-primary">사용 방법</p>
                      <ol className="mt-4 space-y-3">
                        {product.steps.map((step, stepIndex) => (
                          <li key={step} className="flex gap-3 text-[16px] leading-relaxed text-ink-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[14px] font-bold text-white">{stepIndex + 1}</span>
                            <span className="pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    {product.storeUrl && (
                      <a href={product.storeUrl} target="_blank" rel="noreferrer" className="t-meta mt-5 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-primary hover:text-primary-dark">
                        스마트스토어에서 보기 <IconExternal size={14} />
                      </a>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="section bg-cream">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="rounded-[12px] border border-line bg-white px-6 py-5 text-left">
              <p className="text-[15px] font-bold text-ink">주의사항</p>
              <ul className="mt-2 space-y-1.5">
                {guide.warnings.map((warning) => (
                  <li key={warning} className="flex gap-2 text-[15px] leading-relaxed text-muted">
                    <span aria-hidden>·</span><span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10">
              <Button href={site.links.store} size="lg" external arrow>위드웰미 스토어 구경하기</Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
