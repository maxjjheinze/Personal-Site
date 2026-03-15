import { Hero } from "@/components/hero/Hero";
import { ProjectsSection } from "@/components/projects/ProjectsSection";
import { PixelIntro } from "@/components/intro/PixelIntro";

export default function Home() {
  return (
    <main id="main-content">
      <PixelIntro>
        <Hero />
        <ProjectsSection />
      </PixelIntro>
    </main>
  );
}
