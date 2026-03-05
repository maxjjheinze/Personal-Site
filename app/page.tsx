import { Hero } from "@/components/hero/Hero";
import { PixelIntro } from "@/components/intro/PixelIntro";

export default function Home() {
  return (
    <main>
      <PixelIntro>
        <Hero />
      </PixelIntro>
    </main>
  );
}
