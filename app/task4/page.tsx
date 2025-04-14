import { ChatWindow } from "@/components/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";

export default function Home() {
  const InfoCard = (
    <GuideInfoBox image="/images/task4.png" title="Oppgave 4">
      <ul>
        <p>
          Feteste oppgaven. Her bruker vi agenter for å løse en oppgave. Så når du
          gjør et kall mot f.eks openai apiet sender du med noen argumenter for hvilke verktøy som
          er tilgjengelig for llmen. I denne oppgaven skal du sende med ett verktøy som handler om å hente intern
          data om tema x. Om du blir ferdig med oppgaven kan du utvide med web søk. Da kan du
          bruke følgende modell:
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
