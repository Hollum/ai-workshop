import { ChatWindow } from "@/components/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";

export default function Home() {
  const InfoCard = (
    <GuideInfoBox image="/images/task1.png" title="Oppgave 1">
      <ul>
        <p>
          Denne oppgaven handler om å bli kjent med langchain og langgraph. Gå til{" "}
          <code>graph1.ts</code>
          og implementer grafen/noden for å generere output.
        </p>
        <p>
          Se hjelpefunksjoner i <code>utils/mappers.ts</code>
        </p>
      </ul>
    </GuideInfoBox>
  );
  return (
    <ChatWindow
      endpoint="api/chat/task1"
      emptyStateComponent={InfoCard}
      showIntermediateStepsToggle={true}
    />
  );
}
