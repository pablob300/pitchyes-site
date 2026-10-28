import Image from "next/image";
import type { CaseStoryItem } from "@/content/types";
import type { EditFn } from "@/lib/content/edit";
import { youtubeId } from "@/lib/content/landing";
import styles from "./blocks.module.css";
import { VideoFacade } from "./VideoFacade";

// Um case num container com borda suave: vídeo (ou foto) à esquerda, texto à direita. Sem
// mídia, o texto ocupa o container inteiro. Usado no bloco "caseStories" das páginas
// internas (vários, empilhados) e no destaque da home (components/home/CaseHighlight.tsx).
// Referência visual: System/components/case-story.html.
export function CaseStory({
  item,
  e,
  heading: Heading = "h3",
}: {
  item: CaseStoryItem;
  /** Ponteiros relativos ao case ("title", "paragraphs"…). */
  e: EditFn;
  heading?: "h2" | "h3";
}) {
  const video = item.videoId ? youtubeId(item.videoId) : null;
  const alt = item.alt?.trim() || item.title;
  const media = video ? (
    <VideoFacade id={video} alt={alt} />
  ) : item.image ? (
    <Image src={item.image} alt={alt} width={1280} height={720} sizes="(max-width: 900px) 100vw, 560px" className={styles.caseImage} />
  ) : null;

  return (
    <article className={styles.caseStory} data-media={media ? "" : undefined} data-reveal>
      {media && (
        <div className={styles.caseMedia} {...e(video ? "videoId" : "image")}>
          {media}
        </div>
      )}
      <div className={styles.caseText}>
        {item.eyebrow && (
          <p className="eyebrow" {...e("eyebrow")}>
            {item.eyebrow}
          </p>
        )}
        <Heading {...e("title")}>{item.title}</Heading>
        {item.paragraphs.map((p, i) => (
          <p key={`${i}-${p.slice(0, 24)}`} {...e("paragraphs")}>
            {p}
          </p>
        ))}
      </div>
    </article>
  );
}
