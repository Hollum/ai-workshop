import { ChatWindow } from "@/components/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";

export default function Home() {
  const InfoCard = (
    <GuideInfoBox image="/images/task4.png" title="Oppgave 5">
      <ul>
        <p>
          Basert på oppgave 4 kan du utvide med listen over tilgjeneglige verktøy med web søk. Du
          kan bruke følgende modell til å søke på nettet:
          <code>https://platform.openai.com/docs/guides/tools-web-search?api-mode=chat</code>
        </p>
      </ul>
    </GuideInfoBox>
  );
  return (
    <ChatWindow
      endpoint="api/chat/task4"
      emptyStateComponent={InfoCard}
      showIngestForm={true}
      showIntermediateStepsToggle={true}
    />
  );
}
