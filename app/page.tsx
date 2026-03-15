import { Hero } from "@/components/hero/Hero";
import { PixelIntro } from "@/components/intro/PixelIntro";

export default function Home() {
  return (
    <main id="main-content">
      <PixelIntro>
        <Hero />
      </PixelIntro>
    </main>
  );
}
